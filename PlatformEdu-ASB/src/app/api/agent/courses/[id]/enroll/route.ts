import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { getFirstLessonId } from "@/lib/queries/courses";

interface EnrollRequest {
  student_id: string;
}

interface EnrollResponse {
  enrolled?: boolean;
  checkoutUrl?: string;
  message?: string;
  lessonId?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: EnrollRequest = await request.json();
    const { student_id } = body;

    if (!student_id) {
      return NextResponse.json(
        { error: "student_id is required" },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // Verify course exists and is published
    const { data: course, error: courseError } = await admin
      .from("courses")
      .select("id, title, price, status")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();

    if (courseError) {
      return NextResponse.json({ error: courseError.message }, { status: 500 });
    }
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await admin
      .from("enrollments")
      .select("id")
      .eq("course_id", id)
      .eq("student_id", student_id)
      .maybeSingle();

    if (existingEnrollment) {
      const lessonId = await getFirstLessonId(id);
      return NextResponse.json({
        enrolled: true,
        message: `Ya estás inscrito en "${course.title}"`,
        lessonId,
      } as EnrollResponse);
    }

    const price = Number(course.price ?? 0);

    // FREE COURSE: enroll directly
    if (price === 0) {
      const { error: enrollError } = await admin.from("enrollments").upsert(
        { student_id, course_id: id, amount_paid: 0 },
        { onConflict: "student_id,course_id", ignoreDuplicates: true },
      );

      if (enrollError) {
        return NextResponse.json(
          { error: enrollError.message },
          { status: 500 },
        );
      }

      const lessonId = await getFirstLessonId(id);
      return NextResponse.json({
        enrolled: true,
        message: `Inscrito en "${course.title}" (curso gratuito)`,
        lessonId,
      } as EnrollResponse);
    }

    // PAID COURSE: return simulated checkout link
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const simulatedCheckoutUrl = `${baseUrl}/checkout/simulated/${course.id}`;

    return NextResponse.json({
      enrolled: false,
      checkoutUrl: simulatedCheckoutUrl,
      message: `El curso "${course.title}" tiene un precio de $${price.toFixed(2)}. Sigue el enlace para completar la inscripción.`,
    } as EnrollResponse);
  } catch (error) {
    console.error("POST /api/agent/courses/[id]/enroll error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
