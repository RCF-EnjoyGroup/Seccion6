import type { Course } from "@/types/database";

export type EnrollmentType = "free" | "paid" | "already_enrolled" | "unavailable";

export interface EnrollmentDecision {
  type: EnrollmentType;
  course: Course;
  redirectUrl?: string;
  error?: string;
}

/**
 * Pure function that determines the enrollment action based on course and user state.
 * This is the core decision logic extracted from the enrollment actions.
 */
export function decideEnrollmentAction(
  course: Course | null,
  isAuthenticated: boolean,
  isAlreadyEnrolled: boolean
): EnrollmentDecision {
  // Course not found or not published
  if (!course || course.status !== "published") {
    return {
      type: "unavailable",
      course: course!,
      error: "Este curso no está disponible",
    };
  }

  // User not authenticated
  if (!isAuthenticated) {
    return {
      type: "unavailable",
      course,
      error: "Debes iniciar sesión para inscribirte",
    };
  }

  // Already enrolled
  if (isAlreadyEnrolled) {
    return {
      type: "already_enrolled",
      course,
      redirectUrl: `/cursos/${course.slug}`,
    };
  }

  // Free course
  if (Number(course.price) <= 0) {
    return {
      type: "free",
      course,
      redirectUrl: `/aprender/${course.id}/first-lesson`, // placeholder, will be replaced with actual lesson ID
    };
  }

  // Paid course
  return {
    type: "paid",
    course,
    redirectUrl: `/checkout/${course.id}`,
  };
}

/**
 * Validates if a course can be enrolled for free.
 */
export function canEnrollFree(course: Course): boolean {
  return course.status === "published" && Number(course.price) <= 0;
}

/**
 * Validates if a course requires payment.
 */
export function requiresPayment(course: Course): boolean {
  return course.status === "published" && Number(course.price) > 0;
}