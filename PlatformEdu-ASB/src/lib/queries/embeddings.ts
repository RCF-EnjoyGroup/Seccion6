import type { Course, Section, Lesson } from "@/types/database";

export interface SectionWithLessons extends Section {
  lessons: Lesson[];
}

export function buildCourseEmbeddingText(
  course: Course,
  sections: SectionWithLessons[]
): string {
  const parts: string[] = [];

  parts.push(course.title);

  if (course.description) {
    parts.push(course.description);
  }

  if (course.short_description) {
    parts.push(course.short_description);
  }

  parts.push(course.level);
  parts.push(course.category);

  const sortedSections = [...sections].sort((a, b) => a.position - b.position);

  for (const section of sortedSections) {
    parts.push(section.title);

    const sortedLessons = [...section.lessons].sort((a, b) => a.position - b.position);

    for (const lesson of sortedLessons) {
      parts.push(lesson.title);
    }
  }

  return parts.filter(Boolean).join(" \n ");
}