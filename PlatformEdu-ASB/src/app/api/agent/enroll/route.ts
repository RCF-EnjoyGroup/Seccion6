import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getFirstLessonId } from "@/lib/queries/courses";
import { decideEnrollmentAction } from "@/lib/actions/enrollment";
import { NextResponse } from "next/server";

interface EnrollRequest {
  courseId: string;
  studentId: string;
}

interface EnrollResponse {
  enrolled?: boolean;
  checkoutUrl?: string;
  message?: string;
  lessonId?: string;
  isSimulation?: boolean;
}

export async function POST(request: Request) {
  try {
    const body: EnrollRequest = await request.json();
    const { courseId, studentId } = body;

    if (!courseId || !studentId) {
      return NextResponse.json(
        { error: "courseId and studentId are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get course details (price, status)
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, price, status")
      .eq("id", courseId)
      .maybeSingle();

    if (courseError) {
      return NextResponse.json({ error: courseError.message }, { status: 500 });
    }
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    if (course.status !== "published") {
      return NextResponse.json({ error: "Course is not available" }, { status: 400 });
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", courseId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (existingEnrollment) {
      const lessonId = await getFirstLessonId(courseId);
      return NextResponse.json({
        enrolled: true,
        message: "Already enrolled in this course",
        lessonId,
      } as EnrollResponse);
    }

    // Pure decision logic (no Supabase)
    const decision = decideEnrollmentAction({
      id: course.id,
      title: course.title,
      price: course.price,
    });

    // FREE COURSE: enroll directly using service role (bypasses RLS)
    if (decision.type === "enroll") {
      const admin = createAdminClient();
      const { error: enrollError } = await admin.from("enrollments").upsert(
        { student_id: studentId, course_id: courseId, amount_paid: 0 },
        { onConflict: "student_id,course_id", ignoreDuplicates: true }
      );

      if (enrollError) {
        return NextResponse.json({ error: enrollError.message }, { status: 500 });
      }

      const lessonId = await getFirstLessonId(courseId);
      return NextResponse.json({
        enrolled: true,
        message: `Enrolled in "${course.title}" (free course)`,
        lessonId,
      } as EnrollResponse);
    }

    // PAID COURSE: return SIMULATED checkout link (no real payment)
    return NextResponse.json({
      enrolled: false,
      checkoutUrl: decision.url,
      message: `Course "${course.title}" costs $${Number(course.price ?? 0).toFixed(2)}. This is a SIMULATED checkout link for development purposes — no real payment will be processed.`,
      isSimulation: true,
    } as EnrollResponse);
  } catch (error) {
    console.error("POST /api/agent/enroll error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}