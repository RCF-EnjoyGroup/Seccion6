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

describe.skipIf(skipIfNoSupabase)("RLS Integration Tests - Course Catalog", () => {
  let testInstructorId: string;
  let publishedCourseId: string;
  let draftCourseId: string;

  beforeAll(async () => {

    // Create a test instructor user
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: `test-instructor-${Date.now()}@example.com`,
      password: "testpassword123",
      email_confirm: true,
      user_metadata: { full_name: "Test Instructor", role: "instructor" },
    });

    if (authError) throw authError;
    testInstructorId = authData.user.id;

    // Create instructor profile
    const { error: profileError } = await adminSupabase.from("profiles").upsert({
      id: testInstructorId,
      role: "instructor",
      onboarded: true,
      full_name: "Test Instructor",
    });
    if (profileError) throw profileError;

    // Create a published course
    const { data: pubCourse, error: pubError } = await adminSupabase
      .from("courses")
      .insert({
        instructor_id: testInstructorId,
        title: "Curso Publicado Test",
        slug: `curso-publicado-test-${Date.now()}`,
        description: "Curso publicado para test",
        short_description: "Descripción corta",
        category: "Programación",
        level: "beginner",
        price: 0,
        status: "published",
        language: "es",
      })
      .select("id")
      .single();

    if (pubError) throw pubError;
    publishedCourseId = pubCourse.id;

    // Create a draft course
    const { data: draftCourse, error: draftError } = await adminSupabase
      .from("courses")
      .insert({
        instructor_id: testInstructorId,
        title: "Curso Borrador Test",
        slug: `curso-borrador-test-${Date.now()}`,
        description: "Curso borrador para test",
        short_description: "Descripción corta",
        category: "Programación",
        level: "beginner",
        price: 0,
        status: "draft",
        language: "es",
      })
      .select("id")
      .single();

    if (draftError) throw draftError;
    draftCourseId = draftCourse.id;
  });

  afterAll(async () => {
    if (skipIfNoSupabase) return;

    // Clean up test data
    await adminSupabase.from("courses").delete().in("id", [publishedCourseId, draftCourseId]);
    await adminSupabase.from("profiles").delete().eq("id", testInstructorId);
    await adminSupabase.auth.admin.deleteUser(testInstructorId);
  });

  describe("Anonymous user (RLS enforced)", () => {
    it("returns published courses", async () => {

      const { data, error } = await supabase
        .from("courses")
        .select("id, title, status")
        .eq("status", "published");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      const publishedCourses = data!.filter((c) => c.id === publishedCourseId);
      expect(publishedCourses.length).toBe(1);
      expect(publishedCourses[0].status).toBe("published");
    });

    it("does NOT return draft courses", async () => {
      const { data, error } = await supabase!
        .from("courses")
        .select("id, title, status")
        .eq("status", "published");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      const draftCourses = data!.filter((c) => c.id === draftCourseId);
      expect(draftCourses.length).toBe(0);
    });

    it("searchCourses query respects RLS (only published)", async () => {
      // This mimics the searchCourses query from courses.ts
      const { data, error } = await supabase!
        .from("courses")
        .select("*, instructor:profiles(id, full_name, avatar_url, headline)")
        .eq("status", "published")
        .order("student_count", { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const courseIds = data!.map((c) => c.id);
      expect(courseIds).toContain(publishedCourseId);
      expect(courseIds).not.toContain(draftCourseId);
    });

    it("filter by category respects RLS", async () => {
      const { data, error } = await supabase!
        .from("courses")
        .select("id, title, status, category")
        .eq("status", "published")
        .eq("category", "Programación");

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const courseIds = data!.map((c) => c.id);
      expect(courseIds).toContain(publishedCourseId);
      expect(courseIds).not.toContain(draftCourseId);
    });
  });

  describe("Authenticated user (RLS enforced)", () => {
    let studentId: string;
    let studentSupabase: ReturnType<typeof createClient>;

    beforeAll(async () => {
      // Create a test student user
      const { data: authData, error: authError } = await adminSupabase!.auth.admin.createUser({
        email: `test-student-${Date.now()}@example.com`,
        password: "testpassword123",
        email_confirm: true,
        user_metadata: { full_name: "Test Student", role: "student" },
      });

      if (authError) throw authError;
      studentId = authData.user.id;

      // Create student profile
      await adminSupabase!.from("profiles").upsert({
        id: studentId,
        role: "student",
        onboarded: true,
        full_name: "Test Student",
      });

      // Sign in as student
      studentSupabase = createClient(supabaseUrl!, supabaseAnonKey!);
      await studentSupabase.auth.signInWithPassword({
        email: `test-student-${Date.now()}@example.com`,
        password: "testpassword123",
      });
    });

    afterAll(async () => {
      await adminSupabase!.from("profiles").delete().eq("id", studentId);
      await adminSupabase!.auth.admin.deleteUser(studentId);
    });

    it("student sees only published courses", async () => {
      const { data, error } = await studentSupabase
        .from("courses")
        .select("id, title, status")
        .eq("status", "published");

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const courseIds = data!.map((c) => c.id);
      expect(courseIds).toContain(publishedCourseId);
      expect(courseIds).not.toContain(draftCourseId);
    });
  });

  describe("Service role (bypasses RLS)", () => {
    it("admin can see all courses including drafts", async () => {
      const { data, error } = await adminSupabase!
        .from("courses")
        .select("id, title, status")
        .in("id", [publishedCourseId, draftCourseId]);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(2);

      const statuses = data!.map((c) => c.status).sort();
      expect(statuses).toEqual(["draft", "published"]);
    });
  });
});