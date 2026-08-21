import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import type { Lesson, Section } from "@/types/database";

interface SectionWithLessons extends Section {
  lessons: Lesson[];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");

    if (!studentId) {
      return NextResponse.json(
        { error: "student_id query parameter is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Verify course exists and is published
    const { data: course, error: courseError } = await admin
      .from("courses")
      .select("id, price")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();

    if (courseError) {
      return NextResponse.json({ error: courseError.message }, { status: 500 });
    }
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if student is enrolled (using admin client to bypass RLS)
    const { data: enrollment, error: enrollmentError } = await admin
      .from("enrollments")
      .select("id")
      .eq("course_id", id)
      .eq("student_id", studentId)
      .maybeSingle();

    if (enrollmentError) {
      return NextResponse.json({ error: enrollmentError.message }, { status: 500 });
    }
    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 }
      );
    }

    // Get sections with lessons
    const { data: sectionsRaw, error: sectionsError } = await admin
      .from("sections")
      .select("*, lessons(*)")
      .eq("course_id", id)
      .order("position", { ascending: true });

    if (sectionsError) {
      return NextResponse.json({ error: sectionsError.message }, { status: 500 });
    }

    const sections: SectionWithLessons[] = (sectionsRaw ?? []).map((section) => ({
      ...(section as Section),
      lessons: [...(((section as unknown as { lessons: Lesson[] }).lessons) ?? [])].sort(
        (a, b) => a.position - b.position,
      ),
    }));

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("GET /api/agent/courses/[id]/lessons error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}