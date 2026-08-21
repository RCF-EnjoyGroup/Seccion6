import { searchCoursesBySimilarity } from "@/lib/queries/searchCourses";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const results = await searchCoursesBySimilarity(q.trim(), limit);

    return NextResponse.json({
      query: q,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error("GET /api/agent/courses/search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}