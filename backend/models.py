import time

from sqlalchemy import Boolean, CheckConstraint, Column, ForeignKey, Integer, JSON, String, Text, UniqueConstraint

from database import Base


def now_ts():
    return int(time.time())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(320), nullable=False, unique=True, index=True)
    phone = Column(String(40), nullable=True)
    profile_image_url = Column(Text, nullable=True)
    password_hash = Column(Text, nullable=False)
    role = Column(String(32), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    email_verified = Column(Boolean, nullable=False, default=False)
    created_at = Column(Integer, nullable=False, default=now_ts)

    __table_args__ = (
        CheckConstraint("role IN ('admin', 'teacher', 'student')", name="ck_users_role"),
    )


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(32), nullable=False, default="inactive")
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(Integer, nullable=False, default=now_ts)

    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive', 'archived')", name="ck_courses_status"),
    )


class EnrollmentRequest(Base):
    __tablename__ = "enrollment_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    status = Column(String(32), nullable=False, default="pending")
    prerequisites = Column(String(32), nullable=False, default="no")
    experience_level = Column(String(80), nullable=True)
    learning_goal = Column(String(120), nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(Integer, nullable=True)
    created_at = Column(Integer, nullable=False, default=now_ts)

    __table_args__ = (
        CheckConstraint("status IN ('pending', 'approved', 'rejected', 'removed')", name="ck_enrollment_requests_status"),
        UniqueConstraint("student_id", "course_id", name="uq_enrollment_requests_student_course"),
    )


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    status = Column(String(32), nullable=False, default="approved")
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(Integer, nullable=True)
    created_at = Column(Integer, nullable=False, default=now_ts)

    __table_args__ = (
        CheckConstraint("status IN ('approved', 'removed')", name="ck_enrollments_status"),
        UniqueConstraint("student_id", "course_id", name="uq_enrollments_student_course"),
    )


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    position = Column(Integer, nullable=False, default=0)
    is_visible = Column(Boolean, nullable=False, default=True)
    created_at = Column(Integer, nullable=False, default=now_ts)


class CourseMaterial(Base):
    __tablename__ = "course_materials"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    material_type = Column(String(80), nullable=False)
    file_url = Column(Text, nullable=True)
    external_url = Column(Text, nullable=True)
    is_visible = Column(Boolean, nullable=False, default=True)
    created_at = Column(Integer, nullable=False, default=now_ts)


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=True)
    title = Column(String(255), nullable=False)
    instructions = Column(Text, nullable=True)
    attachment_url = Column(Text, nullable=True)
    attachment_name = Column(String(255), nullable=True)
    total_points = Column(Integer, nullable=False, default=100)
    due_at = Column(Integer, nullable=True)
    is_open = Column(Boolean, nullable=False, default=True)
    created_at = Column(Integer, nullable=False, default=now_ts)


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text_response = Column(Text, nullable=True)
    file_url = Column(Text, nullable=True)
    status = Column(String(32), nullable=False, default="submitted")
    submitted_at = Column(Integer, nullable=False, default=now_ts)

    __table_args__ = (
        CheckConstraint("status IN ('submitted', 'late', 'graded')", name="ck_submissions_status"),
    )


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False, unique=True)
    graded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    total_points = Column(Integer, nullable=False)
    feedback = Column(Text, nullable=True)
    graded_at = Column(Integer, nullable=False, default=now_ts)


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    audience = Column(String(32), nullable=False, default="course")
    is_urgent = Column(Boolean, nullable=False, default=False)
    created_at = Column(Integer, nullable=False, default=now_ts)

    __table_args__ = (
        CheckConstraint("audience IN ('platform', 'course')", name="ck_announcements_audience"),
    )


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(255), nullable=False)
    email = Column(String(320), nullable=False)
    category = Column(String(80), nullable=False, default="student_question")
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    attachment_url = Column(Text, nullable=True)
    status = Column(String(32), nullable=False, default="open")
    created_at = Column(Integer, nullable=False, default=now_ts)

    __table_args__ = (
        CheckConstraint("status IN ('open', 'in_progress', 'closed')", name="ck_support_tickets_status"),
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(120), nullable=False, index=True)
    target_type = Column(String(80), nullable=False, index=True)
    target_id = Column(Integer, nullable=True, index=True)
    summary = Column(Text, nullable=False)
    metadata_json = Column("metadata", JSON, nullable=True)
    created_at = Column(Integer, nullable=False, default=now_ts, index=True)


class PlatformSetting(Base):
    __tablename__ = "platform_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(120), nullable=False, unique=True, index=True)
    value = Column(JSON, nullable=False)
    updated_at = Column(Integer, nullable=False, default=now_ts)
