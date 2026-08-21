import type { CourseWithInstructor } from "@/types/database";
import type { CourseFilters } from "@/lib/queries/courses";

/**
 * Pure filter function for courses.
 * Filters an array of courses based on the provided filters.
 * This is the core filtering logic extracted from searchCourses.
 */
export function filterCourses(
  courses: CourseWithInstructor[],
  filters: CourseFilters
): CourseWithInstructor[] {
  let result = [...courses];

  // Filter by category
  if (filters.category) {
    result = result.filter((course) => course.category === filters.category);
  }

  // Filter by level
  if (filters.level) {
    result = result.filter((course) => course.level === filters.level);
  }

  // Filter by search term (title, short_description)
  if (filters.search) {
    const term = filters.search.toLowerCase().replace(/[%,]/g, "");
    result = result.filter(
      (course) =>
        course.title.toLowerCase().includes(term) ||
        course.short_description?.toLowerCase().includes(term)
    );
  }

  // Filter by min price
  if (filters.minPrice !== undefined) {
    result = result.filter((course) => Number(course.price) >= filters.minPrice!);
  }

  // Filter by max price
  if (filters.maxPrice !== undefined) {
    result = result.filter((course) => Number(course.price) <= filters.maxPrice!);
  }

  // Filter by min rating
  if (filters.minRating !== undefined) {
    result = result.filter(
      (course) => Number(course.rating_average) >= filters.minRating!
    );
  }

  // Sort
  const sort = filters.sort ?? "popular";
  switch (sort) {
    case "newest":
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case "price_asc":
      result.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case "price_desc":
      result.sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case "rating":
      result.sort((a, b) => Number(b.rating_average) - Number(a.rating_average));
      break;
    case "popular":
    default:
      result.sort((a, b) => b.student_count - a.student_count);
      break;
  }

  return result;
}

/**
 * Paginates the filtered courses.
 */
export function paginateCourses(
  courses: CourseWithInstructor[],
  page: number,
  pageSize: number
): { courses: CourseWithInstructor[]; total: number; page: number; pageSize: number } {
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  return {
    courses: courses.slice(from, to),
    total: courses.length,
    page,
    pageSize,
  };
}