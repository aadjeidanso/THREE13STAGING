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
    lifecycle_status = Column(String(32), nullable=False, default="active_student")
    alumni_cohort_id = Column(Integer, ForeignKey("cohorts.id"), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    email_verified = Column(Boolean, nullable=False, default=False)
    two_factor_enabled = Column(Boolean, nullable=False, default=False)
    two_factor_secret = Column(Text, nullable=True)
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


class Cohort(Base):
    __tablename__ = "cohorts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    status = Column(String(32), nullable=False, default="upcoming")
    starts_at = Column(Integer, nullable=True)
    ends_at = Column(Integer, nullable=True)
    created_at = Column(Integer, nullable=False, default=now_ts)
    archived_at = Column(Integer, nullable=True)

    __table_args__ = (
        CheckConstraint("status IN ('upcoming', 'active', 'completed', 'archived')", name="ck_cohorts_status"),
    )


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_hash = Column(Text, nullable=False, unique=True, index=True)
    expires_at = Column(Integer, nullable=False)
    used_at = Column(Integer, nullable=True)
    created_at = Column(Integer, nullable=False, default=now_ts)


class EnrollmentRequest(Base):
    __tablename__ = "enrollment_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    cohort_id = Column(Integer, ForeignKey("cohorts.id"), nullable=True)
    status = Column(String(32), nullable=False, default="pending")
    prerequisites = Column(String(32), nullable=False, default="no")
    experience_level = Column(String(80), nullable=True)
    learning_goal = Column(String(120), nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(Integer, nullable=True)
    created_at = Column(Integer, nullable=False, default=now_ts)

    __table_args__ = (
        CheckConstraint("status IN ('pending', 'approved', 'rejected', 'removed')", name="ck_enrollment_requests_status"),
        UniqueConstraint("student_id", "course_id", "cohort_id", name="uq_enrollment_requests_student_course_cohort"),
    )


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    cohort_id = Column(Integer, ForeignKey("cohorts.id"), nullable=True)
    status = Column(String(32), nullable=False, default="approved")
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(Integer, nullable=True)
    created_at = Column(Integer, nullable=False, default=now_ts)

    __table_args__ = (
        CheckConstraint("status IN ('approved', 'removed')", name="ck_enrollments_status"),
        UniqueConstraint("student_id", "course_id", "cohort_id", name="uq_enrollments_student_course_cohort"),
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
    estimated_minutes = Column(Integer, nullable=False, default=15)
    created_at = Column(Integer, nullable=False, default=now_ts)


class MaterialProgress(Base):
    __tablename__ = "material_progress"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("course_materials.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    viewed_at = Column(Integer, nullable=False, default=now_ts)

    __table_args__ = (
        UniqueConstraint("material_id", "student_id", name="uq_material_progress_student"),
    )


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
    estimated_minutes = Column(Integer, nullable=False, default=30)
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
    teacher_feedback = Column(Text, nullable=True)
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


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    cohort_id = Column(Integer, ForeignKey("cohorts.id"), nullable=True)
    issued_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_url = Column(Text, nullable=False)
    file_name = Column(String(255), nullable=False)
    created_at = Column(Integer, nullable=False, default=now_ts)

    __table_args__ = (
        UniqueConstraint("student_id", "course_id", "cohort_id", name="uq_certificates_student_course_cohort"),
    )


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    attachment_url = Column(Text, nullable=True)
    attachment_name = Column(String(255), nullable=True)
    audience = Column(String(32), nullable=False, default="course")
    is_urgent = Column(Boolean, nullable=False, default=False)
    created_at = Column(Integer, nullable=False, default=now_ts)

    __table_args__ = (
        CheckConstraint("audience IN ('platform', 'course')", name="ck_announcements_audience"),
    )


class AnnouncementRead(Base):
    __tablename__ = "announcement_reads"

    id = Column(Integer, primary_key=True, index=True)
    announcement_id = Column(Integer, ForeignKey("announcements.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    read_at = Column(Integer, nullable=False, default=now_ts)

    __table_args__ = (
        UniqueConstraint("announcement_id", "student_id", name="uq_announcement_reads_student"),
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


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    category = Column(String(80), nullable=False, default="general")
    audience = Column(String(32), nullable=False, default="community")
    is_pinned = Column(Boolean, nullable=False, default=False)
    created_at = Column(Integer, nullable=False, default=now_ts)

    __table_args__ = (
        CheckConstraint("category IN ('general', 'discussion', 'job', 'resource', 'win', 'question', 'jobs', 'resources', 'wins', 'questions')", name="ck_community_posts_category"),
        CheckConstraint("audience IN ('community', 'students', 'alumni')", name="ck_community_posts_audience"),
    )


class CommunityComment(Base):
    __tablename__ = "community_comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("community_comments.id"), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(Integer, nullable=False, default=now_ts)


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
