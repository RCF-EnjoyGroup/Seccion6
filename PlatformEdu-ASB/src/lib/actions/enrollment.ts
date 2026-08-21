import { Course } from "@/types/database";

export type EnrollmentDecision =
  | { type: "enroll" }
  | { type: "checkout"; url: string };

export function decideEnrollmentAction(course: Pick<Course, "id" | "title" | "price">): EnrollmentDecision {
  const price = Number(course.price ?? 0);

  if (price === 0) {
    return { type: "enroll" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const simulatedCheckoutUrl = `${baseUrl}/checkout/simulated/${course.id}`;

  return { type: "checkout", url: simulatedCheckoutUrl };
}