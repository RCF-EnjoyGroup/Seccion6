import { describe, it, expect } from "vitest";
import { filterCourses, paginateCourses } from "./filterCourses";
import type { CourseWithInstructor } from "@/types/database";

function makeCourse(overrides: Partial<CourseWithInstructor> = {}): CourseWithInstructor {
  return {
    id: "1",
    instructor_id: "inst-1",
    title: "Curso de Programación",
    slug: "curso-programacion",
    description: "Aprende a programar",
    short_description: "Curso introductorio de programación",
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
    instructor: { id: "inst-1", full_name: "Instructor 1", avatar_url: null, headline: "Dev" },
    ...overrides,
  };
}

describe("filterCourses", () => {
  const courses = [
    makeCourse({ id: "1", title: "Curso de Programación", category: "Programación", level: "beginner", price: 0, rating_average: 4.5, student_count: 100, created_at: "2024-01-01T00:00:00Z" }),
    makeCourse({ id: "2", title: "Curso de Diseño", category: "Diseño", level: "intermediate", price: 50, rating_average: 4.0, student_count: 50, created_at: "2024-02-01T00:00:00Z" }),
    makeCourse({ id: "3", title: "Curso Avanzado de JS", category: "Programación", level: "advanced", price: 100, rating_average: 4.8, student_count: 200, created_at: "2024-03-01T00:00:00Z" }),
    makeCourse({ id: "4", title: "React para Principiantes", category: "Programación", level: "beginner", price: 30, rating_average: 4.2, student_count: 80, created_at: "2024-04-01T00:00:00Z" }),
    makeCourse({ id: "5", title: "Diseño UX/UI", category: "Diseño", level: "beginner", price: 0, rating_average: 4.7, student_count: 150, created_at: "2024-05-01T00:00:00Z" }),
  ];

  describe("category filter", () => {
    it("filters by category", () => {
      const result = filterCourses(courses, { category: "Programación" });
      expect(result).toHaveLength(3);
      expect(result.every((c) => c.category === "Programación")).toBe(true);
    });

    it("returns empty array for non-existent category", () => {
      const result = filterCourses(courses, { category: "Inexistente" });
      expect(result).toHaveLength(0);
    });
  });

  describe("level filter", () => {
    it("filters by level", () => {
      const result = filterCourses(courses, { level: "beginner" });
      expect(result).toHaveLength(3);
      expect(result.every((c) => c.level === "beginner")).toBe(true);
    });

    it("returns empty array for non-existent level", () => {
      const result = filterCourses(courses, { level: "expert" });
      expect(result).toHaveLength(0);
    });
  });

  describe("search filter", () => {
    it("searches by title", () => {
      const result = filterCourses(courses, { search: "React" });
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain("React");
    });

    it("searches by short_description", () => {
      const result = filterCourses(courses, { search: "programación" });
      // "programación" appears in short_description of courses 1, 3, 4 (all Programación category)
      // and in title of course 3 "Curso Avanzado de JS" (doesn't contain "programación")
      // Actually course 1 has "Curso introductorio de programación" in short_description
      // Course 3 is "Curso Avanzado de JS" - no "programación" in short_description
      // Course 4 is "React para Principiantes" - no "programación" in short_description
      // Let me check: course 1 short_description = "Curso introductorio de programación" - contains "programación"
      // Course 3 short_description = "Curso introductorio de programación" (from makeCourse default) - contains "programación"
      // Course 4 short_description = "Curso introductorio de programación" (from makeCourse default) - contains "programación"
      // Wait, all courses use the same default short_description. So all 3 Programación courses match.
      // But also the Diseño courses have the same default short_description... 
      // Actually no, the makeCourse function provides the same default for all. So all 5 courses have "programación" in short_description.
      // But the filter is case-insensitive and searches both title and short_description.
      // So all 5 courses should match. Let me fix the expectation.
      expect(result).toHaveLength(5);
    });

    it("is case insensitive", () => {
      const result = filterCourses(courses, { search: "DISEÑO" });
      expect(result).toHaveLength(2);
    });

    it("strips special characters from search term", () => {
      const result = filterCourses(courses, { search: "React%" });
      expect(result).toHaveLength(1);
    });
  });

  describe("price filters", () => {
    it("filters by minPrice", () => {
      const result = filterCourses(courses, { minPrice: 50 });
      expect(result).toHaveLength(2);
      expect(result.every((c) => Number(c.price) >= 50)).toBe(true);
    });

    it("filters by maxPrice", () => {
      const result = filterCourses(courses, { maxPrice: 50 });
      // Courses with price <= 50: id=1 (0), id=2 (50), id=4 (30), id=5 (0) = 4 courses
      expect(result).toHaveLength(4);
      expect(result.every((c) => Number(c.price) <= 50)).toBe(true);
    });

    it("filters by both minPrice and maxPrice", () => {
      const result = filterCourses(courses, { minPrice: 30, maxPrice: 80 });
      expect(result).toHaveLength(2);
      expect(result.every((c) => Number(c.price) >= 30 && Number(c.price) <= 80)).toBe(true);
    });

    it("includes free courses when minPrice is 0", () => {
      const result = filterCourses(courses, { minPrice: 0 });
      expect(result).toHaveLength(5);
    });
  });

  describe("rating filter", () => {
    it("filters by minRating", () => {
      const result = filterCourses(courses, { minRating: 4.5 });
      expect(result).toHaveLength(3);
      expect(result.every((c) => Number(c.rating_average) >= 4.5)).toBe(true);
    });
  });

  describe("sorting", () => {
    it("sorts by popular (default) - student_count desc", () => {
      const result = filterCourses(courses, {});
      expect(result[0].id).toBe("3"); // 200 students
      expect(result[1].id).toBe("5"); // 150 students
      expect(result[2].id).toBe("1"); // 100 students
    });

    it("sorts by newest - created_at desc", () => {
      const result = filterCourses(courses, { sort: "newest" });
      expect(result[0].id).toBe("5"); // newest
      expect(result[4].id).toBe("1"); // oldest
    });

    it("sorts by price_asc", () => {
      const result = filterCourses(courses, { sort: "price_asc" });
      expect(result[0].price).toBe(0);
      expect(result[4].price).toBe(100);
    });

    it("sorts by price_desc", () => {
      const result = filterCourses(courses, { sort: "price_desc" });
      expect(result[0].price).toBe(100);
      expect(result[4].price).toBe(0);
    });

    it("sorts by rating desc", () => {
      const result = filterCourses(courses, { sort: "rating" });
      expect(Number(result[0].rating_average)).toBe(4.8);
      expect(Number(result[4].rating_average)).toBe(4.0);
    });
  });

  describe("combined filters", () => {
    it("combines category and level filters", () => {
      const result = filterCourses(courses, { category: "Programación", level: "beginner" });
      expect(result).toHaveLength(2);
      expect(result.every((c) => c.category === "Programación" && c.level === "beginner")).toBe(true);
    });

    it("combines search with category", () => {
      const result = filterCourses(courses, { category: "Programación", search: "React" });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("React para Principiantes");
    });

    it("combines multiple filters", () => {
      const result = filterCourses(courses, {
        category: "Programación",
        level: "beginner",
        maxPrice: 50,
        minRating: 4.0,
      });
      expect(result).toHaveLength(2);
    });
  });
});

describe("paginateCourses", () => {
  const courses = Array.from({ length: 25 }, (_, i) =>
    makeCourse({ id: String(i + 1), title: `Curso ${i + 1}`, student_count: 100 - i })
  );

  it("returns first page with correct pageSize", () => {
    const result = paginateCourses(courses, 1, 10);
    expect(result.courses).toHaveLength(10);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.total).toBe(25);
  });

  it("returns second page", () => {
    const result = paginateCourses(courses, 2, 10);
    expect(result.courses).toHaveLength(10);
    expect(result.page).toBe(2);
    expect(result.courses[0].title).toBe("Curso 11");
  });

  it("returns last page with remaining items", () => {
    const result = paginateCourses(courses, 3, 10);
    expect(result.courses).toHaveLength(5);
    expect(result.page).toBe(3);
  });

  it("returns empty array for page beyond total", () => {
    const result = paginateCourses(courses, 4, 10);
    expect(result.courses).toHaveLength(0);
    expect(result.page).toBe(4);
  });
});