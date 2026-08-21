import { describe, it, expect } from "vitest";
import {
  decideEnrollmentAction,
  canEnrollFree,
  requiresPayment,
} from "./enrollment";
import type { Course } from "@/types/database";

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: "course-1",
    instructor_id: "inst-1",
    title: "Curso de Prueba",
    slug: "curso-prueba",
    description: "Descripción",
    short_description: "Descripción corta",
    thumbnail_url: null,
    category: "Programación",
    level: "beginner",
    price: 0,
    status: "published",
    language: "es",
    rating_average: 4.5,
    rating_count: 10,
    student_count: 100,
    embedding: null,
    embedding_model: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("decideEnrollmentAction", () => {
  describe("unavailable course", () => {
    it("returns unavailable for null course", () => {
      const result = decideEnrollmentAction(null, true, false);
      expect(result.type).toBe("unavailable");
      expect(result.error).toBe("Este curso no está disponible");
    });

    it("returns unavailable for draft course", () => {
      const course = makeCourse({ status: "draft" });
      const result = decideEnrollmentAction(course, true, false);
      expect(result.type).toBe("unavailable");
      expect(result.error).toBe("Este curso no está disponible");
    });
  });

  describe("unauthenticated user", () => {
    it("returns unavailable when user not authenticated", () => {
      const course = makeCourse();
      const result = decideEnrollmentAction(course, false, false);
      expect(result.type).toBe("unavailable");
      expect(result.error).toBe("Debes iniciar sesión para inscribirte");
    });
  });

  describe("already enrolled", () => {
    it("returns already_enrolled when user is already enrolled", () => {
      const course = makeCourse();
      const result = decideEnrollmentAction(course, true, true);
      expect(result.type).toBe("already_enrolled");
      expect(result.redirectUrl).toBe(`/cursos/${course.slug}`);
    });
  });

  describe("free course", () => {
    it("returns free for price = 0", () => {
      const course = makeCourse({ price: 0 });
      const result = decideEnrollmentAction(course, true, false);
      expect(result.type).toBe("free");
      expect(result.redirectUrl).toContain(`/aprender/${course.id}/`);
    });

    it("returns free for negative price (edge case)", () => {
      const course = makeCourse({ price: -1 });
      const result = decideEnrollmentAction(course, true, false);
      expect(result.type).toBe("free");
    });
  });

  describe("paid course", () => {
    it("returns paid for price > 0", () => {
      const course = makeCourse({ price: 50 });
      const result = decideEnrollmentAction(course, true, false);
      expect(result.type).toBe("paid");
      expect(result.redirectUrl).toBe(`/checkout/${course.id}`);
    });

    it("returns paid for price = 0.01", () => {
      const course = makeCourse({ price: 0.01 });
      const result = decideEnrollmentAction(course, true, false);
      expect(result.type).toBe("paid");
    });
  });

  describe("priority order", () => {
    it("unavailable takes priority over unauthenticated", () => {
      const course = makeCourse({ status: "draft" });
      const result = decideEnrollmentAction(course, false, false);
      expect(result.type).toBe("unavailable");
    });

    it("unavailable takes priority over already enrolled", () => {
      const course = makeCourse({ status: "draft" });
      const result = decideEnrollmentAction(course, true, true);
      expect(result.type).toBe("unavailable");
    });

    it("already enrolled takes priority over free/paid", () => {
      const course = makeCourse({ price: 50 });
      const result = decideEnrollmentAction(course, true, true);
      expect(result.type).toBe("already_enrolled");
    });

    it("free takes priority over paid (price 0 vs > 0)", () => {
      const course = makeCourse({ price: 0 });
      const result = decideEnrollmentAction(course, true, false);
      expect(result.type).toBe("free");
    });
  });
});

describe("canEnrollFree", () => {
  it("returns true for published free course", () => {
    const course = makeCourse({ price: 0, status: "published" });
    expect(canEnrollFree(course)).toBe(true);
  });

  it("returns false for published paid course", () => {
    const course = makeCourse({ price: 50, status: "published" });
    expect(canEnrollFree(course)).toBe(false);
  });

  it("returns false for draft free course", () => {
    const course = makeCourse({ price: 0, status: "draft" });
    expect(canEnrollFree(course)).toBe(false);
  });
});

describe("requiresPayment", () => {
  it("returns true for published paid course", () => {
    const course = makeCourse({ price: 50, status: "published" });
    expect(requiresPayment(course)).toBe(true);
  });

  it("returns false for published free course", () => {
    const course = makeCourse({ price: 0, status: "published" });
    expect(requiresPayment(course)).toBe(false);
  });

  it("returns false for draft paid course", () => {
    const course = makeCourse({ price: 50, status: "draft" });
    expect(requiresPayment(course)).toBe(false);
  });
});