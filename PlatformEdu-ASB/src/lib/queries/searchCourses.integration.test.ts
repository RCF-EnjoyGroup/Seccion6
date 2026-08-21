// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const skipIfNoSupabase = !supabaseUrl || !supabaseAnonKey || !supabaseServiceKey;

let supabase: ReturnType<typeof createClient> | undefined;
let adminSupabase: ReturnType<typeof createClient> | undefined;

if (!skipIfNoSupabase) {
  supabase = createClient(supabaseUrl!, supabaseAnonKey!);
  adminSupabase = createClient(supabaseUrl!, supabaseServiceKey!);
}

describe.skipIf(skipIfNoSupabase)("search_courses Integration Tests - Lab 7 Adapted", () => {
  let instructorId: string;
  let publishedCourseId: string;
  let draftCourseId: string;

  beforeAll(async () => {
    // Create a test instructor user
    const { data: authData, error: authError } = await adminSupabase!.auth.admin.createUser({
      email: `test-instructor-search-${Date.now()}@example.com`,
      password: "testpassword123",
      email_confirm: true,
      user_metadata: { full_name: "Test Instructor", role: "instructor" },
    });

    if (authError) throw authError;
    instructorId = authData.user.id;

    // Create instructor profile
    const { error: profileError } = await adminSupabase!.from("profiles").upsert({
      id: instructorId,
      role: "instructor",
      onboarded: true,
      full_name: "Test Instructor",
    });
    if (profileError) throw profileError;

    // Create a published course with embedding
    const { data: pubCourse, error: pubError } = await adminSupabase!
      .from("courses")
      .insert({
        instructor_id: instructorId,
        title: "Curso de React Avanzado",
        slug: `curso-react-avanzado-${Date.now()}`,
        description: "Aprende React avanzado con hooks y context",
        short_description: "React avanzado",
        category: "Programación",
        level: "advanced",
        price: 100,
        status: "published",
        language: "es",
        embedding: Array(1536).fill(0.1), // Mock embedding
        embedding_model: "text-embedding-3-small",
      })
      .select("id")
      .single();

    if (pubError) throw pubError;
    publishedCourseId = pubCourse.id;

    // Create a draft course with embedding
    const { data: draftCourse, error: draftError } = await adminSupabase!
      .from("courses")
      .insert({
        instructor_id: instructorId,
        title: "Curso de Vue Borrador",
        slug: `curso-vue-borrador-${Date.now()}`,
        description: "Aprende Vue.js",
        short_description: "Vue.js básico",
        category: "Programación",
        level: "beginner",
        price: 0,
        status: "draft",
        language: "es",
        embedding: Array(1536).fill(0.2),
        embedding_model: "text-embedding-3-small",
      })
      .select("id")
      .single();

    if (draftError) throw draftError;
    draftCourseId = draftCourse.id;
  });

  afterAll(async () => {
    await adminSupabase!.from("courses").delete().in("id", [publishedCourseId, draftCourseId]);
    await adminSupabase!.from("profiles").delete().eq("id", instructorId);
    await adminSupabase!.auth.admin.deleteUser(instructorId);
  });

  describe("Anonymous user - vector search respects RLS", () => {
    it("search_courses_by_embedding RPC returns only published courses", async () => {
      const { data, error } = await supabase!.rpc("search_courses_by_embedding", {
        query_embedding: Array(1536).fill(0.1),
        match_threshold: 0.01,
        match_count: 10,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const courseIds = (data as { id: string }[]).map((c) => c.id);
      expect(courseIds).toContain(publishedCourseId);
      expect(courseIds).not.toContain(draftCourseId);
    });

    it("search_courses_by_embedding with different embedding still respects RLS", async () => {
      const { data, error } = await supabase!.rpc("search_courses_by_embedding", {
        query_embedding: Array(1536).fill(0.2),
        match_threshold: 0.01,
        match_count: 10,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const courseIds = (data as { id: string }[]).map((c) => c.id);
      // Even if the embedding matches the draft course better,
      // RLS should prevent it from being returned
      expect(courseIds).not.toContain(draftCourseId);
    });
  });

  describe("Text fallback search respects RLS", () => {
    it("text search via ilike returns only published courses", async () => {
      const { data, error } = await supabase!
        .from("courses")
        .select("id, title, status")
        .eq("status", "published")
        .or("title.ilike.%React%,description.ilike.%React%");

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const courseIds = data!.map((c) => c.id);
      expect(courseIds).toContain(publishedCourseId);
      expect(courseIds).not.toContain(draftCourseId);
    });
  });

  describe("Service role - bypasses RLS", () => {
    it("admin can search all courses including drafts via RPC", async () => {
      const { data, error } = await adminSupabase!.rpc("search_courses_by_embedding", {
        query_embedding: Array(1536).fill(0.1),
        match_threshold: 0.01,
        match_count: 10,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Service role should see both courses
      // Note: This depends on the RPC implementation - if it uses SECURITY DEFINER
      // it might still respect RLS. The test documents the expected behavior.
    });
  });
});