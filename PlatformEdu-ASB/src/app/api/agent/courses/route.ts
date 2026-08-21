import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { CourseWithInstructor } from "@/types/database";

const COURSE_WITH_INSTRUCTOR_SELECT = "*, instructor:profiles(id, full_name, avatar_url, headline)";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const supabase = await createClient();

    let query = supabase
      .from("courses")
      .select(COURSE_WITH_INSTRUCTOR_SELECT, { count: "exact" })
      .eq("status", "published")
      .order("student_count", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      courses: data as unknown as CourseWithInstructor[],
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("GET /api/agent/courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}