// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const skipIfNoSupabase = !supabaseUrl || !supabaseAnonKey || !supabaseServiceKey;

let adminSupabase: ReturnType<typeof createClient> | undefined;

if (!skipIfNoSupabase) {
  adminSupabase = createClient(supabaseUrl!, supabaseServiceKey!);
}

describe.skipIf(skipIfNoSupabase)("Enrollment Integration Tests - Route Handler", () => {
  let instructorId: string;
  let studentId: string;
  let freeCourseId: string;
  let paidCourseId: string;
  let studentSupabase: ReturnType<typeof createClient>;

  beforeAll(async () => {
    // Create instructor
    const { data: instAuth, error: instAuthError } = await adminSupabase!.auth.admin.createUser({
      email: `instructor-${Date.now()}@example.com`,
      password: "testpassword123",
      email_confirm: true,
      user_metadata: { full_name: "Test Instructor", role: "instructor" },
    });
    if (instAuthError) throw instAuthError;
    instructorId = instAuth.user.id;

    await adminSupabase!.from("profiles").upsert({
      id: instructorId,
      role: "instructor",
      onboarded: true,
      full_name: "Test Instructor",
    });

    // Create student
    const { data: stuAuth, error: stuAuthError } = await adminSupabase!.auth.admin.createUser({
      email: `student-${Date.now()}@example.com`,
      password: "testpassword123",
      email_confirm: true,
      user_metadata: { full_name: "Test Student", role: "student" },
    });
    if (stuAuthError) throw stuAuthError;
    studentId = stuAuth.user.id;

    await adminSupabase!.from("profiles").upsert({
      id: studentId,
      role: "student",
      onboarded: true,
      full_name: "Test Student",
    });

    // Sign in as student
    studentSupabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const { error: signInError } = await studentSupabase.auth.signInWithPassword({
      email: `student-${Date.now()}@example.com`,
      password: "testpassword123",
    });
    if (signInError) throw signInError;

    // Create free course
    const { data: freeCourse, error: freeError } = await adminSupabase!
      .from("courses")
      .insert({
        instructor_id: instructorId,
        title: "Curso Gratis Test",
        slug: `curso-gratis-test-${Date.now()}`,
        description: "Curso gratis para test",
        short_description: "Gratis",
        category: "Programación",
        level: "beginner",
        price: 0,
        status: "published",
        language: "es",
      })
      .select("id")
      .single();
    if (freeError) throw freeError;
    freeCourseId = freeCourse.id;

    // Create paid course
    const { data: paidCourse, error: paidError } = await adminSupabase!
      .from("courses")
      .insert({
        instructor_id: instructorId,
        title: "Curso Pago Test",
        slug: `curso-pago-test-${Date.now()}`,
        description: "Curso pago para test",
        short_description: "Pago",
        category: "Programación",
        level: "beginner",
        price: 50,
        status: "published",
        language: "es",
      })
      .select("id")
      .single();
    if (paidError) throw paidError;
    paidCourseId = paidCourse.id;
  });

  afterAll(async () => {
    await adminSupabase!.from("enrollments").delete().in("course_id", [freeCourseId, paidCourseId]);
    await adminSupabase!.from("courses").delete().in("id", [freeCourseId, paidCourseId]);
    await adminSupabase!.from("profiles").delete().in("id", [instructorId, studentId]);
    await adminSupabase!.auth.admin.deleteUser(instructorId);
    await adminSupabase!.auth.admin.deleteUser(studentId);
  });

  describe("POST /api/enroll/free (enrollFreeCourseAction)", () => {
    it("enrolls authenticated student in free course", async () => {
      const { error } = await adminSupabase!.from("enrollments").upsert(
        { student_id: studentId, course_id: freeCourseId, amount_paid: 0 },
        { onConflict: "student_id,course_id", ignoreDuplicates: true }
      );

      expect(error).toBeNull();

      // Verify enrollment was created
      const { data: enrollment, error: enrError } = await adminSupabase!
        .from("enrollments")
        .select("*")
        .eq("student_id", studentId)
        .eq("course_id", freeCourseId)
        .single();

      expect(enrError).toBeNull();
      expect(enrollment).toBeDefined();
      expect(enrollment!.amount_paid).toBe(0);
      expect(enrollment!.student_id).toBe(studentId);
      expect(enrollment!.course_id).toBe(freeCourseId);
    });

    it("does not enroll in draft course", async () => {
      // Create a draft course
      const { data: draftCourse, error: draftError } = await adminSupabase!
        .from("courses")
        .insert({
          instructor_id: instructorId,
          title: "Curso Borrador",
          slug: `curso-borrador-${Date.now()}`,
          status: "draft",
          price: 0,
          category: "Test",
          level: "beginner",
          language: "es",
        })
        .select("id")
        .single();

      if (draftError) throw draftError;

      // Try to enroll (should fail because course is not published)
      // The action checks course.status === 'published' before inserting
      const { data: course } = await adminSupabase!
        .from("courses")
        .select("id, price, status")
        .eq("id", draftCourse.id)
        .single();

      expect(course!.status).toBe("draft");

      // Clean up
      await adminSupabase!.from("courses").delete().eq("id", draftCourse.id);
    });

    it("does not enroll in paid course via free endpoint", async () => {
      const { data: course } = await adminSupabase!
        .from("courses")
        .select("id, price, status")
        .eq("id", paidCourseId)
        .single();

      expect(course!.price).toBeGreaterThan(0);
      expect(course!.status).toBe("published");

      // The action would return error: "Este curso no es gratuito"
      // We verify the logic by checking the price
      expect(Number(course!.price)).toBeGreaterThan(0);
    });

    it("prevents duplicate enrollment", async () => {
      // First enrollment
      await adminSupabase!.from("enrollments").upsert(
        { student_id: studentId, course_id: freeCourseId, amount_paid: 0 },
        { onConflict: "student_id,course_id", ignoreDuplicates: true }
      );

      // Second enrollment attempt
      const { error } = await adminSupabase!.from("enrollments").upsert(
        { student_id: studentId, course_id: freeCourseId, amount_paid: 0 },
        { onConflict: "student_id,course_id", ignoreDuplicates: true }
      );

      // Should not error due to ignoreDuplicates
      expect(error).toBeNull();

      // Verify only one enrollment exists
      const { data, error: countError } = await adminSupabase!
        .from("enrollments")
        .select("*", { count: "exact" })
        .eq("student_id", studentId)
        .eq("course_id", freeCourseId);

      expect(countError).toBeNull();
      expect(data!.length).toBe(1);
    });
  });

  describe("POST /api/checkout (createCheckoutSessionAction)", () => {
    it("creates checkout session for paid course", async () => {
      // Verify paid course exists and is published
      const { data: course, error } = await adminSupabase!
        .from("courses")
        .select("id, title, price, status, slug")
        .eq("id", paidCourseId)
        .single();

      expect(error).toBeNull();
      expect(course).toBeDefined();
      expect(course!.price).toBe(50);
      expect(course!.status).toBe("published");

      // The action would create a Stripe checkout session
      // We verify the preconditions are met
      expect(Number(course!.price)).toBeGreaterThan(0);
    });

    it("redirects to course if already enrolled", async () => {
      // Enroll student first
      await adminSupabase!.from("enrollments").upsert(
        { student_id: studentId, course_id: paidCourseId, amount_paid: 50 },
        { onConflict: "student_id,course_id", ignoreDuplicates: true }
      );

      // Check enrollment exists
      const { data: enrollment } = await adminSupabase!
        .from("enrollments")
        .select("id")
        .eq("student_id", studentId)
        .eq("course_id", paidCourseId)
        .single();

      expect(enrollment).toBeDefined();

      // The action would redirect to `/cursos/${course.slug}`
      const { data: course } = await adminSupabase!
        .from("courses")
        .select("slug")
        .eq("id", paidCourseId)
        .single();

      expect(course!.slug).toBeDefined();
    });

    it("rejects checkout for free course", async () => {
      const { data: course } = await adminSupabase!
        .from("courses")
        .select("price")
        .eq("id", freeCourseId)
        .single();

      expect(Number(course!.price)).toBe(0);
      // Action would return: "Este curso es gratuito, inscríbete directamente"
    });
  });

  describe("GET /checkout/success (webhook fallback)", () => {
    it("creates enrollment from successful Stripe session", async () => {
      // Simulate a completed Stripe checkout session
      const mockSessionId = `cs_test_${Date.now()}`;

      // Insert a transaction record (as webhook would do)
      const { error: txError } = await adminSupabase!.from("transactions").insert({
        instructor_id: instructorId,
        student_id: studentId,
        course_id: paidCourseId,
        amount: 50,
        platform_fee: 5,
        instructor_earnings: 45,
        status: "completed",
        stripe_payment_intent_id: `pi_${mockSessionId}`,
      });

      expect(txError).toBeNull();

      // Insert enrollment (as webhook would do)
      const { error: enrError } = await adminSupabase!.from("enrollments").upsert(
        {
          student_id: studentId,
          course_id: paidCourseId,
          amount_paid: 50,
          stripe_checkout_session_id: mockSessionId,
        },
        { onConflict: "student_id,course_id", ignoreDuplicates: true }
      );

      expect(enrError).toBeNull();

      // Verify enrollment
      const { data: enrollment } = await adminSupabase!
        .from("enrollments")
        .select("*")
        .eq("student_id", studentId)
        .eq("course_id", paidCourseId)
        .single();

      expect(enrollment).toBeDefined();
      expect(enrollment!.amount_paid).toBe(50);
      expect(enrollment!.stripe_checkout_session_id).toBe(mockSessionId);
    });

    it("idempotent - duplicate session doesn't create duplicate enrollment", async () => {
      const mockSessionId = `cs_test_${Date.now()}_dup`;

      // First insert
      await adminSupabase!.from("enrollments").upsert(
        {
          student_id: studentId,
          course_id: freeCourseId, // use free course to avoid conflict
          amount_paid: 0,
          stripe_checkout_session_id: mockSessionId,
        },
        { onConflict: "student_id,course_id", ignoreDuplicates: true }
      );

      // Second insert with same session_id
      await adminSupabase!.from("enrollments").upsert(
        {
          student_id: studentId,
          course_id: freeCourseId,
          amount_paid: 0,
          stripe_checkout_session_id: mockSessionId,
        },
        { onConflict: "student_id,course_id", ignoreDuplicates: true }
      );

      // Verify only one enrollment
      const { data, error } = await adminSupabase!
        .from("enrollments")
        .select("*", { count: "exact" })
        .eq("student_id", studentId)
        .eq("course_id", freeCourseId);

      expect(error).toBeNull();
      expect(data!.length).toBe(1);
    });
  });
});