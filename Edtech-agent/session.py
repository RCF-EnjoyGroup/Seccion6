from dataclasses import dataclass, field
from typing import Optional

MAX_RECOMMENDATIONS = 3


@dataclass
class StudentSession:
    email: Optional[str] = None
    student_id: Optional[str] = None
    student_name: Optional[str] = None
    recommended_course_ids: list[str] = field(default_factory=list)
    enrolled_course_ids: list[str] = field(default_factory=list)
    pending_enrollment: Optional[dict] = None

    @property
    def recommendations_count(self) -> int:
        return len(self.recommended_course_ids)

    def is_verified(self) -> bool:
        return self.email is not None and self.student_id is not None

    def can_recommend(self) -> bool:
        return self.recommendations_count < MAX_RECOMMENDATIONS

    def register_recommendation(self, course_id: str) -> None:
        if course_id in self.recommended_course_ids:
            return
        self.recommended_course_ids.append(course_id)

    def register_enrollment(self, course_id: str) -> None:
        if course_id in self.enrolled_course_ids:
            return
        self.enrolled_course_ids.append(course_id)
