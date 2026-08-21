import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Course, Section, Lesson } from "@/types/database";

interface CourseWithInstructor extends Course {
  instructor: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    headline: string | null;
    bio: string | null;
  } | null;
}

interface SectionWithLessons extends Section {
  lessons: Lesson[];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get course with instructor
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*, instructor:profiles(id, full_name, avatar_url, headline, bio)")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();

    if (courseError) {
      return NextResponse.json({ error: courseError.message }, { status: 500 });
    }
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get sections with lessons
    const { data: sectionsRaw, error: sectionsError } = await supabase
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

    return NextResponse.json({
      course: course as unknown as CourseWithInstructor,
      sections,
    });
  } catch (error) {
    console.error("GET /api/agent/courses/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}