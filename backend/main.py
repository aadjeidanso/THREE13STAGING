import base64
import csv
import hmac
import io
import json
import re
import secrets
import struct
import time
import uuid
from hashlib import sha1, sha256
from typing import Literal
from urllib.error import HTTPError
from urllib.parse import quote, urlencode
from urllib.request import Request as UrlRequest, urlopen

import bcrypt
from fastapi import Depends, FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, Response
from pydantic import BaseModel
from sqlalchemy import func, inspect, text
from sqlalchemy.orm import Session, aliased
from config import APP_SECRET, CORS_ALLOWED_ORIGINS, EMAIL_FROM, FRONTEND_URL, GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET, SUPABASE_URL
from database import Base, engine, get_db
from models import Announcement, AnnouncementRead, Assignment, AuditLog, Certificate, Cohort, CommunityComment, CommunityPost, Course, CourseMaterial, Enrollment, EnrollmentRequest, Grade, MaterialProgress, Module, PasswordResetToken, PlatformSetting, Submission, SupportTicket, User, now_ts
import models  # noqa: F401 - ensures all SQLAlchemy models are registered.

SESSION_TTL_SECONDS = 60 * 60 * 8
MAX_MATERIAL_UPLOAD_BYTES = 25 * 1024 * 1024
MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024
ALLOWED_PROFILE_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_MATERIAL_EXTENSIONS = {
    ".pdf",
    ".ppt",
    ".pptx",
    ".doc",
    ".docx",
    ".txt",
    ".md",
    ".csv",
    ".xlsx",
    ".zip",
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".html",
    ".css",
    ".gif",
    ".json",
    ".jpeg",
    ".jpg",
    ".png",
    ".sql",
    ".webp",
}
Role = Literal["admin", "teacher", "student"]

app = FastAPI()

allowed_origins = sorted(
    {origin.strip().rstrip("/") for origin in CORS_ALLOWED_ORIGINS.split(",") if origin.strip()}
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    email: str
    password: str


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetConfirmRequest(BaseModel):
    token: str
    new_password: str
    cohort_id: int | None = None


class ProfileUpdateRequest(BaseModel):
    full_name: str
    phone: str | None = None


class TwoFactorVerifyRequest(BaseModel):
    code: str


class TwoFactorLoginVerifyRequest(BaseModel):
    challenge_token: str
    code: str


class TwoFactorDisableRequest(BaseModel):
    current_password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: Role
    lifecycle_status: str = "active_student"
    is_active: bool
    email_verified: bool
    created_at: int
    phone: str | None = None
    profile_image_url: str | None = None
    two_factor_enabled: bool = False


class CourseResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    status: str


class CohortResponse(BaseModel):
    id: int
    name: str
    status: str
    starts_at: int | None = None
    ends_at: int | None = None
    created_at: int
    archived_at: int | None = None
    stats: dict | None = None


class CohortCreateRequest(BaseModel):
    name: str
    starts_at: int | None = None
    ends_at: int | None = None


class CohortCompleteRequest(BaseModel):
    archive_students_as_alumni: bool = True


class CommunityPostCreateRequest(BaseModel):
    title: str
    body: str
    category: Literal["general", "discussion", "job", "resource", "win", "question", "jobs", "resources", "wins", "questions"] = "discussion"
    audience: Literal["community", "students", "alumni"] = "community"


class CommunityCommentCreateRequest(BaseModel):
    body: str
    parent_id: int | None = None


class CommunityPostResponse(BaseModel):
    id: int
    title: str
    body: str
    category: str
    audience: str
    is_pinned: bool
    created_at: int
    author: dict
    comments: list[dict] = []
    comment_count: int = 0


class CourseCreateRequest(BaseModel):
    title: str
    description: str | None = None
    status: Literal["active", "inactive", "archived"] = "inactive"
    teacher_id: int | None = None


class CourseUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    status: Literal["active", "inactive", "archived"] | None = None
    teacher_id: int | None = None


class AdminCourseResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    status: str
    teacher: dict | None = None
    enrolled_students: list[dict]
    created_at: int


class ModuleCreateRequest(BaseModel):
    title: str
    description: str | None = None
    position: int = 0
    is_visible: bool = True


class ModuleUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    position: int | None = None
    is_visible: bool | None = None


class MaterialCreateRequest(BaseModel):
    title: str
    description: str | None = None
    material_type: str
    module_id: int | None = None
    file_url: str | None = None
    external_url: str | None = None
    is_visible: bool = True
    estimated_minutes: int = 15


class MaterialUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    material_type: str | None = None
    module_id: int | None = None
    file_url: str | None = None
    external_url: str | None = None
    is_visible: bool | None = None
    estimated_minutes: int | None = None


class AssignmentCreateRequest(BaseModel):
    title: str
    instructions: str | None = None
    module_id: int | None = None
    attachment_url: str | None = None
    attachment_name: str | None = None
    total_points: int = 100
    estimated_minutes: int = 30
    due_at: int | None = None
    is_open: bool = True


class AssignmentUpdateRequest(BaseModel):
    title: str | None = None
    instructions: str | None = None
    module_id: int | None = None
    attachment_url: str | None = None
    attachment_name: str | None = None
    total_points: int | None = None
    estimated_minutes: int | None = None
    due_at: int | None = None
    is_open: bool | None = None


class GradeSubmissionRequest(BaseModel):
    score: int | None = None
    total_points: int | None = None
    feedback: str | None = None


class SubmissionCommentRequest(BaseModel):
    feedback: str | None = None


class StudentEnrollmentRequestCreate(BaseModel):
    course_id: int
    prerequisites: str = "no"
    experience_level: str | None = None
    learning_goal: str | None = None


class StudentAssignmentSubmitRequest(BaseModel):
    text_response: str | None = None
    file_url: str | None = None


class CourseContentResponse(BaseModel):
    course: dict
    modules: list[dict]
    unassigned_materials: list[dict]
    unassigned_assignments: list[dict]


class MaterialUploadResponse(BaseModel):
    file_url: str
    file_path: str
    file_name: str
    content_type: str | None = None
    size: int


class AnnouncementCreateRequest(BaseModel):
    title: str
    body: str
    attachment_url: str | None = None
    attachment_name: str | None = None
    audience: Literal["platform", "course"] = "platform"
    course_id: int | None = None
    is_urgent: bool = False


class AnnouncementResponse(BaseModel):
    id: int
    title: str
    body: str
    attachment_url: str | None = None
    attachment_name: str | None = None
    audience: str
    is_urgent: bool
    created_at: int
    is_read: bool = False
    read_at: int | None = None
    author: dict
    course: dict | None = None


class SupportTicketCreateRequest(BaseModel):
    name: str
    email: str
    category: Literal["student_question", "teacher_issue", "technical_problem", "enrollment_confirmation"] = "student_question"
    subject: str
    message: str
    attachment_url: str | None = None


class SupportTicketStatusRequest(BaseModel):
    status: Literal["open", "in_progress", "closed"]


class SupportTicketResponse(BaseModel):
    id: int
    name: str
    email: str
    category: str
    subject: str
    message: str
    attachment_url: str | None = None
    status: str
    created_at: int
    user: dict | None = None


class PlatformSettingsRequest(BaseModel):
    platform_profile: dict
    enrollment_rules: dict
    security: dict
    platform_preferences: dict = {}
    course_categories: list[str]
    notifications: dict


class PlatformSettingsResponse(BaseModel):
    platform_profile: dict
    enrollment_rules: dict
    security: dict
    platform_preferences: dict
    course_categories: list[str]
    notifications: dict
    updated_at: int | None = None


class EnrollmentRegistrationRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    password: str
    course_titles: list[str] = []
    prerequisites: str = "no"
    experience_level: str | None = None
    learning_goal: str | None = None
    agree: bool


class EnrollmentRegistrationResponse(BaseModel):
    message: str
    student_id: int
    enrollment_request_ids: list[int]


class EnrollmentRequestResponse(BaseModel):
    id: int
    status: str
    prerequisites: str
    experience_level: str | None = None
    learning_goal: str | None = None
    created_at: int
    student: dict
    course: dict
    cohort: dict | None = None


class EnrollmentDecisionRequest(BaseModel):
    status: Literal["approved", "rejected"]


class StudentEnrollmentStatusResponse(BaseModel):
    approved: list[dict]
    pending: list[dict]
    rejected: list[dict]


class AdminDashboardSummaryResponse(BaseModel):
    totals: dict
    overview: dict | None = None
    notifications: list[dict] = []
    recent_activity: list[dict] = []
    recent_submissions: list[dict]
    recent_announcements: list[dict]


class AdminAssignmentOverviewResponse(BaseModel):
    id: int
    title: str
    instructions: str | None = None
    total_points: int
    due_at: int | None = None
    is_open: bool
    created_at: int
    course: dict
    module: dict | None = None
    teacher: dict | None = None
    submissions: dict
    grading: dict


class AdminGradeOverviewResponse(BaseModel):
    submission_id: int
    submission_status: str
    submitted_at: int
    student: dict
    course: dict
    assignment: dict
    teacher: dict | None = None
    grade: dict | None = None


class AuditLogResponse(BaseModel):
    id: int
    action: str
    target_type: str
    target_id: int | None = None
    summary: str
    metadata: dict | None = None
    created_at: int
    actor: dict | None = None


class TeacherCreateRequest(BaseModel):
    full_name: str
    email: str
    phone: str | None = None
    password: str


class TeacherUpdateRequest(BaseModel):
    full_name: str
    email: str
    phone: str | None = None


class TeacherStatusRequest(BaseModel):
    is_active: bool


class StudentAccountStatusRequest(BaseModel):
    is_active: bool


class AlumniCreateRequest(BaseModel):
    full_name: str
    email: str
    phone: str | None = None
    cohort_id: int | None = None


class StudentCourseAssignmentRequest(BaseModel):
    course_id: int


class TeacherCourseAssignmentRequest(BaseModel):
    course_id: int


class TeacherResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str | None = None
    profile_image_url: str | None = None
    is_active: bool
    email_verified: bool
    created_at: int
    assigned_courses: list[dict]


class StudentAdminResponse(BaseModel):
    id: int
    display_id: str | None = None
    full_name: str
    email: str
    phone: str | None = None
    profile_image_url: str | None = None
    is_active: bool
    lifecycle_status: str = "active_student"
    alumni_cohort_id: int | None = None
    email_verified: bool
    created_at: int
    enrolled_courses: list[dict]
    enrollment_requests: list[dict]


class AlumniCreateResponse(BaseModel):
    student: StudentAdminResponse
    email_sent: bool
    dev_token: str | None = None
    setup_url: str | None = None


class StudentCourseActivityResponse(BaseModel):
    student: dict
    course: dict
    enrollment: dict
    materials: list[dict]
    assignments: list[dict]
    announcements: list[dict]


class CertificateResponse(BaseModel):
    id: int
    file_url: str
    file_name: str
    created_at: int
    student: dict
    course: dict


class StudentDashboardSummaryResponse(BaseModel):
    approved_courses: list[dict]
    recent_materials: list[dict]
    upcoming_assignments: list[dict]
    recent_grades: list[dict]
    announcements: list[dict]
    overall_progress: int


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    ensure_schema_updates()


def ensure_schema_updates():
    inspector = inspect(engine)
    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "phone" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(40)"))
    if "profile_image_url" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN profile_image_url TEXT"))
    if "two_factor_enabled" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE"))
    if "two_factor_secret" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN two_factor_secret TEXT"))
    if "lifecycle_status" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN lifecycle_status VARCHAR(32) NOT NULL DEFAULT 'active_student'"))
    if "alumni_cohort_id" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN alumni_cohort_id INTEGER REFERENCES cohorts(id)"))

    assignment_columns = {column["name"] for column in inspector.get_columns("assignments")}
    with engine.begin() as connection:
        if "attachment_url" not in assignment_columns:
            connection.execute(text("ALTER TABLE assignments ADD COLUMN attachment_url TEXT"))
        if "attachment_name" not in assignment_columns:
            connection.execute(text("ALTER TABLE assignments ADD COLUMN attachment_name VARCHAR(255)"))
        if "estimated_minutes" not in assignment_columns:
            connection.execute(text("ALTER TABLE assignments ADD COLUMN estimated_minutes INTEGER NOT NULL DEFAULT 30"))

    material_columns = {column["name"] for column in inspector.get_columns("course_materials")}
    if "estimated_minutes" not in material_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE course_materials ADD COLUMN estimated_minutes INTEGER NOT NULL DEFAULT 15"))

    if "submissions" in inspector.get_table_names():
        submission_columns = {column["name"] for column in inspector.get_columns("submissions")}
        if "teacher_feedback" not in submission_columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE submissions ADD COLUMN teacher_feedback TEXT"))

    table_names = set(inspector.get_table_names())
    active_cohort_id = None
    if "cohorts" in table_names:
        current_ts = now_ts()
        with engine.begin() as connection:
            active_row = connection.execute(text("SELECT id FROM cohorts WHERE status = 'active' ORDER BY created_at DESC LIMIT 1")).fetchone()
            if not active_row:
                connection.execute(
                    text("INSERT INTO cohorts (name, status, starts_at, ends_at, created_at) VALUES (:name, 'active', :starts_at, NULL, :created_at)"),
                    {"name": "Current Cohort", "starts_at": current_ts, "created_at": current_ts},
                )
                active_row = connection.execute(text("SELECT id FROM cohorts WHERE status = 'active' ORDER BY created_at DESC LIMIT 1")).fetchone()
            active_cohort_id = active_row[0] if active_row else None
            completed_order_sql = (
                "SELECT id FROM cohorts WHERE status = 'completed' ORDER BY ends_at DESC NULLS LAST, created_at DESC LIMIT 1"
                if engine.dialect.name == "postgresql"
                else "SELECT id FROM cohorts WHERE status = 'completed' ORDER BY ends_at DESC, created_at DESC LIMIT 1"
            )
            completed_row = connection.execute(text(completed_order_sql)).fetchone()
            if completed_row:
                connection.execute(
                    text("UPDATE users SET alumni_cohort_id = :cohort_id WHERE role = 'student' AND lifecycle_status = 'alumni' AND alumni_cohort_id IS NULL"),
                    {"cohort_id": completed_row[0]},
                )

    for table_name in ("enrollment_requests", "enrollments", "certificates"):
        if table_name in table_names:
            columns = {column["name"] for column in inspector.get_columns(table_name)}
            with engine.begin() as connection:
                if "cohort_id" not in columns:
                    connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN cohort_id INTEGER REFERENCES cohorts(id)"))
                if active_cohort_id:
                    connection.execute(text(f"UPDATE {table_name} SET cohort_id = :cohort_id WHERE cohort_id IS NULL"), {"cohort_id": active_cohort_id})

    if engine.dialect.name == "postgresql":
        unique_constraints = {
            table_name: {constraint["name"] for constraint in inspector.get_unique_constraints(table_name)}
            for table_name in ("enrollment_requests", "enrollments", "certificates")
            if table_name in table_names
        }
        with engine.begin() as connection:
            if "uq_enrollment_requests_student_course" in unique_constraints.get("enrollment_requests", set()):
                connection.execute(text("ALTER TABLE enrollment_requests DROP CONSTRAINT uq_enrollment_requests_student_course"))
            if "uq_enrollment_requests_student_course_cohort" not in unique_constraints.get("enrollment_requests", set()):
                connection.execute(text("ALTER TABLE enrollment_requests ADD CONSTRAINT uq_enrollment_requests_student_course_cohort UNIQUE (student_id, course_id, cohort_id)"))
            if "uq_enrollments_student_course" in unique_constraints.get("enrollments", set()):
                connection.execute(text("ALTER TABLE enrollments DROP CONSTRAINT uq_enrollments_student_course"))
            if "uq_enrollments_student_course_cohort" not in unique_constraints.get("enrollments", set()):
                connection.execute(text("ALTER TABLE enrollments ADD CONSTRAINT uq_enrollments_student_course_cohort UNIQUE (student_id, course_id, cohort_id)"))
            if "uq_certificates_student_course" in unique_constraints.get("certificates", set()):
                connection.execute(text("ALTER TABLE certificates DROP CONSTRAINT uq_certificates_student_course"))
            if "uq_certificates_student_course_cohort" not in unique_constraints.get("certificates", set()):
                connection.execute(text("ALTER TABLE certificates ADD CONSTRAINT uq_certificates_student_course_cohort UNIQUE (student_id, course_id, cohort_id)"))

    if "certificates" not in table_names:
        with engine.begin() as connection:
            connection.execute(text("""
                CREATE TABLE certificates (
                    id INTEGER PRIMARY KEY,
                    student_id INTEGER NOT NULL REFERENCES users(id),
                    course_id INTEGER NOT NULL REFERENCES courses(id),
                    cohort_id INTEGER REFERENCES cohorts(id),
                    issued_by INTEGER NOT NULL REFERENCES users(id),
                    file_url TEXT NOT NULL,
                    file_name VARCHAR(255) NOT NULL,
                    created_at INTEGER NOT NULL,
                    CONSTRAINT uq_certificates_student_course UNIQUE (student_id, course_id)
                )
            """))
    if "material_progress" not in table_names:
        with engine.begin() as connection:
            connection.execute(text("""
                CREATE TABLE material_progress (
                    id INTEGER PRIMARY KEY,
                    material_id INTEGER NOT NULL REFERENCES course_materials(id),
                    student_id INTEGER NOT NULL REFERENCES users(id),
                    viewed_at INTEGER NOT NULL,
                    CONSTRAINT uq_material_progress_student UNIQUE (material_id, student_id)
                )
            """))
    if "announcement_reads" not in table_names:
        with engine.begin() as connection:
            connection.execute(text("""
                CREATE TABLE announcement_reads (
                    id INTEGER PRIMARY KEY,
                    announcement_id INTEGER NOT NULL REFERENCES announcements(id),
                    student_id INTEGER NOT NULL REFERENCES users(id),
                    read_at INTEGER NOT NULL,
                    CONSTRAINT uq_announcement_reads_student UNIQUE (announcement_id, student_id)
                )
            """))
    if "password_reset_tokens" not in table_names:
        with engine.begin() as connection:
            connection.execute(text("""
                CREATE TABLE password_reset_tokens (
                    id INTEGER PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    token_hash TEXT NOT NULL UNIQUE,
                    expires_at INTEGER NOT NULL,
                    used_at INTEGER,
                    created_at INTEGER NOT NULL
                )
            """))
    if "community_posts" not in table_names:
        with engine.begin() as connection:
            connection.execute(text("""
                CREATE TABLE community_posts (
                    id INTEGER PRIMARY KEY,
                    author_id INTEGER NOT NULL REFERENCES users(id),
                    title VARCHAR(255) NOT NULL,
                    body TEXT NOT NULL,
                    category VARCHAR(80) NOT NULL DEFAULT 'general',
                    audience VARCHAR(32) NOT NULL DEFAULT 'community',
                    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at INTEGER NOT NULL
                )
            """))
    if "community_comments" not in table_names:
        with engine.begin() as connection:
            connection.execute(text("""
                CREATE TABLE community_comments (
                    id INTEGER PRIMARY KEY,
                    post_id INTEGER NOT NULL REFERENCES community_posts(id),
                    parent_id INTEGER REFERENCES community_comments(id),
                    author_id INTEGER NOT NULL REFERENCES users(id),
                    body TEXT NOT NULL,
                    created_at INTEGER NOT NULL
                )
            """))
    community_comment_columns = {column["name"] for column in inspector.get_columns("community_comments")}
    if "parent_id" not in community_comment_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE community_comments ADD COLUMN parent_id INTEGER REFERENCES community_comments(id)"))
    enrollment_request_columns = {column["name"] for column in inspector.get_columns("enrollment_requests")}
    with engine.begin() as connection:
        if "experience_level" not in enrollment_request_columns:
            connection.execute(text("ALTER TABLE enrollment_requests ADD COLUMN experience_level VARCHAR(80)"))
        if "learning_goal" not in enrollment_request_columns:
            connection.execute(text("ALTER TABLE enrollment_requests ADD COLUMN learning_goal VARCHAR(120)"))

    announcement_columns = {column["name"] for column in inspector.get_columns("announcements")}
    with engine.begin() as connection:
        if "attachment_url" not in announcement_columns:
            connection.execute(text("ALTER TABLE announcements ADD COLUMN attachment_url TEXT"))
        if "attachment_name" not in announcement_columns:
            connection.execute(text("ALTER TABLE announcements ADD COLUMN attachment_name VARCHAR(255)"))
        if "is_urgent" not in announcement_columns:
            connection.execute(text("ALTER TABLE announcements ADD COLUMN is_urgent BOOLEAN NOT NULL DEFAULT FALSE"))

    support_ticket_columns = {column["name"] for column in inspector.get_columns("support_tickets")}
    if "category" not in support_ticket_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE support_tickets ADD COLUMN category VARCHAR(80) NOT NULL DEFAULT 'student_question'"))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def hash_reset_token(token: str) -> str:
    return hmac.new(APP_SECRET.encode("utf-8"), token.encode("utf-8"), sha256).hexdigest()


def is_email_delivery_configured() -> bool:
    return bool(RESEND_API_KEY and EMAIL_FROM)


def send_email(to_email: str, subject: str, text_body: str, html_body: str | None = None) -> bool:
    if not is_email_delivery_configured():
        return False

    payload = {
        "from": EMAIL_FROM,
        "to": [to_email],
        "subject": subject,
        "text": text_body,
    }
    if html_body:
        payload["html"] = html_body

    request = UrlRequest(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "three13-lms/1.0",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=12) as response:
            return 200 <= response.status < 300
    except HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        print(f"[email] Resend delivery failed: HTTP {exc.code} {error_body}")
    except Exception as exc:
        print(f"[email] Resend delivery failed: {exc}")
    return False


def encode_token(payload: dict, ttl_seconds: int = SESSION_TTL_SECONDS) -> str:
    body = {
        **payload,
        "exp": int(time.time()) + ttl_seconds,
        "nonce": secrets.token_hex(8),
    }
    raw = json.dumps(body, separators=(",", ":"), sort_keys=True).encode("utf-8")
    encoded = base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")
    signature = hmac.new(APP_SECRET.encode("utf-8"), encoded.encode("utf-8"), sha256).digest()
    encoded_signature = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")
    return f"{encoded}.{encoded_signature}"


def decode_token(token: str) -> dict:
    try:
        encoded, encoded_signature = token.split(".", 1)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid session token") from exc

    expected = hmac.new(APP_SECRET.encode("utf-8"), encoded.encode("utf-8"), sha256).digest()
    expected_signature = base64.urlsafe_b64encode(expected).decode("utf-8").rstrip("=")
    if not hmac.compare_digest(encoded_signature, expected_signature):
        raise HTTPException(status_code=401, detail="Invalid session token")

    padded = encoded + "=" * (-len(encoded) % 4)
    payload = json.loads(base64.urlsafe_b64decode(padded.encode("utf-8")))
    if payload.get("exp", 0) < int(time.time()):
        raise HTTPException(status_code=401, detail="Session expired")
    return payload


def normalize_otp_code(code: str) -> str:
    return re.sub(r"\D+", "", code or "")


def generate_totp_secret() -> str:
    return base64.b32encode(secrets.token_bytes(20)).decode("utf-8").rstrip("=")


def hotp(secret: str, counter: int, digits: int = 6) -> str:
    padded_secret = secret + "=" * (-len(secret) % 8)
    key = base64.b32decode(padded_secret.encode("utf-8"), casefold=True)
    digest = hmac.new(key, struct.pack(">Q", counter), sha1).digest()
    offset = digest[-1] & 0x0F
    code_int = struct.unpack(">I", digest[offset:offset + 4])[0] & 0x7FFFFFFF
    return str(code_int % (10 ** digits)).zfill(digits)


def verify_totp(secret: str | None, code: str, window: int = 1) -> bool:
    if not secret:
        return False
    normalized = normalize_otp_code(code)
    if len(normalized) != 6:
        return False
    current_counter = int(time.time()) // 30
    return any(hmac.compare_digest(hotp(secret, current_counter + offset), normalized) for offset in range(-window, window + 1))


def two_factor_otpauth_url(user: User, secret: str) -> str:
    issuer = "Three13 LMS"
    label = f"{issuer}:{user.email}"
    return (
        f"otpauth://totp/{quote(label)}"
        f"?secret={secret}&issuer={quote(issuer)}&algorithm=SHA1&digits=6&period=30"
    )


def user_display_name(user: User | None, fallback: str = "User") -> str:
    if not user:
        return fallback
    if user.role == "admin" and user.full_name == "Admin User":
        return "Administrator"
    return user.full_name


def user_to_response(user: User) -> dict:
    return {
        "id": user.id,
        "full_name": user_display_name(user),
        "email": user.email,
        "role": user.role,
        "lifecycle_status": user.lifecycle_status or "active_student",
        "is_active": user.is_active,
        "email_verified": user.email_verified,
        "created_at": user.created_at,
        "phone": user.phone,
        "profile_image_url": user.profile_image_url,
        "two_factor_enabled": bool(user.two_factor_enabled),
    }


def cohort_to_response(db: Session, cohort: Cohort, include_stats: bool = False) -> dict:
    stats = None
    if include_stats:
        enrolled_student_count = (
            db.query(Enrollment.student_id)
            .filter(Enrollment.cohort_id == cohort.id, Enrollment.status == "approved")
            .distinct()
            .count()
        )
        alumni_count = db.query(User).filter(User.role == "student", User.lifecycle_status == "alumni", User.alumni_cohort_id == cohort.id).count()
        stats = {
            "students": enrolled_student_count + alumni_count,
            "active_students": enrolled_student_count,
            "alumni": alumni_count,
            "enrollments": enrolled_student_count + alumni_count,
            "course_access_records": db.query(Enrollment).filter(Enrollment.cohort_id == cohort.id, Enrollment.status == "approved").count(),
            "requests": db.query(EnrollmentRequest).filter(EnrollmentRequest.cohort_id == cohort.id).count(),
        }
    return {
        "id": cohort.id,
        "name": cohort.name,
        "status": cohort.status,
        "starts_at": cohort.starts_at,
        "ends_at": cohort.ends_at,
        "created_at": cohort.created_at,
        "archived_at": cohort.archived_at,
        "stats": stats,
    }


def csv_response(filename: str, rows: list[list[object]]) -> Response:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerows(rows)
    safe_filename = re.sub(r"[^A-Za-z0-9_.-]+", "-", filename).strip("-") or "export.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{safe_filename}"'},
    )


def learner_display_id(user: User) -> str:
    prefix = "ALM" if (user.lifecycle_status or "active_student") == "alumni" else "STU"
    year = time.strftime("%Y", time.localtime(user.created_at or now_ts()))
    return f"{prefix}-{year}-{user.id:05d}"


def backfill_unassigned_alumni_cohorts(db: Session) -> int:
    fallback_cohort = (
        db.query(Cohort)
        .filter(Cohort.status == "completed")
        .order_by(Cohort.ends_at.desc().nullslast(), Cohort.created_at.desc())
        .first()
    )
    if not fallback_cohort:
        return 0
    updated = (
        db.query(User)
        .filter(User.role == "student", User.lifecycle_status == "alumni", User.alumni_cohort_id.is_(None))
        .update({User.alumni_cohort_id: fallback_cohort.id}, synchronize_session=False)
    )
    if updated:
        db.commit()
    return updated


def get_active_cohort(db: Session, create_if_missing: bool = True) -> Cohort | None:
    cohort = db.query(Cohort).filter(Cohort.status == "active").order_by(Cohort.created_at.desc()).first()
    if cohort or not create_if_missing:
        return cohort
    now = now_ts()
    cohort = Cohort(name="Current Cohort", status="active", starts_at=now, created_at=now)
    db.add(cohort)
    db.flush()
    return cohort


def user_has_community_access(user: User) -> bool:
    if user.role in {"admin", "teacher"}:
        return True
    if user.role == "student":
        lifecycle = user.lifecycle_status or "active_student"
        return bool(user.is_active) or lifecycle == "alumni"
    return False


def user_can_view_community_post(user: User, post: CommunityPost) -> bool:
    if not user_has_community_access(user):
        return False
    if user.role == "admin":
        return True
    lifecycle = user.lifecycle_status or "active_student"
    if post.audience == "students":
        return lifecycle == "active_student"
    if post.audience == "alumni":
        return lifecycle == "alumni"
    return user.role in {"student", "teacher", "admin"}


def community_post_to_response(post: CommunityPost, author: User, comments: list[tuple[CommunityComment, User]]) -> dict:
    comment_items = {}
    child_counts = {}
    for comment, comment_author in comments:
        item = {
            "id": comment.id,
            "post_id": comment.post_id,
            "parent_id": comment.parent_id,
            "body": comment.body,
            "created_at": comment.created_at,
            "author": {
                "id": comment_author.id,
                "full_name": user_display_name(comment_author),
                "role": comment_author.role,
                "lifecycle_status": comment_author.lifecycle_status or "active_student",
                "profile_image_url": comment_author.profile_image_url,
            },
            "replies": [],
            "reply_count": 0,
        }
        comment_items[comment.id] = item
        if comment.parent_id:
            child_counts[comment.parent_id] = child_counts.get(comment.parent_id, 0) + 1
    roots = []
    for comment, _comment_author in comments:
        item = comment_items[comment.id]
        item["reply_count"] = child_counts.get(comment.id, 0)
        if comment.parent_id and comment.parent_id in comment_items:
            comment_items[comment.parent_id]["replies"].append(item)
        else:
            roots.append(item)

    return {
        "id": post.id,
        "title": post.title,
        "body": post.body,
        "category": post.category,
        "audience": post.audience,
        "is_pinned": post.is_pinned,
        "created_at": post.created_at,
        "author": {
            "id": author.id,
            "full_name": user_display_name(author),
            "role": author.role,
            "lifecycle_status": author.lifecycle_status or "active_student",
            "profile_image_url": author.profile_image_url,
        },
        "comments": roots,
        "comment_count": len(comments),
    }


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing session token")

    payload = decode_token(authorization.removeprefix("Bearer ").strip())
    user = db.get(User, payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="Account is unavailable")
    if not user.is_active and user.role != "student":
        raise HTTPException(status_code=401, detail="Account is inactive or unavailable")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def require_student(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    return current_user


def require_teacher(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Teacher access required")
    return current_user


def create_audit_log(
    db: Session,
    actor: User | None,
    action: str,
    target_type: str,
    target_id: int | None,
    summary: str,
    metadata: dict | None = None,
) -> AuditLog:
    audit_log = AuditLog(
        actor_id=actor.id if actor else None,
        action=action,
        target_type=target_type,
        target_id=target_id,
        summary=summary,
        metadata_json=metadata or {},
    )
    db.add(audit_log)
    return audit_log


def build_teacher_action_activity(db: Session, limit: int = 8, course_ids: set[int] | None = None) -> list[dict]:
    AuditActor = aliased(User)
    recent_teacher_action_rows = (
        db.query(AuditLog, AuditActor)
        .outerjoin(AuditActor, AuditLog.actor_id == AuditActor.id)
        .filter(
            AuditLog.action.in_(
                [
                    "teacher.assignment_created",
                    "teacher.material_created",
                    "teacher.module_created",
                    "assignment.created",
                    "material.created",
                    "module.created",
                ]
            )
        )
        .order_by(AuditLog.created_at.desc())
        .limit(max(limit * 4, 20) if course_ids else limit)
        .all()
    )
    activities = []
    for log, actor in recent_teacher_action_rows:
        actor_name = user_display_name(actor, "Teacher")
        metadata = log.metadata_json or {}
        course_id = metadata.get("course_id")
        if course_ids is not None and course_id not in course_ids:
            continue
        course = db.get(Course, course_id) if course_id else None
        course_title = course.title if course else "assigned course"
        base_activity = {
            "actor": actor_name,
            "course": course_title,
            "created_at": log.created_at,
        }
        if log.action in {"teacher.assignment_created", "assignment.created"}:
            assignment = db.get(Assignment, log.target_id) if log.target_id else None
            assignment_title = assignment.title if assignment else "an assignment"
            module = db.get(Module, assignment.module_id) if assignment and assignment.module_id else None
            activities.append(
                {
                    **base_activity,
                    "id": f"content-assignment-{log.id}",
                    "target_id": assignment.id if assignment else log.target_id,
                    "type": "assignment",
                    "title": "Assignment created",
                    "detail": f"{actor_name} created \"{assignment_title}\"",
                    "detail_status": "Open" if not assignment or assignment.is_open else "Closed",
                    "location": module.title if module else "Course assignment",
                    "action_label": "View assignment",
                    "pane": "assignments",
                }
            )
        elif log.action in {"teacher.material_created", "material.created"}:
            material = db.get(CourseMaterial, log.target_id) if log.target_id else None
            material_title = material.title if material else "a material"
            module = db.get(Module, material.module_id) if material and material.module_id else None
            activities.append(
                {
                    **base_activity,
                    "id": f"content-material-{log.id}",
                    "target_id": material.id if material else log.target_id,
                    "type": "material",
                    "title": "Material uploaded",
                    "detail": f"{actor_name} added \"{material_title}\"",
                    "detail_status": (material.material_type if material else "File").replace("_", " ").title(),
                    "location": module.title if module else "Course materials",
                    "action_label": "Open material",
                    "pane": "materials",
                }
            )
        elif log.action in {"teacher.module_created", "module.created"}:
            module = db.get(Module, log.target_id) if log.target_id else None
            module_title = module.title if module else "a module"
            activities.append(
                {
                    **base_activity,
                    "id": f"content-module-{log.id}",
                    "target_id": module.id if module else log.target_id,
                    "type": "module",
                    "title": "Module created",
                    "detail": f"{actor_name} created \"{module_title}\"",
                    "detail_status": "Visible" if not module or module.is_visible else "Hidden",
                    "location": "Course structure",
                    "action_label": "Open materials",
                    "pane": "materials",
                }
            )
    return activities[:limit]


def build_admin_recent_activity(db: Session, limit: int = 8) -> list[dict]:
    recent_submission_rows = (
        db.query(Submission, User, Assignment, Course, Module)
        .join(User, Submission.student_id == User.id)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .outerjoin(Module, Assignment.module_id == Module.id)
        .order_by(Submission.submitted_at.desc())
        .limit(limit)
        .all()
    )
    recent_enrollment_rows = (
        db.query(Enrollment, User, Course)
        .join(User, Enrollment.student_id == User.id)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(Enrollment.status == "approved")
        .order_by(Enrollment.approved_at.desc().nullslast(), Enrollment.created_at.desc())
        .limit(limit)
        .all()
    )
    recent_support_ticket_rows = (
        db.query(SupportTicket, User)
        .outerjoin(User, SupportTicket.user_id == User.id)
        .order_by(SupportTicket.created_at.desc())
        .limit(limit)
        .all()
    )
    AuditActor = aliased(User)
    recent_support_logs = (
        db.query(AuditLog, AuditActor)
        .outerjoin(AuditActor, AuditLog.actor_id == AuditActor.id)
        .filter(AuditLog.target_type == "support_ticket", AuditLog.action != "support.ticket_created")
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )
    recent_announcement_rows = (
        db.query(Announcement, User)
        .join(User, Announcement.author_id == User.id)
        .order_by(Announcement.created_at.desc())
        .limit(limit)
        .all()
    )
    recent_material_rows = (
        db.query(CourseMaterial, Course, Module, User)
        .join(Course, CourseMaterial.course_id == Course.id)
        .outerjoin(Module, CourseMaterial.module_id == Module.id)
        .outerjoin(User, Course.teacher_id == User.id)
        .order_by(CourseMaterial.created_at.desc())
        .limit(limit)
        .all()
    )
    recent_course_rows = db.query(Course).order_by(Course.created_at.desc()).limit(limit).all()
    recent_teacher_activity = build_teacher_action_activity(db, limit)
    enrollment_activity_by_student: dict[tuple[int, int | None], dict] = {}
    for enrollment, student, course in recent_enrollment_rows:
        key = (student.id, enrollment.cohort_id)
        activity = enrollment_activity_by_student.setdefault(
            key,
            {
                "id": f"enrollment-student-{student.id}-cohort-{enrollment.cohort_id or 'none'}",
                "type": "enrollment",
                "title": "Student enrolled",
                "actor": user_display_name(student),
                "course_titles": [],
                "created_at": enrollment.approved_at or enrollment.created_at,
                "action_label": "View student",
                "pane": "students",
            },
        )
        activity["course_titles"].append(course.title)
        activity["created_at"] = max(activity["created_at"], enrollment.approved_at or enrollment.created_at)
    enrollment_activity = []
    for activity in enrollment_activity_by_student.values():
        course_titles = activity.pop("course_titles")
        course_count = len(course_titles)
        first_course = course_titles[0] if course_titles else "course access"
        activity["detail"] = (
            f"{activity['actor']} enrolled in {course_count} courses"
            if course_count != 1
            else f"{activity['actor']} enrolled in {first_course}"
        )
        activity["detail_status"] = "New enrollment"
        activity["course"] = f"{course_count} courses" if course_count != 1 else first_course
        activity["location"] = "Enrollment"
        enrollment_activity.append(activity)

    return sorted(
        [
            *[
                {
                    "id": f"submission-{submission.id}",
                    "type": "submission",
                    "title": "Assignment submitted",
                    "actor": user_display_name(student),
                    "detail": f"{user_display_name(student)} submitted \"{assignment.title}\"",
                    "detail_status": "Late" if submission.status == "late" else "On time",
                    "course": course.title,
                    "location": module.title if module else "Course assignment",
                    "created_at": submission.submitted_at,
                    "action_label": "View submission",
                    "pane": "assignments",
                }
                for submission, student, assignment, course, module in recent_submission_rows
            ],
            *enrollment_activity,
            *[
                {
                    "id": f"support-ticket-{ticket.id}",
                    "type": "support",
                    "title": "Support ticket created",
                    "actor": user_display_name(user, ticket.name),
                    "detail": f"{user_display_name(user, ticket.name)} created \"{ticket.subject}\"",
                    "detail_status": ticket.status.replace("_", " ").title(),
                    "course": "Technical Support",
                    "location": ticket.category.replace("_", " ").title(),
                    "created_at": ticket.created_at,
                    "action_label": "Open ticket",
                    "pane": "support",
                }
                for ticket, user in recent_support_ticket_rows
            ],
            *[
                {
                    "id": f"support-{log.id}",
                    "type": "support",
                    "title": "Support ticket updated",
                    "actor": user_display_name(actor, "Administrator"),
                    "detail": log.summary,
                    "detail_status": "Updated",
                    "course": "Technical Support",
                    "location": "Support",
                    "created_at": log.created_at,
                    "action_label": "Open ticket",
                    "pane": "support",
                }
                for log, actor in recent_support_logs
            ],
            *[
                {
                    "id": f"announcement-{announcement.id}",
                    "type": "announcement",
                    "title": "Announcement posted",
                    "actor": user_display_name(author),
                    "detail": f"{user_display_name(author)} posted \"{announcement.title}\"",
                    "detail_status": "Visible",
                    "course": course.title if course else "All Courses",
                    "location": "Announcement",
                    "created_at": announcement.created_at,
                    "action_label": "View announcement",
                    "pane": "announcements",
                }
                for announcement, author in recent_announcement_rows
                for course in [db.get(Course, announcement.course_id) if announcement.course_id else None]
            ],
            *recent_teacher_activity,
            *[
                {
                    "id": f"course-{course.id}",
                    "type": "course",
                    "title": "Course created",
                    "actor": "Administrator",
                    "detail": f"Created \"{course.title}\"",
                    "detail_status": f"{db.query(Module).filter(Module.course_id == course.id).count()} modules",
                    "course": course.title,
                    "location": "Course",
                    "created_at": course.created_at,
                    "action_label": "View course",
                    "pane": "courses",
                }
                for course in recent_course_rows
            ],
        ],
        key=lambda item: item["created_at"] or 0,
        reverse=True,
    )[:limit]


def audit_log_to_response(audit_log: AuditLog, actor: User | None = None) -> dict:
    return {
        "id": audit_log.id,
        "action": audit_log.action,
        "target_type": audit_log.target_type,
        "target_id": audit_log.target_id,
        "summary": audit_log.summary,
        "metadata": audit_log.metadata_json,
        "created_at": audit_log.created_at,
        "actor": {
            "id": actor.id,
            "full_name": user_display_name(actor),
            "email": actor.email,
            "role": actor.role,
        }
        if actor
        else None,
    }


@app.get("/")
def read_root():
    return {"message": "Backend is working!"}


@app.post("/auth/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(func.lower(User.email) == data.email.lower()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active and user.role != "student":
        raise HTTPException(status_code=403, detail="This account has been deactivated")

    response_user = user_to_response(user)
    if user.two_factor_enabled:
        challenge_token = encode_token({"sub": user.id, "role": user.role, "purpose": "two_factor_login"}, ttl_seconds=10 * 60)
        return {"requires_two_factor": True, "challenge_token": challenge_token, "user": response_user}
    token = encode_token({"sub": user.id, "role": user.role})
    return {"token": token, "user": response_user}


@app.get("/auth/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return user_to_response(current_user)


@app.patch("/auth/profile", response_model=UserResponse)
def update_profile(
    data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    full_name = data.full_name.strip()
    phone = (data.phone or "").strip() or None
    if not full_name:
        raise HTTPException(status_code=400, detail="Full name is required")
    if phone and len(phone) > 40:
        raise HTTPException(status_code=400, detail="Phone number is too long")
    current_user.full_name = full_name
    current_user.phone = phone
    db.commit()
    db.refresh(current_user)
    return user_to_response(current_user)


@app.post("/auth/profile-image", response_model=UserResponse)
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    original_name = safe_upload_filename(file.filename or "profile-photo")
    extension = "." + original_name.rsplit(".", 1)[-1].lower() if "." in original_name else ""
    if extension not in ALLOWED_PROFILE_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Profile photo must be a JPG, PNG, WEBP, or GIF image")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File is empty")
    if len(content) > MAX_PROFILE_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Profile photo must be 5 MB or smaller")

    file_path = f"profiles/{current_user.id}/{now_ts()}-{uuid.uuid4().hex[:10]}-{original_name}"
    file_url = upload_to_supabase_storage(file_path, content, file.content_type)
    current_user.profile_image_url = file_url
    db.commit()
    db.refresh(current_user)
    return user_to_response(current_user)


@app.post("/auth/password")
def change_password(
    data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_password = data.current_password or ""
    new_password = data.new_password or ""
    if not verify_password(current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(new_password) < 9 or len(new_password) > 72:
        raise HTTPException(status_code=400, detail="New password must be at least 9 characters")
    if verify_password(new_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Choose a password that is different from your current password")

    current_user.password_hash = hash_password(new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@app.post("/auth/password-reset/request")
def request_password_reset(data: PasswordResetRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    generic_message = "If an account exists for that email, password reset instructions have been sent."
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    user = db.query(User).filter(func.lower(User.email) == email).first()
    if not user:
        return {"message": generic_message}

    token = secrets.token_urlsafe(32)
    db.add(PasswordResetToken(user_id=user.id, token_hash=hash_reset_token(token), expires_at=now_ts() + 30 * 60))
    db.commit()
    reset_url = f"{FRONTEND_URL.rstrip('/')}/login?reset_token={token}&email={quote(user.email)}"
    email_sent = send_email(
        user.email,
        "Reset your Three13 password",
        (
            f"Hi {user.full_name},\n\n"
            "We received a request to reset your Three13 password.\n\n"
            f"Open this link to reset your password: {reset_url}\n\n"
            f"Or paste this reset token into the password reset form:\n{token}\n\n"
            "This reset token expires in 30 minutes. If you did not request this, you can ignore this email."
        ),
        (
            f"<p>Hi {user.full_name},</p>"
            "<p>We received a request to reset your Three13 password.</p>"
            f"<p><a href=\"{reset_url}\">Reset your password</a></p>"
            f"<p>Or paste this reset token into the password reset form:</p><p><strong>{token}</strong></p>"
            "<p>This reset token expires in 30 minutes. If you did not request this, you can ignore this email.</p>"
        ),
    )
    if not email_sent:
        print(f"[password reset] Reset token for {user.email}: {token}")
    return {
        "message": generic_message,
        "email_sent": email_sent,
        "dev_token": None if email_sent else token,
    }


@app.post("/auth/password-reset/confirm")
def confirm_password_reset(data: PasswordResetConfirmRequest, db: Session = Depends(get_db)):
    token = data.token.strip()
    new_password = data.new_password or ""
    if not token:
        raise HTTPException(status_code=400, detail="Reset token is required")
    if len(new_password) < 9 or len(new_password) > 72:
        raise HTTPException(status_code=400, detail="New password must be at least 9 characters")

    reset_row = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == hash_reset_token(token),
            PasswordResetToken.used_at == None,  # noqa: E711
            PasswordResetToken.expires_at >= now_ts(),
        )
        .first()
    )
    if not reset_row:
        raise HTTPException(status_code=400, detail="Reset link is invalid or expired")

    user = db.get(User, reset_row.user_id)
    if not user:
        raise HTTPException(status_code=400, detail="Reset link is invalid or expired")
    if verify_password(new_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Choose a password that is different from your current password")

    if (user.lifecycle_status or "active_student") == "alumni":
        selected_cohort = None
        if data.cohort_id:
            selected_cohort = db.query(Cohort).filter(Cohort.id == data.cohort_id, Cohort.status == "completed").first()
            if not selected_cohort:
                raise HTTPException(status_code=400, detail="Choose a valid completed cohort")
        if selected_cohort:
            user.alumni_cohort_id = selected_cohort.id
        elif not user.alumni_cohort_id:
            fallback_cohort = (
                db.query(Cohort)
                .filter(Cohort.status == "completed")
                .order_by(Cohort.ends_at.desc().nullslast(), Cohort.created_at.desc())
                .first()
            )
            user.alumni_cohort_id = fallback_cohort.id if fallback_cohort else None

    user.password_hash = hash_password(new_password)
    reset_row.used_at = now_ts()
    db.commit()
    return {"message": "Password reset successfully. You can sign in with your new password."}


@app.get("/cohorts/completed", response_model=list[CohortResponse])
def list_completed_cohorts(db: Session = Depends(get_db)):
    cohorts = (
        db.query(Cohort)
        .filter(Cohort.status == "completed")
        .order_by(Cohort.ends_at.desc().nullslast(), Cohort.created_at.desc())
        .all()
    )
    return [cohort_to_response(db, cohort, include_stats=False) for cohort in cohorts]


@app.post("/auth/2fa/setup")
def setup_two_factor(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.two_factor_enabled and current_user.two_factor_secret:
        secret = current_user.two_factor_secret
    else:
        secret = current_user.two_factor_secret or generate_totp_secret()
        current_user.two_factor_secret = secret
        db.commit()
    return {
        "secret": secret,
        "otpauth_url": two_factor_otpauth_url(current_user, secret),
        "issuer": "Three13 LMS",
        "account": current_user.email,
    }


@app.post("/auth/2fa/enable", response_model=UserResponse)
def enable_two_factor(
    data: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    secret = current_user.two_factor_secret or generate_totp_secret()
    if not current_user.two_factor_secret:
        current_user.two_factor_secret = secret
        db.flush()
    if not verify_totp(secret, data.code):
        raise HTTPException(status_code=400, detail="Invalid authenticator code")
    current_user.two_factor_enabled = True
    db.commit()
    db.refresh(current_user)
    return user_to_response(current_user)


@app.post("/auth/2fa/disable", response_model=UserResponse)
def disable_two_factor(
    data: TwoFactorDisableRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password or "", current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.two_factor_enabled = False
    current_user.two_factor_secret = None
    db.commit()
    db.refresh(current_user)
    return user_to_response(current_user)


@app.post("/auth/login/2fa")
def verify_login_two_factor(data: TwoFactorLoginVerifyRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_token(data.challenge_token)
    except HTTPException as exc:
        raise HTTPException(status_code=401, detail="Two-factor session expired. Sign in again.") from exc
    if payload.get("purpose") != "two_factor_login":
        raise HTTPException(status_code=401, detail="Invalid two-factor session")
    user = db.get(User, payload["sub"])
    if not user or not user.two_factor_enabled:
        raise HTTPException(status_code=401, detail="Invalid two-factor session")

    if not verify_totp(user.two_factor_secret, data.code):
        raise HTTPException(status_code=400, detail="Invalid authenticator code")

    token = encode_token({"sub": user.id, "role": user.role})
    return {"token": token, "user": user_to_response(user)}


@app.get("/courses", response_model=list[CourseResponse])
def list_courses(db: Session = Depends(get_db)):
    return (
        db.query(Course)
        .filter(Course.status == "active")
        .order_by(Course.title.asc())
        .all()
    )


@app.post("/enrollment-requests", response_model=EnrollmentRegistrationResponse)
def create_enrollment_request(data: EnrollmentRegistrationRequest, db: Session = Depends(get_db)):
    if not data.agree:
        raise HTTPException(status_code=400, detail="Terms agreement is required")
    if len(data.password) < 9 or len(data.password) > 72:
        raise HTTPException(status_code=400, detail="Password must be at least 9 characters")

    normalized_email = data.email.strip().lower()
    active_cohort = get_active_cohort(db)
    if not active_cohort:
        raise HTTPException(status_code=400, detail="No active cohort is available for registration")
    courses = db.query(Course).filter(Course.status == "active").order_by(Course.title.asc()).all()
    if not courses:
        raise HTTPException(status_code=400, detail="No active courses are available right now")
    platform_settings, _ = get_platform_settings(db)
    default_status = (platform_settings.get("enrollment_rules") or {}).get("default_enrollment_status", "pending")
    auto_approve = default_status == "approved"

    student = db.query(User).filter(func.lower(User.email) == normalized_email).first()
    if student:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists. Please sign in or use a different email.",
        )

    student = User(
        full_name=data.full_name.strip(),
        email=normalized_email,
        phone=data.phone.strip(),
        password_hash=hash_password(data.password),
        role="student",
        lifecycle_status="active_student",
        is_active=auto_approve,
        email_verified=False,
    )
    db.add(student)
    db.flush()

    request_ids = []
    for course in courses:
        enrollment_request = (
            db.query(EnrollmentRequest)
            .filter(
                EnrollmentRequest.student_id == student.id,
                EnrollmentRequest.course_id == course.id,
                EnrollmentRequest.cohort_id == active_cohort.id,
            )
            .first()
        )
        if not enrollment_request:
            enrollment_request = EnrollmentRequest(student_id=student.id, course_id=course.id, cohort_id=active_cohort.id)
            db.add(enrollment_request)
            db.flush()

        enrollment_request.status = "approved" if auto_approve else "pending"
        enrollment_request.prerequisites = data.prerequisites
        enrollment_request.experience_level = data.experience_level
        enrollment_request.learning_goal = data.learning_goal
        if auto_approve:
            enrollment_request.reviewed_at = now_ts()
            enrollment = (
                db.query(Enrollment)
                .filter(
                    Enrollment.student_id == student.id,
                    Enrollment.course_id == course.id,
                    Enrollment.cohort_id == active_cohort.id,
                )
                .first()
            )
            if not enrollment:
                db.add(
                    Enrollment(
                        student_id=student.id,
                        course_id=course.id,
                        cohort_id=active_cohort.id,
                        status="approved",
                        approved_at=now_ts(),
                    )
                )
        request_ids.append(enrollment_request.id)

    db.commit()
    return {
        "message": "Registration approved. You can sign in and begin your courses." if auto_approve else "Registration submitted. You can sign in now, and course access will unlock after admin activation.",
        "student_id": student.id,
        "enrollment_request_ids": request_ids,
    }


@app.post("/support-tickets", response_model=SupportTicketResponse)
def create_support_ticket(
    data: SupportTicketCreateRequest,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    user = None
    if authorization and authorization.startswith("Bearer "):
        try:
            payload = decode_token(authorization.removeprefix("Bearer ").strip())
            user = db.get(User, payload["sub"])
        except HTTPException:
            user = None

    name = data.name.strip()
    email = data.email.strip().lower()
    subject = data.subject.strip()
    message = data.message.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    if not subject:
        raise HTTPException(status_code=400, detail="Subject is required")
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    ticket = SupportTicket(
        user_id=user.id if user else None,
        name=name,
        email=email,
        category=data.category,
        subject=subject,
        message=message,
        attachment_url=data.attachment_url.strip() if data.attachment_url else None,
        status="open",
    )
    db.add(ticket)
    db.flush()
    create_audit_log(
        db,
        user,
        "support.ticket_created",
        "support_ticket",
        ticket.id,
        f"{name} created support ticket \"{subject}\"",
        {"status": ticket.status, "category": ticket.category, "email": email},
    )
    db.commit()
    db.refresh(ticket)
    return support_ticket_to_response(ticket, user)


@app.get("/student/support-tickets", response_model=list[SupportTicketResponse])
def student_list_support_tickets(
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    tickets = (
        db.query(SupportTicket)
        .filter(SupportTicket.user_id == student.id)
        .order_by(SupportTicket.created_at.desc())
        .all()
    )
    return [support_ticket_to_response(ticket, student) for ticket in tickets]


@app.get("/teacher/support-tickets", response_model=list[SupportTicketResponse])
def teacher_list_support_tickets(
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    tickets = (
        db.query(SupportTicket)
        .filter(SupportTicket.user_id == teacher.id)
        .order_by(SupportTicket.created_at.desc())
        .all()
    )
    return [support_ticket_to_response(ticket, teacher) for ticket in tickets]


@app.get("/community/posts", response_model=list[CommunityPostResponse])
def list_community_posts(
    category: Literal["all", "general", "discussion", "job", "resource", "win", "question", "jobs", "resources", "wins", "questions"] = "all",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user_has_community_access(current_user):
        raise HTTPException(status_code=403, detail="Community access requires an active or alumni account")
    query = db.query(CommunityPost, User).join(User, CommunityPost.author_id == User.id)
    if category != "all":
        category_aliases = {
            "discussion": ["discussion", "general"],
            "general": ["discussion", "general"],
            "job": ["job", "jobs"],
            "jobs": ["job", "jobs"],
            "resource": ["resource", "resources"],
            "resources": ["resource", "resources"],
            "win": ["win", "wins"],
            "wins": ["win", "wins"],
            "question": ["question", "questions"],
            "questions": ["question", "questions"],
        }
        query = query.filter(CommunityPost.category.in_(category_aliases.get(category, [category])))
    rows = query.order_by(CommunityPost.is_pinned.desc(), CommunityPost.created_at.desc()).limit(50).all()
    visible_rows = [(post, author) for post, author in rows if user_can_view_community_post(current_user, post)]
    post_ids = [post.id for post, _author in visible_rows]
    comment_rows = (
        db.query(CommunityComment, User)
        .join(User, CommunityComment.author_id == User.id)
        .filter(CommunityComment.post_id.in_(post_ids))
        .order_by(CommunityComment.created_at.asc())
        .all()
        if post_ids
        else []
    )
    comments_by_post = {post_id: [] for post_id in post_ids}
    for comment, author in comment_rows:
        comments_by_post.setdefault(comment.post_id, []).append((comment, author))
    return [community_post_to_response(post, author, comments_by_post.get(post.id, [])) for post, author in visible_rows]


@app.post("/community/posts", response_model=CommunityPostResponse)
def create_community_post(
    data: CommunityPostCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user_has_community_access(current_user):
        raise HTTPException(status_code=403, detail="Community access requires an active or alumni account")
    title = data.title.strip()
    body = data.body.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Post title is required")
    if not body:
        raise HTTPException(status_code=400, detail="Post message is required")
    if data.audience != "community" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can restrict posts to students or alumni")
    post = CommunityPost(
        author_id=current_user.id,
        title=title,
        body=body,
        category=data.category,
        audience=data.audience,
        is_pinned=False,
        created_at=now_ts(),
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return community_post_to_response(post, current_user, [])


@app.post("/community/posts/{post_id}/comments", response_model=CommunityPostResponse)
def create_community_comment(
    post_id: int,
    data: CommunityCommentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.query(CommunityPost, User).join(User, CommunityPost.author_id == User.id).filter(CommunityPost.id == post_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Community post not found")
    post, author = row
    if not user_has_community_access(current_user):
        raise HTTPException(status_code=403, detail="Community access requires an active or alumni account")
    if not user_can_view_community_post(current_user, post):
        raise HTTPException(status_code=403, detail="You cannot comment on this post")
    body = data.body.strip()
    if not body:
        raise HTTPException(status_code=400, detail="Comment is required")
    parent_id = data.parent_id
    if parent_id is not None:
        parent = db.query(CommunityComment).filter(CommunityComment.id == parent_id, CommunityComment.post_id == post.id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")
    comment = CommunityComment(post_id=post.id, parent_id=parent_id, author_id=current_user.id, body=body, created_at=now_ts())
    db.add(comment)
    db.commit()
    comment_rows = (
        db.query(CommunityComment, User)
        .join(User, CommunityComment.author_id == User.id)
        .filter(CommunityComment.post_id == post.id)
        .order_by(CommunityComment.created_at.asc())
        .all()
    )
    return community_post_to_response(post, author, comment_rows)


def enrollment_request_to_response(request_row: EnrollmentRequest, student: User, course: Course) -> dict:
    return {
        "id": request_row.id,
        "status": request_row.status,
        "prerequisites": request_row.prerequisites,
        "experience_level": request_row.experience_level,
        "learning_goal": request_row.learning_goal,
        "created_at": request_row.created_at,
        "student": {
            "id": student.id,
            "full_name": student.full_name,
            "email": student.email,
            "phone": student.phone,
        },
        "course": {
            "id": course.id,
            "title": course.title,
        },
        "cohort": {"id": request_row.cohort_id} if request_row.cohort_id else None,
    }


def course_to_student_status(course: Course, status: str, timestamp: int | None = None) -> dict:
    return {
        "course": {
            "id": course.id,
            "title": course.title,
            "description": course.description,
        },
        "status": status,
        "timestamp": timestamp,
    }


def get_student_approved_enrollment(db: Session, student_id: int, course_id: int) -> Enrollment | None:
    active_cohort = get_active_cohort(db, create_if_missing=False)
    return (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == student_id,
            Enrollment.course_id == course_id,
            Enrollment.status == "approved",
            Enrollment.cohort_id == active_cohort.id if active_cohort else Enrollment.cohort_id.is_(None),
        )
        .first()
    )


def require_student_course_access(db: Session, student: User, course_id: int) -> Enrollment:
    if not student.is_active:
        raise HTTPException(status_code=403, detail="Course access is pending admin activation")
    if (student.lifecycle_status or "active_student") != "active_student":
        raise HTTPException(status_code=403, detail="This account is marked as alumni and does not have active course access")
    enrollment = get_student_approved_enrollment(db, student.id, course_id)
    if not enrollment:
        ensure_student_all_active_course_access(db, student)
        enrollment = get_student_approved_enrollment(db, student.id, course_id)
    if not enrollment:
        raise HTTPException(status_code=403, detail="This course is not currently available")
    return enrollment


def student_course_to_response(course: Course, enrollment: Enrollment | None = None, teacher: User | None = None) -> dict:
    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "status": course.status,
        "teacher": {
            "id": teacher.id,
            "full_name": teacher.full_name,
            "email": teacher.email,
            "profile_image_url": teacher.profile_image_url,
        }
        if teacher
        else None,
        "enrollment": {
            "id": enrollment.id,
            "status": enrollment.status,
            "cohort_id": enrollment.cohort_id,
            "approved_at": enrollment.approved_at,
            "created_at": enrollment.created_at,
        }
        if enrollment
        else None,
        "created_at": course.created_at,
    }


def ensure_student_all_active_course_access(db: Session, student: User) -> list[Enrollment]:
    if (student.lifecycle_status or "active_student") != "active_student":
        return []
    active_cohort = get_active_cohort(db)
    if not active_cohort:
        return []
    active_courses = db.query(Course).filter(Course.status == "active").order_by(Course.title.asc()).all()
    now = now_ts()
    enrollments = []
    changed = False

    for course in active_courses:
        enrollment = (
            db.query(Enrollment)
            .filter(Enrollment.student_id == student.id, Enrollment.course_id == course.id, Enrollment.cohort_id == active_cohort.id)
            .first()
        )
        if not enrollment:
            enrollment = Enrollment(
                student_id=student.id,
                course_id=course.id,
                cohort_id=active_cohort.id,
                status="approved",
                approved_at=now,
            )
            db.add(enrollment)
            changed = True
        elif enrollment.status != "approved":
            enrollment.status = "approved"
            enrollment.approved_at = enrollment.approved_at or now
            changed = True

        request_row = (
            db.query(EnrollmentRequest)
            .filter(EnrollmentRequest.student_id == student.id, EnrollmentRequest.course_id == course.id, EnrollmentRequest.cohort_id == active_cohort.id)
            .first()
        )
        if not request_row:
            request_row = EnrollmentRequest(
                student_id=student.id,
                course_id=course.id,
                cohort_id=active_cohort.id,
                status="approved",
                reviewed_at=now,
            )
            db.add(request_row)
            changed = True
        elif request_row.status != "approved":
            request_row.status = "approved"
            request_row.reviewed_at = request_row.reviewed_at or now
            changed = True

        enrollments.append(enrollment)

    if changed:
        db.commit()

    return enrollments


def assignment_with_student_status(
    assignment: Assignment,
    course: Course,
    module: Module | None,
    submission: Submission | None,
    grade: Grade | None,
) -> dict:
    now = now_ts()
    status = "not_submitted"
    teacher_comment = None
    if submission:
        status = "graded" if grade else submission.status
        teacher_comment = submission.teacher_feedback or (grade.feedback if grade else None)
    elif assignment.due_at and assignment.due_at < now:
        status = "late"

    return {
        **assignment_to_content_response(assignment),
        "course": {"id": course.id, "title": course.title},
        "module": {"id": module.id, "title": module.title} if module else None,
        "student_status": status,
        "submission": {
            "id": submission.id,
            "text_response": submission.text_response,
            "file_url": submission.file_url,
            "status": submission.status,
            "submitted_at": submission.submitted_at,
        }
        if submission
        else None,
        "teacher_comment": teacher_comment,
        "grade": {
            "id": grade.id,
            "score": grade.score,
            "total_points": grade.total_points,
            "feedback": teacher_comment,
            "graded_at": grade.graded_at,
        }
        if grade
        else None,
    }


@app.get("/student/enrollments", response_model=StudentEnrollmentStatusResponse)
def student_list_enrollments(
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if not student.is_active:
        return {"approved": [], "pending": [], "rejected": []}
    if (student.lifecycle_status or "active_student") != "active_student":
        return {"approved": [], "pending": [], "rejected": []}
    active_cohort = get_active_cohort(db, create_if_missing=False)
    ensure_student_all_active_course_access(db, student)
    approved_rows = (
        db.query(Enrollment, Course)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(
            Enrollment.student_id == student.id,
            Enrollment.status == "approved",
            Enrollment.cohort_id == active_cohort.id if active_cohort else Enrollment.cohort_id.is_(None),
        )
        .order_by(Enrollment.approved_at.desc().nullslast(), Enrollment.created_at.desc())
        .all()
    )
    request_rows = (
        db.query(EnrollmentRequest, Course)
        .join(Course, EnrollmentRequest.course_id == Course.id)
        .filter(
            EnrollmentRequest.student_id == student.id,
            EnrollmentRequest.status.in_(["pending", "rejected"]),
            EnrollmentRequest.cohort_id == active_cohort.id if active_cohort else EnrollmentRequest.cohort_id.is_(None),
        )
        .order_by(EnrollmentRequest.created_at.desc())
        .all()
    )

    response = {
        "approved": [
            course_to_student_status(course, enrollment.status, enrollment.approved_at or enrollment.created_at)
            for enrollment, course in approved_rows
        ],
        "pending": [],
        "rejected": [],
    }
    for request_row, course in request_rows:
        response[request_row.status].append(
            {
                **course_to_student_status(course, request_row.status, request_row.reviewed_at or request_row.created_at),
                "prerequisites": request_row.prerequisites,
                "experience_level": request_row.experience_level,
                "learning_goal": request_row.learning_goal,
            }
        )
    return response


@app.post("/student/enrollment-requests")
def student_create_enrollment_request(
    data: StudentEnrollmentRequestCreate,
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if not student.is_active:
        raise HTTPException(status_code=403, detail="Course access is pending admin activation")
    if (student.lifecycle_status or "active_student") != "active_student":
        raise HTTPException(status_code=403, detail="Alumni accounts cannot request active course access")
    active_cohort = get_active_cohort(db)
    if not active_cohort:
        raise HTTPException(status_code=400, detail="No active cohort is available")
    course = db.query(Course).filter(Course.id == data.course_id, Course.status == "active").first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if get_student_approved_enrollment(db, student.id, course.id):
        raise HTTPException(status_code=409, detail="You already have access to this course")

    request_row = (
        db.query(EnrollmentRequest)
        .filter(EnrollmentRequest.student_id == student.id, EnrollmentRequest.course_id == course.id, EnrollmentRequest.cohort_id == active_cohort.id)
        .first()
    )
    if request_row and request_row.status == "pending":
        raise HTTPException(status_code=409, detail="This course is already being added to your account")
    if request_row and request_row.status == "rejected":
        platform_settings, _ = get_platform_settings(db)
        can_reapply = bool((platform_settings.get("enrollment_rules") or {}).get("allow_rejected_reapply", True))
        if not can_reapply:
            raise HTTPException(status_code=403, detail="Rejected enrollment requests are not open for reapply right now")
    if request_row:
        request_row.status = "pending"
        request_row.reviewed_by = None
        request_row.reviewed_at = None
    else:
        request_row = EnrollmentRequest(student_id=student.id, course_id=course.id, cohort_id=active_cohort.id)
        db.add(request_row)
        db.flush()

    request_row.prerequisites = data.prerequisites
    request_row.experience_level = data.experience_level
    request_row.learning_goal = data.learning_goal
    create_audit_log(
        db,
        student,
        "enrollment.requested",
        "enrollment_request",
        request_row.id,
        f"{student.full_name} requested enrollment in {course.title}",
        {"student_id": student.id, "course_id": course.id},
    )
    db.commit()
    db.refresh(request_row)
    return enrollment_request_to_response(request_row, student, course)


@app.get("/student/courses")
def student_list_courses(
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if not student.is_active:
        return []
    if (student.lifecycle_status or "active_student") != "active_student":
        return []
    active_cohort = get_active_cohort(db, create_if_missing=False)
    ensure_student_all_active_course_access(db, student)
    TeacherUser = aliased(User)
    approved_rows = (
        db.query(Enrollment, Course, TeacherUser)
        .join(Course, Enrollment.course_id == Course.id)
        .outerjoin(TeacherUser, Course.teacher_id == TeacherUser.id)
        .filter(
            Enrollment.student_id == student.id,
            Enrollment.status == "approved",
            Enrollment.cohort_id == active_cohort.id if active_cohort else Enrollment.cohort_id.is_(None),
        )
        .order_by(Enrollment.approved_at.desc().nullslast(), Course.title.asc())
        .all()
    )
    return [student_course_to_response(course, enrollment, teacher) for enrollment, course, teacher in approved_rows]


@app.get("/student/courses/{course_id}/content")
def student_get_course_content(
    course_id: int,
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    enrollment = require_student_course_access(db, student, course_id)
    TeacherUser = aliased(User)
    row = (
        db.query(Course, TeacherUser)
        .outerjoin(TeacherUser, Course.teacher_id == TeacherUser.id)
        .filter(Course.id == course_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Course not found")
    course, teacher = row

    modules = (
        db.query(Module)
        .filter(Module.course_id == course.id, Module.is_visible == True)  # noqa: E712
        .order_by(Module.position.asc(), Module.created_at.asc())
        .all()
    )
    materials = (
        db.query(CourseMaterial)
        .filter(CourseMaterial.course_id == course.id, CourseMaterial.is_visible == True)  # noqa: E712
        .order_by(CourseMaterial.created_at.desc())
        .all()
    )
    material_ids = [material.id for material in materials]
    material_progress_rows = (
        db.query(MaterialProgress)
        .filter(MaterialProgress.student_id == student.id, MaterialProgress.material_id.in_(material_ids))
        .all()
        if material_ids
        else []
    )
    progress_by_material_id = {progress.material_id: progress for progress in material_progress_rows}
    assignment_rows = (
        db.query(Assignment, Module, Submission, Grade)
        .outerjoin(Module, Assignment.module_id == Module.id)
        .outerjoin(
            Submission,
            (Submission.assignment_id == Assignment.id) & (Submission.student_id == student.id),
        )
        .outerjoin(Grade, Grade.submission_id == Submission.id)
        .filter(Assignment.course_id == course.id)
        .order_by(Assignment.due_at.asc().nullslast(), Assignment.created_at.desc())
        .all()
    )
    announcement_rows = (
        db.query(Announcement, User)
        .join(User, Announcement.author_id == User.id)
        .filter((Announcement.audience == "platform") | (Announcement.course_id == course.id))
        .order_by(Announcement.created_at.desc())
        .limit(10)
        .all()
    )

    materials_by_module = {module.id: [] for module in modules}
    unassigned_materials = []
    for material in materials:
        progress = progress_by_material_id.get(material.id)
        material_payload = {
            **material_to_response(material),
            "viewed": progress is not None,
            "viewed_at": progress.viewed_at if progress else None,
        }
        target = materials_by_module.get(material.module_id) if material.module_id else None
        if target is not None:
            target.append(material_payload)
        else:
            unassigned_materials.append(material_payload)

    assignments_by_module = {module.id: [] for module in modules}
    unassigned_assignments = []
    for assignment, module, submission, grade in assignment_rows:
        payload = assignment_with_student_status(assignment, course, module, submission, grade)
        target = assignments_by_module.get(assignment.module_id) if assignment.module_id else None
        if target is not None:
            target.append(payload)
        else:
            unassigned_assignments.append(payload)

    return {
        "course": student_course_to_response(course, enrollment, teacher),
        "modules": [
            {
                "id": module.id,
                "title": module.title,
                "description": module.description,
                "position": module.position,
                "is_visible": module.is_visible,
                "created_at": module.created_at,
                "materials": materials_by_module.get(module.id, []),
                "assignments": assignments_by_module.get(module.id, []),
            }
            for module in modules
        ],
        "unassigned_materials": unassigned_materials,
        "unassigned_assignments": unassigned_assignments,
        "announcements": [announcement_to_response(announcement, author, course if announcement.course_id else None) for announcement, author in announcement_rows],
    }


@app.post("/student/materials/{material_id}/view")
def student_mark_material_viewed(
    material_id: int,
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if not student.is_active:
        raise HTTPException(status_code=403, detail="Material access is pending admin activation")
    material = db.query(CourseMaterial).filter(CourseMaterial.id == material_id, CourseMaterial.is_visible == True).first()  # noqa: E712
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    require_student_course_access(db, student, material.course_id)
    progress = (
        db.query(MaterialProgress)
        .filter(MaterialProgress.material_id == material.id, MaterialProgress.student_id == student.id)
        .first()
    )
    viewed_at = now_ts()
    if progress:
        progress.viewed_at = viewed_at
    else:
        progress = MaterialProgress(material_id=material.id, student_id=student.id, viewed_at=viewed_at)
        db.add(progress)
    db.commit()
    return {
        **material_to_response(material),
        "viewed": True,
        "viewed_at": viewed_at,
    }


@app.get("/student/assignments")
def student_list_assignments(
    status: Literal["all", "open", "closed", "submitted", "graded", "late"] = "all",
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if not student.is_active:
        return []
    course_ids = [
        row[0]
        for row in db.query(Enrollment.course_id)
        .filter(Enrollment.student_id == student.id, Enrollment.status == "approved")
        .all()
    ]
    if not course_ids:
        return []
    rows = (
        db.query(Assignment, Course, Module, Submission, Grade)
        .join(Course, Assignment.course_id == Course.id)
        .outerjoin(Module, Assignment.module_id == Module.id)
        .outerjoin(
            Submission,
            (Submission.assignment_id == Assignment.id) & (Submission.student_id == student.id),
        )
        .outerjoin(Grade, Grade.submission_id == Submission.id)
        .filter(Assignment.course_id.in_(course_ids))
        .order_by(Assignment.due_at.asc().nullslast(), Assignment.created_at.desc())
        .all()
    )
    assignments = [assignment_with_student_status(assignment, course, module, submission, grade) for assignment, course, module, submission, grade in rows]
    if status == "all":
        return assignments
    if status == "open":
        return [assignment for assignment in assignments if assignment["is_open"] and assignment["student_status"] in ["not_submitted", "late"]]
    if status == "closed":
        return [assignment for assignment in assignments if not assignment["is_open"]]
    return [assignment for assignment in assignments if assignment["student_status"] == status]


@app.post("/student/assignments/{assignment_id}/submit")
def student_submit_assignment(
    assignment_id: int,
    data: StudentAssignmentSubmitRequest,
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if not student.is_active:
        raise HTTPException(status_code=403, detail="Assignment access is pending admin activation")
    row = (
        db.query(Assignment, Course)
        .join(Course, Assignment.course_id == Course.id)
        .filter(Assignment.id == assignment_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Assignment not found")
    assignment, course = row
    require_student_course_access(db, student, assignment.course_id)
    if not assignment.is_open:
        raise HTTPException(status_code=403, detail="This assignment is closed for submissions")
    file_url = (data.file_url or "").strip() or None
    if not file_url:
        raise HTTPException(status_code=400, detail="Attach a file before submitting")

    submission = (
        db.query(Submission)
        .filter(Submission.assignment_id == assignment.id, Submission.student_id == student.id)
        .first()
    )
    submitted_at = now_ts()
    due_late = bool(assignment.due_at and submitted_at > assignment.due_at)
    if submission:
        submission.text_response = None
        submission.file_url = file_url
        submission.submitted_at = submitted_at
        submission.status = "late" if due_late else "submitted"
    else:
        submission = Submission(
            assignment_id=assignment.id,
            student_id=student.id,
            text_response=None,
            file_url=file_url,
            status="late" if due_late else "submitted",
            submitted_at=submitted_at,
        )
        db.add(submission)
        db.flush()
    create_audit_log(
        db,
        student,
        "assignment.submitted",
        "submission",
        submission.id,
        f"{student.full_name} submitted {assignment.title}",
        {"student_id": student.id, "assignment_id": assignment.id, "course_id": course.id},
    )
    db.commit()
    db.refresh(submission)
    grade = db.query(Grade).filter(Grade.submission_id == submission.id).first()
    module = db.query(Module).filter(Module.id == assignment.module_id).first() if assignment.module_id else None
    return assignment_with_student_status(assignment, course, module, submission, grade)


@app.post("/student/assignments/{assignment_id}/submission/upload", response_model=MaterialUploadResponse)
async def student_upload_assignment_submission(
    assignment_id: int,
    file: UploadFile = File(...),
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if not student.is_active:
        raise HTTPException(status_code=403, detail="Assignment access is pending admin activation")
    row = (
        db.query(Assignment, Course)
        .join(Course, Assignment.course_id == Course.id)
        .filter(Assignment.id == assignment_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Assignment not found")
    assignment, course = row
    require_student_course_access(db, student, assignment.course_id)
    if not assignment.is_open:
        raise HTTPException(status_code=403, detail="This assignment is closed for submissions")
    original_name = safe_upload_filename(file.filename or "assignment-submission")
    extension = "." + original_name.rsplit(".", 1)[-1].lower() if "." in original_name else ""
    if extension not in ALLOWED_MATERIAL_EXTENSIONS:
        raise HTTPException(status_code=400, detail="This file type is not allowed for assignment submissions")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File is empty")
    if len(content) > MAX_MATERIAL_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File must be 25 MB or smaller")
    file_path = f"courses/{course.id}/assignments/{assignment.id}/submissions/{student.id}/{now_ts()}-{uuid.uuid4().hex[:10]}-{original_name}"
    file_url = upload_to_supabase_storage(file_path, content, file.content_type)
    create_audit_log(
        db,
        student,
        "assignment_submission.file_uploaded",
        "assignment",
        assignment.id,
        f"{student.full_name} uploaded submission file {original_name}",
        {"course_id": course.id, "file_path": file_path, "size": len(content)},
    )
    db.commit()
    return {"file_url": file_url, "file_path": file_path, "file_name": original_name, "content_type": file.content_type, "size": len(content)}


@app.get("/student/grades")
def student_list_grades(
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Grade, Submission, Assignment, Course, User)
        .join(Submission, Grade.submission_id == Submission.id)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .join(User, Grade.graded_by == User.id)
        .filter(Submission.student_id == student.id)
        .order_by(Grade.graded_at.desc())
        .all()
    )
    return [
        {
            "id": grade.id,
            "score": grade.score,
            "total_points": grade.total_points,
            "feedback": grade.feedback,
            "graded_at": grade.graded_at,
            "submission": {"id": submission.id, "submitted_at": submission.submitted_at, "status": submission.status},
            "assignment": {"id": assignment.id, "title": assignment.title},
            "course": {"id": course.id, "title": course.title},
            "teacher": {"id": teacher.id, "full_name": teacher.full_name, "email": teacher.email},
        }
        for grade, submission, assignment, course, teacher in rows
    ]


@app.get("/student/certificates", response_model=list[CertificateResponse])
def student_list_certificates(
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if not student.is_active:
        return []
    rows = (
        db.query(Certificate, Course)
        .join(Course, Certificate.course_id == Course.id)
        .join(Enrollment, (Enrollment.course_id == Course.id) & (Enrollment.student_id == student.id))
        .filter(Certificate.student_id == student.id, Enrollment.status == "approved")
        .order_by(Certificate.created_at.desc())
        .all()
    )
    return [certificate_to_response(certificate, student, course) for certificate, course in rows]


@app.get("/student/announcements")
def student_list_announcements(
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if not student.is_active:
        return []
    course_ids = [
        row[0]
        for row in db.query(Enrollment.course_id)
        .filter(Enrollment.student_id == student.id, Enrollment.status == "approved")
        .all()
    ]
    rows = (
        db.query(Announcement, User, Course)
        .join(User, Announcement.author_id == User.id)
        .outerjoin(Course, Announcement.course_id == Course.id)
        .filter((Announcement.audience == "platform") | (Announcement.course_id.in_(course_ids)))
        .order_by(Announcement.is_urgent.desc(), Announcement.created_at.desc())
        .all()
    )
    announcement_ids = [announcement.id for announcement, _, _ in rows]
    read_rows = (
        db.query(AnnouncementRead)
        .filter(
            AnnouncementRead.student_id == student.id,
            AnnouncementRead.announcement_id.in_(announcement_ids),
        )
        .all()
        if announcement_ids
        else []
    )
    read_at_by_announcement_id = {read.announcement_id: read.read_at for read in read_rows}
    return [
        announcement_to_response(announcement, author, course, read_at_by_announcement_id.get(announcement.id))
        for announcement, author, course in rows
    ]


@app.post("/student/announcements/{announcement_id}/read")
def student_mark_announcement_read(
    announcement_id: int,
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if not student.is_active:
        raise HTTPException(status_code=403, detail="Announcement access is pending admin activation")
    course_ids = [
        row[0]
        for row in db.query(Enrollment.course_id)
        .filter(Enrollment.student_id == student.id, Enrollment.status == "approved")
        .all()
    ]
    announcement = (
        db.query(Announcement)
        .filter(
            Announcement.id == announcement_id,
            (Announcement.audience == "platform") | (Announcement.course_id.in_(course_ids)),
        )
        .first()
    )
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    read = (
        db.query(AnnouncementRead)
        .filter(AnnouncementRead.announcement_id == announcement.id, AnnouncementRead.student_id == student.id)
        .first()
    )
    if not read:
        read = AnnouncementRead(announcement_id=announcement.id, student_id=student.id, read_at=now_ts())
        db.add(read)
        db.commit()
        db.refresh(read)
    return {"announcement_id": announcement.id, "read_at": read.read_at}


@app.post("/student/announcements/actions/read-all")
def student_mark_all_announcements_read(
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if not student.is_active:
        raise HTTPException(status_code=403, detail="Announcement access is pending admin activation")
    course_ids = [
        row[0]
        for row in db.query(Enrollment.course_id)
        .filter(Enrollment.student_id == student.id, Enrollment.status == "approved")
        .all()
    ]
    rows = (
        db.query(Announcement.id)
        .filter((Announcement.audience == "platform") | (Announcement.course_id.in_(course_ids)))
        .all()
    )
    announcement_ids = [row[0] for row in rows]
    if not announcement_ids:
        return {"marked_read": 0}

    existing_ids = {
        row[0]
        for row in db.query(AnnouncementRead.announcement_id)
        .filter(
            AnnouncementRead.student_id == student.id,
            AnnouncementRead.announcement_id.in_(announcement_ids),
        )
        .all()
    }
    read_at = now_ts()
    new_reads = [
        AnnouncementRead(announcement_id=announcement_id, student_id=student.id, read_at=read_at)
        for announcement_id in announcement_ids
        if announcement_id not in existing_ids
    ]
    if new_reads:
        db.add_all(new_reads)
        db.commit()
    return {"marked_read": len(new_reads)}


@app.get("/student/notifications")
def student_list_notifications(
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if not student.is_active:
        return []

    course_ids = [
        row[0]
        for row in db.query(Enrollment.course_id)
        .filter(Enrollment.student_id == student.id, Enrollment.status == "approved")
        .all()
    ]
    notifications: list[dict] = []

    announcement_rows = (
        db.query(Announcement, User, Course)
        .join(User, Announcement.author_id == User.id)
        .outerjoin(Course, Announcement.course_id == Course.id)
        .filter((Announcement.audience == "platform") | (Announcement.course_id.in_(course_ids)))
        .order_by(Announcement.created_at.desc())
        .limit(20)
        .all()
    )
    announcement_ids = [announcement.id for announcement, _, _ in announcement_rows]
    read_at_by_announcement_id = {
        read.announcement_id: read.read_at
        for read in (
            db.query(AnnouncementRead)
            .filter(
                AnnouncementRead.student_id == student.id,
                AnnouncementRead.announcement_id.in_(announcement_ids),
            )
            .all()
            if announcement_ids
            else []
        )
    }
    for announcement, author, course in announcement_rows:
        read_at = read_at_by_announcement_id.get(announcement.id)
        notifications.append(
            {
                "id": f"announcement-{announcement.id}",
                "kind": "announcement",
                "target_id": announcement.id,
                "title": "Urgent announcement" if announcement.is_urgent else "Announcement posted",
                "detail": announcement.title,
                "meta": course.title if course else "Platform",
                "created_at": announcement.created_at,
                "pane": "announcements",
                "is_read": bool(read_at),
                "read_at": read_at,
                "actor": user_display_name(author, "Administrator"),
            }
        )

    AuditActor = aliased(User)
    content_rows = (
        db.query(AuditLog, AuditActor)
        .outerjoin(AuditActor, AuditLog.actor_id == AuditActor.id)
        .filter(
            AuditLog.action.in_(
                [
                    "teacher.assignment_created",
                    "assignment.created",
                    "teacher.module_created",
                    "module.created",
                    "teacher.material_created",
                    "material.created",
                ]
            )
        )
        .order_by(AuditLog.created_at.desc())
        .limit(80)
        .all()
    )
    for log, actor in content_rows:
        metadata = log.metadata_json or {}
        course_id = metadata.get("course_id")
        if course_id not in course_ids:
            continue
        course = db.get(Course, course_id)
        actor_name = user_display_name(actor, "Administrator")
        if log.action in {"teacher.assignment_created", "assignment.created"}:
            assignment = db.get(Assignment, log.target_id) if log.target_id else None
            if not assignment:
                continue
            notifications.append(
                {
                    "id": f"assignment-{log.id}",
                    "kind": "assignment",
                    "target_id": assignment.id,
                    "title": "Assignment posted",
                    "detail": f"{actor_name} created \"{assignment.title}\"",
                    "meta": course.title if course else "Course assignment",
                    "created_at": log.created_at,
                    "pane": "assignments",
                    "is_read": False,
                }
            )
        elif log.action in {"teacher.module_created", "module.created"}:
            module = db.get(Module, log.target_id) if log.target_id else None
            if not module or not module.is_visible:
                continue
            notifications.append(
                {
                    "id": f"module-{log.id}",
                    "kind": "module",
                    "target_id": module.id,
                    "title": "Module created",
                    "detail": f"{actor_name} created \"{module.title}\"",
                    "meta": course.title if course else "Course modules",
                    "created_at": log.created_at,
                    "pane": "modules",
                    "is_read": False,
                }
            )
        elif log.action in {"teacher.material_created", "material.created"}:
            material = db.get(CourseMaterial, log.target_id) if log.target_id else None
            module = db.get(Module, material.module_id) if material and material.module_id else None
            if not material or not material.is_visible or (module and not module.is_visible):
                continue
            notifications.append(
                {
                    "id": f"material-{log.id}",
                    "kind": "material",
                    "target_id": material.id,
                    "title": "Material posted",
                    "detail": f"{actor_name} added \"{material.title}\"",
                    "meta": course.title if course else "Course materials",
                    "created_at": log.created_at,
                    "pane": "materials",
                    "is_read": False,
                }
            )

    certificate_rows = (
        db.query(Certificate, Course)
        .join(Course, Certificate.course_id == Course.id)
        .filter(Certificate.student_id == student.id)
        .order_by(Certificate.created_at.desc())
        .limit(20)
        .all()
    )
    for certificate, course in certificate_rows:
        notifications.append(
            {
                "id": f"certificate-{certificate.id}",
                "kind": "certificate",
                "target_id": certificate.id,
                "title": "Certificate posted",
                "detail": f"Your certificate for {course.title} is available.",
                "meta": certificate.file_name,
                "created_at": certificate.created_at,
                "pane": "certificates",
                "is_read": False,
            }
        )

    resolved_ticket_rows = (
        db.query(SupportTicket, AuditLog)
        .join(AuditLog, (AuditLog.target_type == "support_ticket") & (AuditLog.target_id == SupportTicket.id))
        .filter(
            SupportTicket.user_id == student.id,
            SupportTicket.status == "closed",
            AuditLog.action == "support.status_updated",
        )
        .order_by(AuditLog.created_at.desc())
        .limit(20)
        .all()
    )
    for ticket, log in resolved_ticket_rows:
        metadata = log.metadata_json or {}
        if metadata.get("after_status") != "closed":
            continue
        notifications.append(
            {
                "id": f"support-{log.id}",
                "kind": "support",
                "target_id": ticket.id,
                "title": "Support ticket resolved",
                "detail": ticket.subject,
                "meta": "Support",
                "created_at": log.created_at,
                "pane": "support",
                "is_read": False,
            }
        )

    notifications.sort(key=lambda item: item.get("created_at") or 0, reverse=True)
    return notifications[:50]


@app.get("/student/dashboard-summary", response_model=StudentDashboardSummaryResponse)
def student_dashboard_summary(
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if not student.is_active:
        return {
            "approved_courses": [],
            "recent_materials": [],
            "upcoming_assignments": [],
            "recent_grades": [],
            "announcements": [],
            "overall_progress": 0,
        }
    ensure_student_all_active_course_access(db, student)
    approved_rows = (
        db.query(Enrollment, Course)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(
            Enrollment.student_id == student.id,
            Enrollment.status == "approved",
        )
        .order_by(Enrollment.approved_at.desc().nullslast(), Enrollment.created_at.desc())
        .all()
    )
    course_ids = [course.id for _, course in approved_rows]

    if not course_ids:
        return {
            "approved_courses": [],
            "recent_materials": [],
            "upcoming_assignments": [],
            "recent_grades": [],
            "announcements": [],
            "overall_progress": 0,
        }

    recent_material_rows = (
        db.query(CourseMaterial, Course)
        .join(Course, CourseMaterial.course_id == Course.id)
        .filter(
            CourseMaterial.course_id.in_(course_ids),
            CourseMaterial.is_visible == True,  # noqa: E712
        )
        .order_by(CourseMaterial.created_at.desc())
        .limit(5)
        .all()
    )
    upcoming_assignment_rows = (
        db.query(Assignment, Course)
        .join(Course, Assignment.course_id == Course.id)
        .filter(
            Assignment.course_id.in_(course_ids),
            Assignment.is_open == True,  # noqa: E712
        )
        .order_by(Assignment.due_at.asc().nullslast(), Assignment.created_at.desc())
        .limit(5)
        .all()
    )
    announcement_rows = (
        db.query(Announcement, User, Course)
        .join(User, Announcement.author_id == User.id)
        .outerjoin(Course, Announcement.course_id == Course.id)
        .filter(
            (Announcement.audience == "platform") | (Announcement.course_id.in_(course_ids)),
        )
        .order_by(Announcement.created_at.desc())
        .limit(5)
        .all()
    )
    total_materials = (
        db.query(func.count(CourseMaterial.id))
        .filter(
            CourseMaterial.course_id.in_(course_ids),
            CourseMaterial.is_visible == True,  # noqa: E712
        )
        .scalar()
        or 0
    )
    viewed_materials = (
        db.query(func.count(func.distinct(MaterialProgress.material_id)))
        .join(CourseMaterial, MaterialProgress.material_id == CourseMaterial.id)
        .filter(
            MaterialProgress.student_id == student.id,
            CourseMaterial.course_id.in_(course_ids),
            CourseMaterial.is_visible == True,  # noqa: E712
        )
        .scalar()
        or 0
    )
    total_assignments = (
        db.query(func.count(Assignment.id))
        .filter(
            Assignment.course_id.in_(course_ids),
            Assignment.is_open == True,  # noqa: E712
        )
        .scalar()
        or 0
    )
    submitted_assignments = (
        db.query(func.count(func.distinct(Submission.assignment_id)))
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .filter(
            Submission.student_id == student.id,
            Assignment.course_id.in_(course_ids),
            Assignment.is_open == True,  # noqa: E712
        )
        .scalar()
        or 0
    )
    total_progress_items = total_materials + total_assignments
    completed_progress_items = viewed_materials + submitted_assignments
    overall_progress = round((completed_progress_items / total_progress_items) * 100) if total_progress_items else 0

    return {
        "approved_courses": [
            {
                **course_to_student_status(course, enrollment.status, enrollment.approved_at or enrollment.created_at),
                "teacher_id": course.teacher_id,
            }
            for enrollment, course in approved_rows
        ],
        "recent_materials": [
            {
                "id": material.id,
                "title": material.title,
                "material_type": material.material_type,
                "course_title": course.title,
                "created_at": material.created_at,
            }
            for material, course in recent_material_rows
        ],
        "upcoming_assignments": [
            {
                "id": assignment.id,
                "title": assignment.title,
                "course_title": course.title,
                "total_points": assignment.total_points,
                "due_at": assignment.due_at,
            }
            for assignment, course in upcoming_assignment_rows
        ],
        "recent_grades": [],
        "announcements": [
            {
                "id": announcement.id,
                "title": announcement.title,
                "audience": announcement.audience,
                "course_title": course.title if course else "Platform",
                "author_name": author.full_name,
                "created_at": announcement.created_at,
            }
            for announcement, author, course in announcement_rows
        ],
        "overall_progress": overall_progress,
    }


@app.get("/teacher/dashboard-summary")
def teacher_dashboard_summary(
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    courses = db.query(Course).filter(Course.teacher_id == teacher.id).order_by(Course.title.asc()).all()
    course_ids = [course.id for course in courses]
    if not course_ids:
        return {
            "assigned_courses": [],
            "total_students": 0,
            "pending_submissions": 0,
            "graded_submissions": 0,
            "late_submissions": 0,
            "total_submissions": 0,
            "upcoming_deadlines": 0,
            "upcoming_assignments": [],
            "recent_activity": [],
            "recent_materials": [],
            "announcements": [],
            "engagement": [],
        }

    total_students = (
        db.query(Enrollment.student_id)
        .filter(Enrollment.course_id.in_(course_ids), Enrollment.status == "approved")
        .distinct()
        .count()
    )
    assignment_rows = db.query(Assignment).filter(Assignment.course_id.in_(course_ids)).all()
    assignment_ids = [assignment.id for assignment in assignment_rows]
    submission_rows = (
        db.query(Submission, Grade, Assignment, Course, User)
        .outerjoin(Grade, Grade.submission_id == Submission.id)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .join(User, Submission.student_id == User.id)
        .filter(Submission.assignment_id.in_(assignment_ids))
        .order_by(Submission.submitted_at.desc())
        .all()
        if assignment_ids
        else []
    )
    pending_submissions = len([row for row in submission_rows if row[1] is None])
    graded_submissions = len([row for row in submission_rows if row[1] is not None])
    late_submissions = len([row for row in submission_rows if row[0].status == "late"])
    seven_days_ago = now_ts() - (7 * 24 * 60 * 60)
    recent_submissions_count = len([row for row in submission_rows if row[0].submitted_at >= seven_days_ago])
    previously_recent_submissions_count = len([
        row for row in submission_rows
        if seven_days_ago - (7 * 24 * 60 * 60) <= row[0].submitted_at < seven_days_ago
    ])
    upcoming = (
        db.query(Assignment, Course)
        .join(Course, Assignment.course_id == Course.id)
        .filter(Assignment.course_id.in_(course_ids), Assignment.is_open == True, Assignment.due_at.isnot(None), Assignment.due_at >= now_ts())  # noqa: E712
        .order_by(Assignment.due_at.asc().nullslast(), Assignment.created_at.desc())
        .limit(6)
        .all()
    )
    material_rows = (
        db.query(CourseMaterial, Course)
        .join(Course, CourseMaterial.course_id == Course.id)
        .filter(CourseMaterial.course_id.in_(course_ids))
        .order_by(CourseMaterial.created_at.desc())
        .limit(5)
        .all()
    )
    recent_assignment_rows = (
        db.query(Assignment, Course, Module)
        .join(Course, Assignment.course_id == Course.id)
        .outerjoin(Module, Assignment.module_id == Module.id)
        .filter(Assignment.course_id.in_(course_ids))
        .order_by(Assignment.created_at.desc())
        .limit(12)
        .all()
    )
    recent_content_activity = build_teacher_action_activity(db, 12, set(course_ids))
    material_type_labels = {
        "youtube": "YouTube recording",
        "video": "Video",
        "pdf": "PDF",
        "slides": "Slides",
        "link": "Link",
        "download": "Downloadable resource",
    }
    announcement_rows = (
        db.query(Announcement, Course)
        .outerjoin(Course, Announcement.course_id == Course.id)
        .filter((Announcement.course_id.in_(course_ids)) | (Announcement.audience == "platform"))
        .order_by(Announcement.created_at.desc())
        .limit(5)
        .all()
    )

    course_payload = []
    for course in courses:
        enrolled_count = db.query(Enrollment).filter(Enrollment.course_id == course.id, Enrollment.status == "approved").count()
        material_count = db.query(CourseMaterial).filter(CourseMaterial.course_id == course.id).count()
        assignment_count = db.query(Assignment).filter(Assignment.course_id == course.id).count()
        completed_materials = (
            db.query(MaterialProgress.id)
            .join(CourseMaterial, MaterialProgress.material_id == CourseMaterial.id)
            .filter(CourseMaterial.course_id == course.id)
            .count()
        )
        progress_denominator = max(enrolled_count * material_count, 1)
        course_payload.append({
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "status": course.status,
            "enrolled_students": enrolled_count,
            "materials": material_count,
            "assignments": assignment_count,
            "completed_materials": completed_materials,
            "progress": min(100, round((completed_materials / progress_denominator) * 100)) if material_count and enrolled_count else 0,
        })

    engagement = []
    day_seconds = 24 * 60 * 60
    today_start = int(time.time() // day_seconds * day_seconds)
    for offset in range(6, -1, -1):
        start = today_start - (offset * day_seconds)
        end = start + day_seconds
        engagement.append({
            "date": start,
            "submissions": len([row for row in submission_rows if start <= row[0].submitted_at < end]),
        })

    return {
        "assigned_courses": course_payload,
        "total_students": total_students,
        "pending_submissions": pending_submissions,
        "graded_submissions": graded_submissions,
        "late_submissions": late_submissions,
        "total_submissions": len(submission_rows),
        "recent_submissions_count": recent_submissions_count,
        "previous_recent_submissions_count": previously_recent_submissions_count,
        "upcoming_deadlines": len(upcoming),
        "upcoming_assignments": [
            {
                "id": assignment.id,
                "title": assignment.title,
                "course_title": course.title,
                "total_points": assignment.total_points,
                "due_at": assignment.due_at,
            }
            for assignment, course in upcoming
        ],
        "recent_activity": sorted(
            [
                *[
                    {
                        "id": f"submission-{submission.id}",
                        "submission_id": submission.id,
                        "type": "submission",
                        "title": "Assignment submitted",
                        "detail": f"{student.full_name} submitted \"{assignment.title}\"",
                        "detail_status": "Reviewed" if grade is not None else "Pending review",
                        "student_name": student.full_name,
                        "assignment_title": assignment.title,
                        "course": course.title,
                        "course_title": course.title,
                        "location": "Submission",
                        "created_at": submission.submitted_at,
                        "submitted_at": submission.submitted_at,
                        "graded": grade is not None,
                        "action_label": "View submissions",
                        "pane": "submissions",
                    }
                    for submission, grade, assignment, course, student in submission_rows[:12]
                ],
                *[{**activity, "course_title": activity["course"]} for activity in recent_content_activity],
                *[
                    {
                        "id": f"announcement-{announcement.id}",
                        "type": "announcement",
                        "title": "Urgent announcement posted" if announcement.is_urgent else "Announcement posted",
                        "detail": announcement.title,
                        "detail_status": "Urgent" if announcement.is_urgent else "Visible",
                        "course": course.title if course else "Platform",
                        "course_title": course.title if course else "Platform",
                        "location": "Announcement",
                        "created_at": announcement.created_at,
                        "action_label": "View announcement",
                        "pane": "announcements",
                    }
                    for announcement, course in announcement_rows
                ],
            ],
            key=lambda item: item["created_at"] or 0,
            reverse=True,
        )[:50],
        "recent_materials": [
            {
                "id": material.id,
                "title": material.title,
                "material_type": material.material_type,
                "course_title": course.title,
                "created_at": material.created_at,
            }
            for material, course in material_rows
        ],
        "announcements": [
            {
                "id": announcement.id,
                "title": announcement.title,
                "course_title": course.title if course else "Platform",
                "is_urgent": announcement.is_urgent,
                "created_at": announcement.created_at,
            }
            for announcement, course in announcement_rows
        ],
        "engagement": engagement,
    }


@app.get("/teacher/courses")
def teacher_list_courses(
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    courses = db.query(Course).filter(Course.teacher_id == teacher.id).order_by(Course.title.asc()).all()
    response = []
    for course in courses:
        enrolled_count = db.query(Enrollment).filter(Enrollment.course_id == course.id, Enrollment.status == "approved").count()
        module_count = db.query(Module).filter(Module.course_id == course.id).count()
        material_count = db.query(CourseMaterial).filter(CourseMaterial.course_id == course.id).count()
        assignment_count = db.query(Assignment).filter(Assignment.course_id == course.id).count()
        completed_materials = (
            db.query(MaterialProgress.id)
            .join(CourseMaterial, MaterialProgress.material_id == CourseMaterial.id)
            .filter(CourseMaterial.course_id == course.id)
            .count()
        )
        progress_denominator = max(enrolled_count * material_count, 1)
        response.append({
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "status": course.status,
            "enrolled_students": enrolled_count,
            "modules": module_count,
            "materials": material_count,
            "assignments": assignment_count,
            "completed_materials": completed_materials,
            "progress": min(100, round((completed_materials / progress_denominator) * 100)) if material_count and enrolled_count else 0,
        })
    return response


@app.get("/teacher/students")
def teacher_list_students(
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    courses = db.query(Course).filter(Course.teacher_id == teacher.id).order_by(Course.title.asc()).all()
    course_by_id = {course.id: course for course in courses}
    course_ids = list(course_by_id.keys())
    if not course_ids:
        return []

    enrollment_rows = (
        db.query(Enrollment, User, Course)
        .join(User, Enrollment.student_id == User.id)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(Enrollment.course_id.in_(course_ids), Enrollment.status == "approved", User.role == "student")
        .order_by(User.full_name.asc(), Course.title.asc())
        .all()
    )
    student_ids = sorted({student.id for _, student, _ in enrollment_rows})
    assignment_rows = (
        db.query(Assignment.id, Assignment.course_id)
        .filter(Assignment.course_id.in_(course_ids))
        .all()
    )
    assignment_ids = [row[0] for row in assignment_rows]
    assignment_course_by_id = {assignment_id: course_id for assignment_id, course_id in assignment_rows}
    submission_rows = (
        db.query(Submission, Assignment)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .filter(Submission.student_id.in_(student_ids), Submission.assignment_id.in_(assignment_ids))
        .all()
        if student_ids and assignment_ids
        else []
    )
    submissions_by_student_id: dict[int, list[tuple[Submission, Assignment]]] = {}
    submissions_by_student_course: dict[tuple[int, int], list[Submission]] = {}
    for submission, assignment in submission_rows:
        submissions_by_student_id.setdefault(submission.student_id, []).append((submission, assignment))
        course_id = assignment_course_by_id.get(assignment.id, assignment.course_id)
        submissions_by_student_course.setdefault((submission.student_id, course_id), []).append(submission)

    students: dict[int, dict] = {}
    for enrollment, student, course in enrollment_rows:
        student_payload = students.setdefault(
            student.id,
            {
                "id": student.id,
                "full_name": user_display_name(student),
                "email": student.email,
                "phone": student.phone,
                "profile_image_url": student.profile_image_url,
                "is_active": student.is_active,
                "lifecycle_status": student.lifecycle_status,
                "joined_at": student.created_at,
                "courses": [],
                "course_count": 0,
                "submissions": 0,
                "late_submissions": 0,
                "last_submission_at": None,
            },
        )
        course_submissions = submissions_by_student_course.get((student.id, course.id), [])
        student_payload["courses"].append(
            {
                "id": course.id,
                "title": course.title,
                "approved_at": enrollment.approved_at,
                "submissions": len(course_submissions),
                "late_submissions": len([submission for submission in course_submissions if submission.status == "late"]),
                "last_submission_at": max((submission.submitted_at for submission in course_submissions), default=None),
            }
        )

    for student_id, rows in submissions_by_student_id.items():
        if student_id not in students:
            continue
        submissions = [submission for submission, _ in rows]
        students[student_id]["submissions"] = len(submissions)
        students[student_id]["late_submissions"] = len([submission for submission in submissions if submission.status == "late"])
        students[student_id]["last_submission_at"] = max((submission.submitted_at for submission in submissions), default=None)

    for student_payload in students.values():
        student_payload["course_count"] = len(student_payload["courses"])
        student_payload["courses"].sort(key=lambda item: item["title"])

    return sorted(students.values(), key=lambda item: item["full_name"].lower())


@app.get("/teacher/courses/{course_id}/content", response_model=CourseContentResponse)
def teacher_get_course_content(
    course_id: int,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    course = teacher_course_or_404(db, teacher, course_id)
    return admin_course_content_to_response(db, course)


@app.post("/teacher/courses/{course_id}/modules", response_model=CourseContentResponse)
def teacher_create_module(
    course_id: int,
    data: ModuleCreateRequest,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    course = teacher_course_or_404(db, teacher, course_id)
    title = data.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Module title is required")
    module = Module(course_id=course.id, title=title, description=data.description.strip() if data.description else None, position=data.position, is_visible=data.is_visible)
    db.add(module)
    db.flush()
    create_audit_log(db, teacher, "teacher.module_created", "module", module.id, f"Teacher created module {module.title}", {"course_id": course.id})
    db.commit()
    return admin_course_content_to_response(db, course)


@app.post("/teacher/courses/{course_id}/materials", response_model=CourseContentResponse)
def teacher_create_material(
    course_id: int,
    data: MaterialCreateRequest,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    course = teacher_course_or_404(db, teacher, course_id)
    title = data.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Material title is required")
    if not data.file_url and not data.external_url:
        raise HTTPException(status_code=400, detail="Add a file URL or external link")
    validate_course_module(db, course.id, data.module_id)
    material = CourseMaterial(
        course_id=course.id,
        module_id=data.module_id,
        title=title,
        description=data.description.strip() if data.description else None,
        material_type=data.material_type.strip() or "external_link",
        file_url=data.file_url.strip() if data.file_url else None,
        external_url=data.external_url.strip() if data.external_url else None,
        is_visible=data.is_visible,
        estimated_minutes=max(data.estimated_minutes, 1),
    )
    db.add(material)
    db.flush()
    create_audit_log(db, teacher, "teacher.material_created", "course_material", material.id, f"Teacher added material {material.title}", {"course_id": course.id})
    db.commit()
    return admin_course_content_to_response(db, course)


@app.post("/teacher/courses/{course_id}/materials/upload", response_model=MaterialUploadResponse)
async def teacher_upload_material_file(
    course_id: int,
    file: UploadFile = File(...),
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    course = teacher_course_or_404(db, teacher, course_id)
    original_name = safe_upload_filename(file.filename or "course-material")
    extension = "." + original_name.rsplit(".", 1)[-1].lower() if "." in original_name else ""
    if extension not in ALLOWED_MATERIAL_EXTENSIONS:
        raise HTTPException(status_code=400, detail="This file type is not allowed for course materials")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File is empty")
    if len(content) > MAX_MATERIAL_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File must be 25 MB or smaller")
    file_path = f"courses/{course.id}/{now_ts()}-{uuid.uuid4().hex[:10]}-{original_name}"
    file_url = upload_to_supabase_storage(file_path, content, file.content_type)
    create_audit_log(db, teacher, "teacher.material_file_uploaded", "course", course.id, f"Teacher uploaded file {original_name}", {"file_path": file_path, "size": len(content)})
    db.commit()
    return {"file_url": file_url, "file_path": file_path, "file_name": original_name, "content_type": file.content_type, "size": len(content)}


@app.post("/teacher/courses/{course_id}/assignments/upload", response_model=MaterialUploadResponse)
async def teacher_upload_assignment_file(
    course_id: int,
    file: UploadFile = File(...),
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    course = teacher_course_or_404(db, teacher, course_id)
    original_name = safe_upload_filename(file.filename or "assignment-attachment")
    extension = "." + original_name.rsplit(".", 1)[-1].lower() if "." in original_name else ""
    if extension not in ALLOWED_MATERIAL_EXTENSIONS:
        raise HTTPException(status_code=400, detail="This file type is not allowed for assignment attachments")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File is empty")
    if len(content) > MAX_MATERIAL_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File must be 25 MB or smaller")
    file_path = f"courses/{course.id}/assignments/{now_ts()}-{uuid.uuid4().hex[:10]}-{original_name}"
    file_url = upload_to_supabase_storage(file_path, content, file.content_type)
    create_audit_log(
        db,
        teacher,
        "teacher.assignment_file_uploaded",
        "course",
        course.id,
        f"Teacher uploaded assignment attachment {original_name}",
        {"file_path": file_path, "size": len(content)},
    )
    db.commit()
    return {"file_url": file_url, "file_path": file_path, "file_name": original_name, "content_type": file.content_type, "size": len(content)}


@app.post("/teacher/courses/{course_id}/assignments", response_model=CourseContentResponse)
def teacher_create_assignment(
    course_id: int,
    data: AssignmentCreateRequest,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    course = teacher_course_or_404(db, teacher, course_id)
    validate_course_module(db, course.id, data.module_id)
    title = data.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Assignment title is required")
    assignment = Assignment(
        course_id=course.id,
        module_id=data.module_id,
        title=title,
        instructions=data.instructions.strip() if data.instructions else None,
        attachment_url=data.attachment_url.strip() if data.attachment_url else None,
        attachment_name=data.attachment_name.strip() if data.attachment_name else None,
        total_points=max(data.total_points, 1),
        estimated_minutes=max(data.estimated_minutes, 1),
        due_at=data.due_at,
        is_open=data.is_open,
    )
    db.add(assignment)
    db.flush()
    create_audit_log(db, teacher, "teacher.assignment_created", "assignment", assignment.id, f"Teacher created assignment {assignment.title}", {"course_id": course.id})
    db.commit()
    return admin_course_content_to_response(db, course)


@app.get("/teacher/assignments", response_model=list[AdminAssignmentOverviewResponse])
def teacher_list_assignments(
    course_id: int | None = None,
    status: Literal["all", "open", "closed"] = "all",
    grading: Literal["all", "needs_grading", "fully_graded", "no_submissions"] = "all",
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Assignment, Course, Module, User)
        .join(Course, Assignment.course_id == Course.id)
        .outerjoin(Module, Assignment.module_id == Module.id)
        .outerjoin(User, Course.teacher_id == User.id)
        .filter(Course.teacher_id == teacher.id)
    )
    if course_id is not None:
        query = query.filter(Assignment.course_id == course_id)
    if status == "open":
        query = query.filter(Assignment.is_open == True)  # noqa: E712
    elif status == "closed":
        query = query.filter(Assignment.is_open == False)  # noqa: E712

    rows = query.order_by(Assignment.due_at.asc().nullslast(), Assignment.created_at.desc()).all()
    assignment_ids = [assignment.id for assignment, _, _, _ in rows]
    if not assignment_ids:
        return []

    course_ids = list({course.id for _, course, _, _ in rows})
    active_cohort = get_active_cohort(db, create_if_missing=False)
    enrollment_count_query = (
        db.query(Enrollment.course_id, func.count(Enrollment.id))
        .filter(Enrollment.course_id.in_(course_ids), Enrollment.status == "approved")
    )
    if active_cohort:
        enrollment_count_query = enrollment_count_query.filter(Enrollment.cohort_id == active_cohort.id)
    expected_submissions_by_course_id = {
        found_course_id: count
        for found_course_id, count in enrollment_count_query.group_by(Enrollment.course_id).all()
    }

    submission_rows = (
        db.query(Submission, Grade, User)
        .outerjoin(Grade, Grade.submission_id == Submission.id)
        .join(User, Submission.student_id == User.id)
        .filter(Submission.assignment_id.in_(assignment_ids))
        .order_by(Submission.submitted_at.desc())
        .all()
    )
    submissions_by_assignment = {assignment_id: [] for assignment_id in assignment_ids}
    for submission, grade, student in submission_rows:
        submissions_by_assignment.setdefault(submission.assignment_id, []).append((submission, grade, student))

    response = []
    for assignment, course, module, course_teacher in rows:
        submission_items = submissions_by_assignment.get(assignment.id, [])
        total_submissions = len(submission_items)
        graded_submissions = len([item for item in submission_items if item[1] is not None])
        late_submissions = len([item for item in submission_items if item[0].status == "late"])
        pending_grading = max(total_submissions - graded_submissions, 0)
        latest_submission = max((item[0].submitted_at for item in submission_items), default=None)
        latest_grade = max((item[1].graded_at for item in submission_items if item[1] is not None), default=None)
        latest_submission_student = None
        if latest_submission is not None:
            latest_row = next((item for item in submission_items if item[0].submitted_at == latest_submission), None)
            if latest_row:
                latest_submission_student = {
                    "id": latest_row[2].id,
                    "full_name": latest_row[2].full_name,
                    "email": latest_row[2].email,
                    "profile_image_url": latest_row[2].profile_image_url,
                }

        item = {
            "id": assignment.id,
            "title": assignment.title,
            "instructions": assignment.instructions,
            "total_points": assignment.total_points,
            "due_at": assignment.due_at,
            "is_open": assignment.is_open,
            "created_at": assignment.created_at,
            "course": {"id": course.id, "title": course.title, "status": course.status},
            "module": {"id": module.id, "title": module.title, "position": module.position} if module else None,
            "teacher": {
                "id": course_teacher.id,
                "full_name": course_teacher.full_name,
                "email": course_teacher.email,
                "profile_image_url": course_teacher.profile_image_url,
            } if course_teacher else None,
            "submissions": {
                "total": total_submissions,
                "expected": expected_submissions_by_course_id.get(course.id, 0),
                "graded": graded_submissions,
                "late": late_submissions,
                "pending_grading": pending_grading,
                "latest_submitted_at": latest_submission,
                "latest_student": latest_submission_student,
            },
            "grading": {
                "status": "no_submissions" if total_submissions == 0 else "fully_graded" if pending_grading == 0 else "needs_grading",
                "latest_graded_at": latest_grade,
            },
        }
        if grading == "needs_grading" and item["grading"]["status"] != "needs_grading":
            continue
        if grading == "fully_graded" and item["grading"]["status"] != "fully_graded":
            continue
        if grading == "no_submissions" and item["grading"]["status"] != "no_submissions":
            continue
        response.append(item)

    return response


@app.patch("/teacher/modules/{module_id}", response_model=CourseContentResponse)
def teacher_update_module(
    module_id: int,
    data: ModuleUpdateRequest,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    course = teacher_course_or_404(db, teacher, module.course_id)
    before = {"title": module.title, "description": module.description, "position": module.position, "is_visible": module.is_visible}
    if data.title is not None:
        title = data.title.strip()
        if not title:
            raise HTTPException(status_code=400, detail="Module title is required")
        module.title = title
    if data.description is not None:
        module.description = data.description.strip() if data.description else None
    if data.position is not None:
        module.position = data.position
    if data.is_visible is not None:
        module.is_visible = data.is_visible
    create_audit_log(db, teacher, "teacher.module_updated", "module", module.id, f"Teacher updated module {module.title}", {"course_id": course.id, "before": before, "is_visible": module.is_visible})
    db.commit()
    return admin_course_content_to_response(db, course)


@app.delete("/teacher/modules/{module_id}", response_model=CourseContentResponse)
def teacher_delete_module(
    module_id: int,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    course = teacher_course_or_404(db, teacher, module.course_id)
    material_ids = [row[0] for row in db.query(CourseMaterial.id).filter(CourseMaterial.module_id == module.id).all()]
    assignment_ids = [row[0] for row in db.query(Assignment.id).filter(Assignment.module_id == module.id).all()]
    submission_ids = []
    if assignment_ids:
        submission_ids = [row[0] for row in db.query(Submission.id).filter(Submission.assignment_id.in_(assignment_ids)).all()]
    if material_ids:
        db.query(MaterialProgress).filter(MaterialProgress.material_id.in_(material_ids)).delete(synchronize_session=False)
        db.query(CourseMaterial).filter(CourseMaterial.id.in_(material_ids)).delete(synchronize_session=False)
    if submission_ids:
        db.query(Grade).filter(Grade.submission_id.in_(submission_ids)).delete(synchronize_session=False)
        db.query(Submission).filter(Submission.id.in_(submission_ids)).delete(synchronize_session=False)
    if assignment_ids:
        db.query(Assignment).filter(Assignment.id.in_(assignment_ids)).delete(synchronize_session=False)
    module_title = module.title
    db.delete(module)
    create_audit_log(db, teacher, "teacher.module_deleted", "module", module_id, f"Teacher deleted module {module_title}", {"course_id": course.id, "materials_deleted": len(material_ids), "assignments_deleted": len(assignment_ids)})
    db.commit()
    return admin_course_content_to_response(db, course)


@app.patch("/teacher/materials/{material_id}", response_model=CourseContentResponse)
def teacher_update_material(
    material_id: int,
    data: MaterialUpdateRequest,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    material = db.query(CourseMaterial).filter(CourseMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    course = teacher_course_or_404(db, teacher, material.course_id)
    before = material_to_response(material)
    if "module_id" in data.__fields_set__:
        validate_course_module(db, material.course_id, data.module_id)
        material.module_id = data.module_id
    if data.title is not None:
        title = data.title.strip()
        if not title:
            raise HTTPException(status_code=400, detail="Material title is required")
        material.title = title
    if data.description is not None:
        material.description = data.description.strip() if data.description else None
    if data.material_type is not None:
        material.material_type = data.material_type.strip() or "external_link"
    if data.file_url is not None:
        material.file_url = data.file_url.strip() if data.file_url else None
    if data.external_url is not None:
        material.external_url = data.external_url.strip() if data.external_url else None
    if data.is_visible is not None:
        material.is_visible = data.is_visible
    if not material.file_url and not material.external_url:
        raise HTTPException(status_code=400, detail="Add a file URL or external link")
    create_audit_log(db, teacher, "teacher.material_updated", "course_material", material.id, f"Teacher updated material {material.title}", {"course_id": course.id, "before": before, "after": material_to_response(material)})
    db.commit()
    return admin_course_content_to_response(db, course)


@app.delete("/teacher/materials/{material_id}", response_model=CourseContentResponse)
def teacher_delete_material(
    material_id: int,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    material = db.query(CourseMaterial).filter(CourseMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    course = teacher_course_or_404(db, teacher, material.course_id)
    material_title = material.title
    progress_count = db.query(MaterialProgress).filter(MaterialProgress.material_id == material.id).count()
    if progress_count:
        db.query(MaterialProgress).filter(MaterialProgress.material_id == material.id).delete(synchronize_session=False)
    db.delete(material)
    create_audit_log(db, teacher, "teacher.material_deleted", "course_material", material_id, f"Teacher deleted material {material_title}", {"course_id": course.id, "progress_records_deleted": progress_count})
    db.commit()
    return admin_course_content_to_response(db, course)


@app.patch("/teacher/assignments/{assignment_id}", response_model=CourseContentResponse)
def teacher_update_assignment(
    assignment_id: int,
    data: AssignmentUpdateRequest,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    course = teacher_course_or_404(db, teacher, assignment.course_id)
    before = {"title": assignment.title, "module_id": assignment.module_id, "due_at": assignment.due_at, "is_open": assignment.is_open}
    if data.title is not None:
        title = data.title.strip()
        if not title:
            raise HTTPException(status_code=400, detail="Assignment title is required")
        assignment.title = title
    if data.instructions is not None:
        assignment.instructions = data.instructions.strip() if data.instructions else None
    if data.module_id is not None:
        validate_course_module(db, assignment.course_id, data.module_id)
        assignment.module_id = data.module_id
    if data.attachment_url is not None:
        assignment.attachment_url = data.attachment_url.strip() if data.attachment_url else None
    if data.attachment_name is not None:
        assignment.attachment_name = data.attachment_name.strip() if data.attachment_name else None
    if data.total_points is not None:
        assignment.total_points = max(data.total_points, 1)
    if data.estimated_minutes is not None:
        assignment.estimated_minutes = max(data.estimated_minutes, 1)
    if data.due_at is not None:
        assignment.due_at = data.due_at
    if data.is_open is not None:
        assignment.is_open = data.is_open
    create_audit_log(db, teacher, "teacher.assignment_updated", "assignment", assignment.id, f"Teacher updated assignment {assignment.title}", {"course_id": course.id, "before": before, "after_is_open": assignment.is_open})
    db.commit()
    return admin_course_content_to_response(db, course)


@app.delete("/teacher/assignments/{assignment_id}")
def teacher_delete_assignment(
    assignment_id: int,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    course = teacher_course_or_404(db, teacher, assignment.course_id)
    submission_ids = [row[0] for row in db.query(Submission.id).filter(Submission.assignment_id == assignment.id).all()]
    if submission_ids:
        db.query(Grade).filter(Grade.submission_id.in_(submission_ids)).delete(synchronize_session=False)
        db.query(Submission).filter(Submission.id.in_(submission_ids)).delete(synchronize_session=False)
    assignment_title = assignment.title
    db.delete(assignment)
    create_audit_log(db, teacher, "teacher.assignment_deleted", "assignment", assignment_id, f"Teacher deleted assignment {assignment_title}", {"course_id": course.id, "submission_count": len(submission_ids)})
    db.commit()
    return {"message": "Assignment deleted", "assignment_id": assignment_id}


@app.post("/admin/courses/{course_id}/assignments", response_model=CourseContentResponse)
def admin_create_assignment(
    course_id: int,
    data: AssignmentCreateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    validate_course_module(db, course.id, data.module_id)
    title = data.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Assignment title is required")
    assignment = Assignment(
        course_id=course.id,
        module_id=data.module_id,
        title=title,
        instructions=data.instructions.strip() if data.instructions else None,
        attachment_url=data.attachment_url.strip() if data.attachment_url else None,
        attachment_name=data.attachment_name.strip() if data.attachment_name else None,
        total_points=max(data.total_points, 1),
        estimated_minutes=max(data.estimated_minutes, 1),
        due_at=data.due_at,
        is_open=data.is_open,
    )
    db.add(assignment)
    db.flush()
    create_audit_log(
        db,
        admin,
        "assignment.created",
        "assignment",
        assignment.id,
        f"Created assignment {assignment.title} for {course.title}",
        {"course_id": course.id, "module_id": assignment.module_id},
    )
    db.commit()
    return admin_course_content_to_response(db, course)


@app.post("/admin/courses/{course_id}/assignments/upload", response_model=MaterialUploadResponse)
async def admin_upload_assignment_file(
    course_id: int,
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    original_name = safe_upload_filename(file.filename or "assignment-attachment")
    extension = "." + original_name.rsplit(".", 1)[-1].lower() if "." in original_name else ""
    if extension not in ALLOWED_MATERIAL_EXTENSIONS:
        raise HTTPException(status_code=400, detail="This file type is not allowed for assignment attachments")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File is empty")
    if len(content) > MAX_MATERIAL_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File must be 25 MB or smaller")
    file_path = f"courses/{course.id}/assignments/{now_ts()}-{uuid.uuid4().hex[:10]}-{original_name}"
    file_url = upload_to_supabase_storage(file_path, content, file.content_type)
    create_audit_log(
        db,
        admin,
        "assignment.file_uploaded",
        "course",
        course.id,
        f"Uploaded assignment attachment {original_name}",
        {"file_path": file_path, "size": len(content)},
    )
    db.commit()
    return {"file_url": file_url, "file_path": file_path, "file_name": original_name, "content_type": file.content_type, "size": len(content)}


@app.get("/teacher/submissions")
def teacher_list_submissions(
    course_id: int | None = None,
    grading: Literal["all", "graded", "ungraded"] = "all",
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Submission, Grade, Assignment, Course, User, Module)
        .outerjoin(Grade, Grade.submission_id == Submission.id)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .join(User, Submission.student_id == User.id)
        .outerjoin(Module, Assignment.module_id == Module.id)
        .filter(Course.teacher_id == teacher.id)
    )
    if course_id is not None:
        query = query.filter(Course.id == course_id)
    if grading == "graded":
        query = query.filter(Grade.id.isnot(None))
    elif grading == "ungraded":
        query = query.filter(Grade.id.is_(None))
    rows = query.order_by(Submission.submitted_at.desc()).all()
    submissions = []
    for submission, grade, assignment, course, student, module in rows:
        teacher_comment = submission.teacher_feedback or (grade.feedback if grade else None)
        submissions.append({
            "submission_id": submission.id,
            "submission_status": submission.status,
            "submitted_at": submission.submitted_at,
            "text_response": submission.text_response,
            "file_url": submission.file_url,
            "teacher_comment": teacher_comment,
            "student": {"id": student.id, "full_name": student.full_name, "email": student.email, "profile_image_url": student.profile_image_url},
            "course": {"id": course.id, "title": course.title},
            "module": {"id": module.id, "title": module.title, "position": module.position} if module else None,
            "assignment": {"id": assignment.id, "title": assignment.title, "total_points": assignment.total_points, "due_at": assignment.due_at, "module_id": assignment.module_id},
            "grade": {"id": grade.id, "score": grade.score, "total_points": grade.total_points, "feedback": teacher_comment, "graded_at": grade.graded_at} if grade else None,
        })
    return submissions


@app.post("/teacher/submissions/{submission_id}/grade")
def teacher_grade_submission(
    submission_id: int,
    data: GradeSubmissionRequest,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    row = (
        db.query(Submission, Assignment, Course)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .filter(Submission.id == submission_id, Course.teacher_id == teacher.id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Submission not found")
    submission, assignment, course = row
    grade = db.query(Grade).filter(Grade.submission_id == submission.id).first()
    score = data.score if data.score is not None else (grade.score if grade else 0)
    total_points = data.total_points if data.total_points is not None else (grade.total_points if grade else assignment.total_points)
    if not grade:
        grade = Grade(submission_id=submission.id, graded_by=teacher.id, score=score, total_points=total_points, feedback=submission.teacher_feedback)
        db.add(grade)
    else:
        grade.graded_by = teacher.id
        grade.score = score
        grade.total_points = total_points
        grade.feedback = submission.teacher_feedback
        grade.graded_at = now_ts()
    submission.status = "graded"
    create_audit_log(db, teacher, "teacher.submission_reviewed", "submission", submission.id, f"Teacher reviewed {assignment.title}", {"course_id": course.id})
    db.commit()
    return {"message": "Submission reviewed", "submission_id": submission.id}


@app.delete("/teacher/submissions/{submission_id}/grade")
def teacher_unreview_submission(
    submission_id: int,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    row = (
        db.query(Submission, Assignment, Course)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .filter(Submission.id == submission_id, Course.teacher_id == teacher.id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Submission not found")
    submission, assignment, course = row
    grade = db.query(Grade).filter(Grade.submission_id == submission.id).first()
    if grade:
        if not submission.teacher_feedback and grade.feedback:
            submission.teacher_feedback = grade.feedback
        db.delete(grade)
    submission.status = "late" if assignment.due_at and submission.submitted_at > assignment.due_at else "submitted"
    create_audit_log(db, teacher, "teacher.submission_unreviewed", "submission", submission.id, f"Teacher marked {assignment.title} as not reviewed", {"course_id": course.id})
    db.commit()
    return {"message": "Submission marked as not reviewed", "submission_id": submission.id}


@app.patch("/teacher/submissions/{submission_id}/comment")
def teacher_update_submission_comment(
    submission_id: int,
    data: SubmissionCommentRequest,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    row = (
        db.query(Submission, Assignment, Course)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .filter(Submission.id == submission_id, Course.teacher_id == teacher.id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Submission not found")
    submission, assignment, course = row
    feedback = data.feedback.strip() if data.feedback else None
    submission.teacher_feedback = feedback
    grade = db.query(Grade).filter(Grade.submission_id == submission.id).first()
    if grade:
        grade.feedback = feedback
    action = "teacher.submission_comment_deleted" if not feedback else "teacher.submission_comment_updated"
    message = f"Teacher {'deleted comment for' if not feedback else 'commented on'} {assignment.title}"
    create_audit_log(db, teacher, action, "submission", submission.id, message, {"course_id": course.id})
    db.commit()
    return {"message": "Teacher comment updated" if feedback else "Teacher comment deleted", "submission_id": submission.id, "teacher_comment": feedback}


@app.get("/admin/submissions")
def admin_list_submissions(
    course_id: int | None = None,
    grading: Literal["all", "graded", "ungraded"] = "all",
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Submission, Grade, Assignment, Course, User, Module)
        .outerjoin(Grade, Grade.submission_id == Submission.id)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .join(User, Submission.student_id == User.id)
        .outerjoin(Module, Assignment.module_id == Module.id)
    )
    if course_id is not None:
        query = query.filter(Course.id == course_id)
    if grading == "graded":
        query = query.filter(Grade.id.isnot(None))
    elif grading == "ungraded":
        query = query.filter(Grade.id.is_(None))
    rows = query.order_by(Submission.submitted_at.desc()).all()
    submissions = []
    for submission, grade, assignment, course, student, module in rows:
        teacher_comment = submission.teacher_feedback or (grade.feedback if grade else None)
        submissions.append({
            "submission_id": submission.id,
            "submission_status": submission.status,
            "submitted_at": submission.submitted_at,
            "text_response": submission.text_response,
            "file_url": submission.file_url,
            "teacher_comment": teacher_comment,
            "student": {"id": student.id, "full_name": student.full_name, "email": student.email, "profile_image_url": student.profile_image_url},
            "course": {"id": course.id, "title": course.title},
            "module": {"id": module.id, "title": module.title, "position": module.position} if module else None,
            "assignment": {"id": assignment.id, "title": assignment.title, "total_points": assignment.total_points, "due_at": assignment.due_at, "module_id": assignment.module_id},
            "grade": {"id": grade.id, "score": grade.score, "total_points": grade.total_points, "feedback": teacher_comment, "graded_at": grade.graded_at} if grade else None,
        })
    return submissions


@app.post("/admin/submissions/{submission_id}/grade")
def admin_grade_submission(
    submission_id: int,
    data: GradeSubmissionRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    row = (
        db.query(Submission, Assignment, Course)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .filter(Submission.id == submission_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Submission not found")
    submission, assignment, course = row
    grade = db.query(Grade).filter(Grade.submission_id == submission.id).first()
    score = data.score if data.score is not None else (grade.score if grade else 0)
    total_points = data.total_points if data.total_points is not None else (grade.total_points if grade else assignment.total_points)
    if not grade:
        grade = Grade(submission_id=submission.id, graded_by=admin.id, score=score, total_points=total_points, feedback=submission.teacher_feedback)
        db.add(grade)
    else:
        grade.graded_by = admin.id
        grade.score = score
        grade.total_points = total_points
        grade.feedback = submission.teacher_feedback
        grade.graded_at = now_ts()
    submission.status = "graded"
    create_audit_log(db, admin, "admin.submission_reviewed", "submission", submission.id, f"Administrator reviewed {assignment.title}", {"course_id": course.id})
    db.commit()
    return {"message": "Submission reviewed", "submission_id": submission.id}


@app.delete("/admin/submissions/{submission_id}/grade")
def admin_unreview_submission(
    submission_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    row = (
        db.query(Submission, Assignment, Course)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .filter(Submission.id == submission_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Submission not found")
    submission, assignment, course = row
    grade = db.query(Grade).filter(Grade.submission_id == submission.id).first()
    if grade:
        if not submission.teacher_feedback and grade.feedback:
            submission.teacher_feedback = grade.feedback
        db.delete(grade)
    submission.status = "late" if assignment.due_at and submission.submitted_at > assignment.due_at else "submitted"
    create_audit_log(db, admin, "admin.submission_unreviewed", "submission", submission.id, f"Administrator marked {assignment.title} as not reviewed", {"course_id": course.id})
    db.commit()
    return {"message": "Submission marked as not reviewed", "submission_id": submission.id}


@app.patch("/admin/submissions/{submission_id}/comment")
def admin_update_submission_comment(
    submission_id: int,
    data: SubmissionCommentRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    row = (
        db.query(Submission, Assignment, Course)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .filter(Submission.id == submission_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Submission not found")
    submission, assignment, course = row
    feedback = data.feedback.strip() if data.feedback else None
    submission.teacher_feedback = feedback
    grade = db.query(Grade).filter(Grade.submission_id == submission.id).first()
    if grade:
        grade.feedback = feedback
    action = "admin.submission_comment_deleted" if not feedback else "admin.submission_comment_updated"
    message = f"Administrator {'deleted comment for' if not feedback else 'commented on'} {assignment.title}"
    create_audit_log(db, admin, action, "submission", submission.id, message, {"course_id": course.id})
    db.commit()
    return {"message": "Comment updated" if feedback else "Comment deleted", "submission_id": submission.id, "teacher_comment": feedback}


@app.get("/teacher/announcements", response_model=list[AnnouncementResponse])
def teacher_list_announcements(
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    course_ids = [course.id for course in db.query(Course).filter(Course.teacher_id == teacher.id).all()]
    rows = (
        db.query(Announcement, User, Course)
        .join(User, Announcement.author_id == User.id)
        .outerjoin(Course, Announcement.course_id == Course.id)
        .filter((Announcement.audience == "platform") | (Announcement.course_id.in_(course_ids)))
        .order_by(Announcement.is_urgent.desc(), Announcement.created_at.desc())
        .all()
    )
    return [announcement_to_response(announcement, author, course) for announcement, author, course in rows]


@app.post("/teacher/courses/{course_id}/announcements", response_model=AnnouncementResponse)
def teacher_create_announcement(
    course_id: int,
    data: AnnouncementCreateRequest,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    course = teacher_course_or_404(db, teacher, course_id)
    title = data.title.strip()
    body = data.body.strip()
    if not title or not body:
        raise HTTPException(status_code=400, detail="Title and message are required")
    attachment_url = data.attachment_url.strip() if data.attachment_url else None
    attachment_name = data.attachment_name.strip() if data.attachment_name else None
    announcement = Announcement(
        author_id=teacher.id,
        course_id=course.id,
        title=title,
        body=body,
        attachment_url=attachment_url,
        attachment_name=attachment_name,
        audience="course",
        is_urgent=data.is_urgent,
    )
    db.add(announcement)
    db.flush()
    create_audit_log(db, teacher, "teacher.announcement_created", "announcement", announcement.id, f"Teacher posted announcement {announcement.title}", {"course_id": course.id})
    db.commit()
    db.refresh(announcement)
    return announcement_to_response(announcement, teacher, course)


@app.post("/teacher/announcements/upload", response_model=MaterialUploadResponse)
async def teacher_upload_announcement_attachment(
    file: UploadFile = File(...),
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    upload = await upload_lms_file(file, "announcement-attachment", f"announcements/teacher/{teacher.id}", "announcements")
    create_audit_log(
        db,
        teacher,
        "teacher.announcement_attachment_uploaded",
        "announcement",
        None,
        f"Teacher uploaded announcement attachment {upload['file_name']}",
        {"file_path": upload["file_path"], "file_name": upload["file_name"], "size": upload["size"], "content_type": upload["content_type"]},
    )
    db.commit()
    return upload


@app.delete("/teacher/announcements/{announcement_id}")
def teacher_delete_announcement(
    announcement_id: int,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    row = (
        db.query(Announcement, Course)
        .join(Course, Announcement.course_id == Course.id)
        .filter(Announcement.id == announcement_id, Course.teacher_id == teacher.id, Announcement.author_id == teacher.id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Announcement not found")
    announcement, course = row
    title = announcement.title
    db.query(AnnouncementRead).filter(AnnouncementRead.announcement_id == announcement.id).delete(synchronize_session=False)
    db.delete(announcement)
    create_audit_log(db, teacher, "teacher.announcement_deleted", "announcement", announcement_id, f"Teacher deleted announcement {title}", {"course_id": course.id})
    db.commit()
    return {"message": "Announcement deleted", "announcement_id": announcement_id}


@app.get("/admin/enrollment-requests", response_model=list[EnrollmentRequestResponse])
def admin_list_enrollment_requests(
    status: Literal["all", "pending", "approved", "rejected", "removed"] = "pending",
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = (
        db.query(EnrollmentRequest, User, Course)
        .join(User, EnrollmentRequest.student_id == User.id)
        .join(Course, EnrollmentRequest.course_id == Course.id)
    )
    if status != "all":
        query = query.filter(EnrollmentRequest.status == status)
    rows = query.order_by(EnrollmentRequest.created_at.desc()).all()
    return [enrollment_request_to_response(request_row, student, course) for request_row, student, course in rows]


@app.get("/admin/cohorts", response_model=list[CohortResponse])
def admin_list_cohorts(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    backfill_unassigned_alumni_cohorts(db)
    cohorts = db.query(Cohort).order_by(Cohort.created_at.desc()).all()
    return [cohort_to_response(db, cohort, include_stats=True) for cohort in cohorts]


@app.get("/admin/cohorts/{cohort_id}/students.csv")
def admin_export_cohort_students_csv(
    cohort_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    backfill_unassigned_alumni_cohorts(db)
    cohort = db.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")

    enrolled_student_ids = {
        row[0]
        for row in db.query(Enrollment.student_id)
        .filter(Enrollment.cohort_id == cohort.id, Enrollment.status == "approved")
        .distinct()
        .all()
    }
    requested_student_ids = {
        row[0]
        for row in db.query(EnrollmentRequest.student_id)
        .filter(EnrollmentRequest.cohort_id == cohort.id)
        .distinct()
        .all()
    }
    alumni_student_ids = {
        row[0]
        for row in db.query(User.id)
        .filter(User.role == "student", User.lifecycle_status == "alumni", User.alumni_cohort_id == cohort.id)
        .all()
    }
    student_ids = sorted(enrolled_student_ids | requested_student_ids | alumni_student_ids)
    students = (
        db.query(User)
        .filter(User.id.in_(student_ids), User.role == "student")
        .order_by(User.full_name.asc())
        .all()
        if student_ids
        else []
    )

    enrollment_rows = (
        db.query(Enrollment, Course)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(Enrollment.cohort_id == cohort.id, Enrollment.student_id.in_(student_ids))
        .order_by(Course.title.asc())
        .all()
        if student_ids
        else []
    )
    request_rows = (
        db.query(EnrollmentRequest, Course)
        .join(Course, EnrollmentRequest.course_id == Course.id)
        .filter(EnrollmentRequest.cohort_id == cohort.id, EnrollmentRequest.student_id.in_(student_ids))
        .order_by(EnrollmentRequest.created_at.desc())
        .all()
        if student_ids
        else []
    )
    certificate_rows = (
        db.query(Certificate, Course)
        .join(Course, Certificate.course_id == Course.id)
        .filter(Certificate.cohort_id == cohort.id, Certificate.student_id.in_(student_ids))
        .order_by(Course.title.asc())
        .all()
        if student_ids
        else []
    )

    enrollments_by_student: dict[int, list[tuple[Enrollment, Course]]] = {student.id: [] for student in students}
    requests_by_student: dict[int, list[tuple[EnrollmentRequest, Course]]] = {student.id: [] for student in students}
    certificates_by_student: dict[int, list[tuple[Certificate, Course]]] = {student.id: [] for student in students}
    for enrollment, course in enrollment_rows:
        enrollments_by_student.setdefault(enrollment.student_id, []).append((enrollment, course))
    for request_row, course in request_rows:
        requests_by_student.setdefault(request_row.student_id, []).append((request_row, course))
    for certificate, course in certificate_rows:
        certificates_by_student.setdefault(certificate.student_id, []).append((certificate, course))

    rows: list[list[object]] = [[
        "Student ID",
        "Full Name",
        "Email",
        "Phone",
        "Role",
        "Account Status",
        "Lifecycle",
        "Cohort",
        "Cohort Status",
        "Registered At",
        "Approved Courses",
        "Approved Course Count",
        "Enrollment Requests",
        "Pending Requests",
        "Rejected Requests",
        "Certificates",
    ]]
    for student in students:
        enrollments = enrollments_by_student.get(student.id, [])
        requests = requests_by_student.get(student.id, [])
        certificates = certificates_by_student.get(student.id, [])
        approved_courses = [course.title for enrollment, course in enrollments if enrollment.status == "approved"]
        request_labels = [f"{course.title} ({request_row.status})" for request_row, course in requests]
        certificate_labels = [f"{course.title}: {certificate.file_name or certificate.file_url}" for certificate, course in certificates]
        rows.append([
            learner_display_id(student),
            student.full_name,
            student.email,
            student.phone or "",
            "Alumni" if (student.lifecycle_status or "active_student") == "alumni" else "Student",
            "Active" if student.is_active else "Pending/Suspended",
            student.lifecycle_status or "active_student",
            cohort.name,
            cohort.status,
            time.strftime("%Y-%m-%d %H:%M", time.localtime(student.created_at)) if student.created_at else "",
            "; ".join(approved_courses),
            len(approved_courses),
            "; ".join(request_labels),
            sum(1 for request_row, _course in requests if request_row.status == "pending"),
            sum(1 for request_row, _course in requests if request_row.status == "rejected"),
            "; ".join(certificate_labels),
        ])

    return csv_response(f"three13-{cohort.name}-students.csv", rows)


@app.post("/admin/cohorts", response_model=CohortResponse)
def admin_create_cohort(
    data: CohortCreateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    name = data.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Cohort name is required")
    cohort = Cohort(name=name, status="upcoming", starts_at=data.starts_at, ends_at=data.ends_at, created_at=now_ts())
    db.add(cohort)
    db.flush()
    create_audit_log(db, admin, "cohort.created", "cohort", cohort.id, f"Created cohort {cohort.name}", {})
    db.commit()
    db.refresh(cohort)
    return cohort_to_response(db, cohort, include_stats=True)


@app.post("/admin/cohorts/{cohort_id}/activate", response_model=CohortResponse)
def admin_activate_cohort(
    cohort_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    cohort = db.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    now = now_ts()
    active_cohorts = db.query(Cohort).filter(Cohort.status == "active", Cohort.id != cohort.id).all()
    if active_cohorts:
        raise HTTPException(status_code=409, detail="Complete the current active cohort before activating another cohort")
    was_completed = cohort.status == "completed"
    cohort.status = "active"
    cohort.starts_at = cohort.starts_at or now
    if was_completed:
        cohort.ends_at = None
    cohort.archived_at = None
    student_ids = [
        row[0]
        for row in db.query(Enrollment.student_id).filter(Enrollment.cohort_id == cohort.id, Enrollment.status == "approved").distinct().all()
    ]
    if student_ids:
        db.query(User).filter(User.id.in_(student_ids), User.role == "student").update(
            {
                User.lifecycle_status: "active_student",
                User.is_active: True,
                User.alumni_cohort_id: None,
            },
            synchronize_session=False,
        )
    create_audit_log(
        db,
        admin,
        "cohort.reactivated" if was_completed else "cohort.activated",
        "cohort",
        cohort.id,
        f"{'Reactivated' if was_completed else 'Activated'} cohort {cohort.name}",
        {"students_restored_to_active": len(student_ids) if was_completed else 0},
    )
    db.commit()
    db.refresh(cohort)
    return cohort_to_response(db, cohort, include_stats=True)


@app.delete("/admin/cohorts/{cohort_id}")
def admin_delete_upcoming_cohort(
    cohort_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    cohort = db.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    if cohort.status != "upcoming":
        raise HTTPException(status_code=400, detail="Only upcoming cohorts can be deleted")

    linked_counts = {
        "enrollments": db.query(Enrollment).filter(Enrollment.cohort_id == cohort.id).count(),
        "enrollment_requests": db.query(EnrollmentRequest).filter(EnrollmentRequest.cohort_id == cohort.id).count(),
        "certificates": db.query(Certificate).filter(Certificate.cohort_id == cohort.id).count(),
        "alumni": db.query(User).filter(User.role == "student", User.alumni_cohort_id == cohort.id).count(),
    }
    if any(linked_counts.values()):
        raise HTTPException(status_code=409, detail="This cohort has learner records and cannot be deleted")

    create_audit_log(db, admin, "cohort.deleted", "cohort", cohort.id, f"Deleted upcoming cohort {cohort.name}", linked_counts)
    db.delete(cohort)
    db.commit()
    return {"message": "Upcoming cohort deleted.", "cohort_id": cohort_id}


@app.post("/admin/cohorts/active/complete", response_model=CohortResponse)
def admin_complete_active_cohort(
    data: CohortCompleteRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    cohort = get_active_cohort(db, create_if_missing=False)
    if not cohort:
        raise HTTPException(status_code=404, detail="No active cohort found")
    now = now_ts()
    student_ids = [
        row[0]
        for row in db.query(Enrollment.student_id).filter(Enrollment.cohort_id == cohort.id, Enrollment.status == "approved").distinct().all()
    ]
    cohort.status = "completed"
    cohort.ends_at = cohort.ends_at or now
    cohort.archived_at = now
    if data.archive_students_as_alumni and student_ids:
        db.query(User).filter(User.id.in_(student_ids), User.role == "student").update(
            {User.lifecycle_status: "alumni", User.alumni_cohort_id: cohort.id},
            synchronize_session=False,
        )
    create_audit_log(
        db,
        admin,
        "cohort.completed",
        "cohort",
        cohort.id,
        f"Completed cohort {cohort.name}",
        {"students_moved_to_alumni": len(student_ids) if data.archive_students_as_alumni else 0},
    )
    db.commit()
    db.refresh(cohort)
    return cohort_to_response(db, cohort, include_stats=True)


@app.get("/admin/recent-activity")
def admin_recent_activity(
    limit: int = 12,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return build_admin_recent_activity(db, max(1, min(limit, 50)))


@app.get("/admin/dashboard-summary", response_model=AdminDashboardSummaryResponse)
def admin_dashboard_summary(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    now = now_ts()
    day_seconds = 24 * 60 * 60
    trend_offsets = [28, 21, 14, 7, 0]
    trend_cutoffs = [now - (offset * day_seconds) for offset in trend_offsets]
    trend_labels = []
    for cutoff in trend_cutoffs:
        cutoff_time = time.localtime(cutoff)
        trend_labels.append(f"{time.strftime('%b', cutoff_time)} {cutoff_time.tm_mday}")
    active_cohort = get_active_cohort(db, create_if_missing=False)
    total_students = db.query(User).filter(User.role == "student", User.lifecycle_status == "active_student").count()
    total_teachers = db.query(User).filter(User.role == "teacher").count()
    total_courses = db.query(Course).count()
    pending_students = db.query(User).filter(User.role == "student", User.lifecycle_status == "active_student", User.is_active == False).count()  # noqa: E712
    program_participants = db.query(User).filter(User.role == "student").count()
    alumni_count = db.query(User).filter(User.role == "student", User.lifecycle_status == "alumni").count()
    pending_request_rows = (
        db.query(EnrollmentRequest, User, Course)
        .join(User, EnrollmentRequest.student_id == User.id)
        .join(Course, EnrollmentRequest.course_id == Course.id)
        .filter(EnrollmentRequest.status == "pending")
        .filter(EnrollmentRequest.cohort_id == active_cohort.id if active_cohort else EnrollmentRequest.cohort_id.is_(None))
        .order_by(EnrollmentRequest.created_at.desc())
        .limit(5)
        .all()
    )

    recent_submission_rows = (
        db.query(Submission, User, Assignment, Course, Module)
        .join(User, Submission.student_id == User.id)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .outerjoin(Module, Assignment.module_id == Module.id)
        .order_by(Submission.submitted_at.desc())
        .limit(5)
        .all()
    )
    recent_announcement_rows = (
        db.query(Announcement, User)
        .join(User, Announcement.author_id == User.id)
        .order_by(Announcement.created_at.desc())
        .limit(5)
        .all()
    )
    recent_material_rows = (
        db.query(CourseMaterial, Course, Module, User)
        .join(Course, CourseMaterial.course_id == Course.id)
        .outerjoin(Module, CourseMaterial.module_id == Module.id)
        .outerjoin(User, Course.teacher_id == User.id)
        .order_by(CourseMaterial.created_at.desc())
        .limit(5)
        .all()
    )
    recent_enrollment_rows = (
        db.query(Enrollment, User, Course)
        .join(User, Enrollment.student_id == User.id)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(Enrollment.status == "approved")
        .order_by(Enrollment.approved_at.desc().nullslast(), Enrollment.created_at.desc())
        .limit(5)
        .all()
    )
    recent_course_rows = db.query(Course).order_by(Course.created_at.desc()).limit(5).all()
    recent_support_ticket_rows = (
        db.query(SupportTicket, User)
        .outerjoin(User, SupportTicket.user_id == User.id)
        .order_by(SupportTicket.created_at.desc())
        .limit(5)
        .all()
    )
    AuditActor = aliased(User)
    recent_support_logs = (
        db.query(AuditLog, AuditActor)
        .outerjoin(AuditActor, AuditLog.actor_id == AuditActor.id)
        .filter(AuditLog.target_type == "support_ticket", AuditLog.action != "support.ticket_created")
        .order_by(AuditLog.created_at.desc())
        .limit(5)
        .all()
    )
    pending_enrollment_notifications_by_student: dict[int, dict] = {}
    for request_row, student, course in pending_request_rows:
        notification = pending_enrollment_notifications_by_student.setdefault(
            student.id,
            {
                "id": f"enrollment-student-{student.id}-cohort-{request_row.cohort_id or 'none'}",
                "type": "enrollment",
                "title": "New student signup",
                "student_name": student.full_name,
                "course_titles": [],
                "created_at": request_row.created_at,
                "pane": "students",
            },
        )
        notification["course_titles"].append(course.title)
        notification["created_at"] = max(notification["created_at"], request_row.created_at)

    pending_enrollment_notifications = []
    for notification in pending_enrollment_notifications_by_student.values():
        course_count = len(notification.pop("course_titles"))
        student_name = notification.pop("student_name")
        notification["detail"] = (
            f"{student_name} requested access to {course_count} courses"
            if course_count != 1
            else f"{student_name} requested course access"
        )
        pending_enrollment_notifications.append(notification)
    pending_enrollment_notifications.sort(key=lambda item: item["created_at"], reverse=True)
    recent_teacher_activity = build_teacher_action_activity(db, 8)
    teacher_action_notifications = [
        {
            "id": activity["id"],
            "type": activity["type"],
            "title": activity["title"],
            "detail": f"{activity['detail']} in {activity['course']}",
            "created_at": activity["created_at"],
            "pane": activity["pane"],
        }
        for activity in recent_teacher_activity
    ]
    admin_notifications = sorted(
        [
            *pending_enrollment_notifications,
            *[
                {
                    "id": f"submission-{submission.id}",
                    "type": "submission",
                    "title": "Assignment submitted",
                    "detail": f"{user_display_name(student)} submitted \"{assignment.title}\"",
                    "created_at": submission.submitted_at,
                    "pane": "assignments",
                }
                for submission, student, assignment, _course, _module in recent_submission_rows
            ],
            *[
                {
                    "id": f"announcement-{announcement.id}",
                    "type": "announcement",
                    "title": "Announcement posted",
                    "detail": f"{user_display_name(author)} posted \"{announcement.title}\"",
                    "created_at": announcement.created_at,
                    "pane": "announcements",
                }
                for announcement, author in recent_announcement_rows
            ],
            *teacher_action_notifications,
        ],
        key=lambda item: item["created_at"] or 0,
        reverse=True,
    )[:12]
    enrollment_activity_by_student: dict[tuple[int, int | None], dict] = {}
    for enrollment, student, course in recent_enrollment_rows:
        key = (student.id, enrollment.cohort_id)
        activity = enrollment_activity_by_student.setdefault(
            key,
            {
                "id": f"enrollment-student-{student.id}-cohort-{enrollment.cohort_id or 'none'}",
                "type": "enrollment",
                "title": "Student enrolled",
                "actor": user_display_name(student),
                "course_titles": [],
                "created_at": enrollment.approved_at or enrollment.created_at,
                "action_label": "View student",
                "pane": "students",
            },
        )
        activity["course_titles"].append(course.title)
        activity["created_at"] = max(activity["created_at"], enrollment.approved_at or enrollment.created_at)
    enrollment_activity = []
    for activity in enrollment_activity_by_student.values():
        course_titles = activity.pop("course_titles")
        course_count = len(course_titles)
        first_course = course_titles[0] if course_titles else "course access"
        activity["detail"] = (
            f"{activity['actor']} enrolled in {course_count} courses"
            if course_count != 1
            else f"{activity['actor']} enrolled in {first_course}"
        )
        activity["detail_status"] = "New enrollment"
        activity["course"] = f"{course_count} courses" if course_count != 1 else first_course
        activity["location"] = "Enrollment"
        enrollment_activity.append(activity)

    return {
        "totals": {
            "students": total_students,
            "teachers": total_teachers,
            "courses": total_courses,
            "pending_enrollment_requests": pending_students,
            "program_participants": program_participants,
            "alumni": alumni_count,
            "active_cohort": cohort_to_response(db, active_cohort) if active_cohort else None,
        },
        "overview": {
            "labels": trend_labels,
            "series": [
                {
                    "label": "Students",
                    "points": [
                        db.query(User).filter(User.role == "student", User.created_at <= cutoff).count()
                        for cutoff in trend_cutoffs
                    ],
                },
                {
                    "label": "Courses",
                    "points": [
                        db.query(Course).filter(Course.created_at <= cutoff).count()
                        for cutoff in trend_cutoffs
                    ],
                },
                {
                    "label": "Enrollments",
                    "points": [
                        db.query(Enrollment).filter(Enrollment.status == "approved", Enrollment.created_at <= cutoff).count()
                        for cutoff in trend_cutoffs
                    ],
                },
            ],
        },
        "notifications": admin_notifications,
        "recent_activity": sorted(
            [
                *[
                    {
                        "id": f"submission-{submission.id}",
                        "type": "submission",
                        "title": "Assignment submitted",
                        "actor": user_display_name(student),
                        "detail": f"{user_display_name(student)} submitted \"{assignment.title}\"",
                        "detail_status": "Late" if submission.status == "late" else "On time",
                        "course": course.title,
                        "location": module.title if module else "Course assignment",
                        "created_at": submission.submitted_at,
                        "action_label": "View submission",
                        "pane": "assignments",
                    }
                    for submission, student, assignment, course, module in recent_submission_rows
                ],
                *[
                    {
                        "id": f"announcement-{announcement.id}",
                        "type": "announcement",
                        "title": "Announcement posted",
                        "actor": user_display_name(author),
                        "detail": f"{user_display_name(author)} posted \"{announcement.title}\"",
                        "detail_status": "Visible",
                        "course": course.title if course else "All Courses",
                        "location": "Announcement",
                        "created_at": announcement.created_at,
                        "action_label": "View announcement",
                        "pane": "announcements",
                    }
                    for announcement, author in recent_announcement_rows
                    for course in [db.get(Course, announcement.course_id) if announcement.course_id else None]
                ],
                *recent_teacher_activity,
                *enrollment_activity,
                *[
                    {
                        "id": f"course-{course.id}",
                        "type": "course",
                        "title": "Course created",
                        "actor": "Administrator",
                        "detail": f"Created \"{course.title}\"",
                        "detail_status": f"{db.query(Module).filter(Module.course_id == course.id).count()} modules",
                        "course": course.title,
                        "location": "Course",
                        "created_at": course.created_at,
                        "action_label": "View course",
                        "pane": "courses",
                    }
                    for course in recent_course_rows
                ],
                *[
                    {
                        "id": f"support-ticket-{ticket.id}",
                        "type": "support",
                        "title": "Support ticket created",
                        "actor": user_display_name(user, ticket.name),
                        "detail": f"{user_display_name(user, ticket.name)} created \"{ticket.subject}\"",
                        "detail_status": ticket.status.replace("_", " ").title(),
                        "course": "Technical Support",
                        "location": ticket.category.replace("_", " ").title(),
                        "created_at": ticket.created_at,
                        "action_label": "Open ticket",
                        "pane": "support",
                    }
                    for ticket, user in recent_support_ticket_rows
                ],
                *[
                    {
                        "id": f"support-{log.id}",
                        "type": "support",
                        "title": "Support ticket updated",
                        "actor": user_display_name(actor, "Administrator"),
                        "detail": log.summary,
                        "detail_status": "Updated",
                        "course": "Technical Support",
                        "location": "Support",
                        "created_at": log.created_at,
                        "action_label": "Open ticket",
                        "pane": "support",
                    }
                    for log, actor in recent_support_logs
                ],
            ],
            key=lambda item: item["created_at"] or 0,
            reverse=True,
        )[:8],
        "recent_submissions": [
            {
                "id": submission.id,
                "student_name": user_display_name(student),
                "assignment_title": assignment.title,
                "course_title": course.title,
                "module_title": module.title if module else None,
                "status": submission.status,
                "submitted_at": submission.submitted_at,
            }
            for submission, student, assignment, course, module in recent_submission_rows
        ],
        "recent_announcements": [
            {
                "id": announcement.id,
                "title": announcement.title,
                "audience": announcement.audience,
                "author_name": user_display_name(author),
                "created_at": announcement.created_at,
            }
            for announcement, author in recent_announcement_rows
        ],
    }


@app.get("/admin/reports-summary")
def admin_reports_summary(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    active_cohort = get_active_cohort(db, create_if_missing=False)
    active_cohort_id = active_cohort.id if active_cohort else None

    active_students = db.query(User).filter(User.role == "student", User.lifecycle_status == "active_student", User.is_active == True).count()  # noqa: E712
    pending_students = db.query(User).filter(User.role == "student", User.lifecycle_status == "active_student", User.is_active == False).count()  # noqa: E712
    alumni = db.query(User).filter(User.role == "student", User.lifecycle_status == "alumni").count()
    teachers = db.query(User).filter(User.role == "teacher").count()
    courses = db.query(Course).count()
    active_courses = db.query(Course).filter(Course.status == "active").count()
    archived_courses = db.query(Course).filter(Course.status == "archived").count()
    modules = db.query(Module).count()
    materials = db.query(CourseMaterial).count()
    visible_materials = db.query(CourseMaterial).filter(CourseMaterial.is_visible == True).count()  # noqa: E712
    assignments = db.query(Assignment).count()
    open_assignments = db.query(Assignment).filter(Assignment.is_open == True).count()  # noqa: E712
    submissions = db.query(Submission).count()
    late_submissions = db.query(Submission).filter(Submission.status == "late").count()
    grades = db.query(Grade).count()
    certificates = db.query(Certificate).count()
    announcements = db.query(Announcement).count()
    urgent_announcements = db.query(Announcement).filter(Announcement.is_urgent == True).count()  # noqa: E712
    support_tickets = db.query(SupportTicket).count()
    open_tickets = db.query(SupportTicket).filter(SupportTicket.status == "open").count()
    in_progress_tickets = db.query(SupportTicket).filter(SupportTicket.status == "in_progress").count()
    closed_tickets = db.query(SupportTicket).filter(SupportTicket.status == "closed").count()
    pending_requests = db.query(EnrollmentRequest).filter(EnrollmentRequest.status == "pending").count()
    approved_requests = db.query(EnrollmentRequest).filter(EnrollmentRequest.status == "approved").count()
    rejected_requests = db.query(EnrollmentRequest).filter(EnrollmentRequest.status == "rejected").count()
    approved_course_access_records = db.query(Enrollment).filter(Enrollment.status == "approved").count()
    approved_unique_students = (
        db.query(Enrollment.student_id)
        .filter(Enrollment.status == "approved")
        .distinct()
        .count()
    )
    current_cohort_students = (
        db.query(Enrollment.student_id)
        .filter(Enrollment.status == "approved", Enrollment.cohort_id == active_cohort_id)
        .distinct()
        .count()
        if active_cohort_id
        else 0
    )
    current_cohort_course_access_records = (
        db.query(Enrollment)
        .filter(Enrollment.status == "approved", Enrollment.cohort_id == active_cohort_id)
        .count()
        if active_cohort_id
        else 0
    )

    course_rows = []
    for course in db.query(Course).order_by(Course.created_at.desc()).all():
        enrolled_students = (
            db.query(Enrollment.student_id)
            .filter(Enrollment.course_id == course.id, Enrollment.status == "approved")
            .distinct()
            .count()
        )
        course_rows.append({
            "id": course.id,
            "title": course.title,
            "status": course.status,
            "enrolled_students": enrolled_students,
            "materials": db.query(CourseMaterial).filter(CourseMaterial.course_id == course.id).count(),
            "assignments": db.query(Assignment).filter(Assignment.course_id == course.id).count(),
            "submissions": (
                db.query(Submission)
                .join(Assignment, Submission.assignment_id == Assignment.id)
                .filter(Assignment.course_id == course.id)
                .count()
            ),
        })

    cohort_rows = [
        cohort_to_response(db, cohort, include_stats=True)
        for cohort in db.query(Cohort).order_by(Cohort.starts_at.desc().nullslast(), Cohort.created_at.desc()).all()
    ]
    support_categories = [
        {
            "category": option,
            "count": db.query(SupportTicket).filter(SupportTicket.category == option).count(),
        }
        for option in ["student_question", "teacher_issue", "technical_problem", "enrollment_confirmation"]
    ]
    upcoming_assignments = [
        {
            "id": assignment.id,
            "title": assignment.title,
            "course_title": course.title,
            "due_at": assignment.due_at,
            "submissions": db.query(Submission).filter(Submission.assignment_id == assignment.id).count(),
            "late_submissions": db.query(Submission).filter(Submission.assignment_id == assignment.id, Submission.status == "late").count(),
        }
        for assignment, course in (
            db.query(Assignment, Course)
            .join(Course, Assignment.course_id == Course.id)
            .order_by(Assignment.due_at.asc().nullslast(), Assignment.created_at.desc())
            .limit(8)
            .all()
        )
    ]

    return {
        "totals": {
            "active_students": active_students,
            "pending_students": pending_students,
            "alumni": alumni,
            "program_participants": active_students + pending_students + alumni,
            "teachers": teachers,
            "courses": courses,
            "active_courses": active_courses,
            "archived_courses": archived_courses,
            "modules": modules,
            "materials": materials,
            "visible_materials": visible_materials,
            "assignments": assignments,
            "open_assignments": open_assignments,
            "submissions": submissions,
            "late_submissions": late_submissions,
            "grades": grades,
            "certificates": certificates,
            "announcements": announcements,
            "urgent_announcements": urgent_announcements,
            "support_tickets": support_tickets,
            "open_tickets": open_tickets,
            "in_progress_tickets": in_progress_tickets,
            "closed_tickets": closed_tickets,
        },
        "enrollment": {
            "approved_students": approved_unique_students,
            "approved_course_access_records": approved_course_access_records,
            "current_cohort_students": current_cohort_students,
            "current_cohort_course_access_records": current_cohort_course_access_records,
            "pending_requests": pending_requests,
            "approved_requests": approved_requests,
            "rejected_requests": rejected_requests,
        },
        "active_cohort": cohort_to_response(db, active_cohort, include_stats=True) if active_cohort else None,
        "courses": course_rows,
        "cohorts": cohort_rows,
        "support_categories": support_categories,
        "upcoming_assignments": upcoming_assignments,
    }


@app.get("/admin/assignments", response_model=list[AdminAssignmentOverviewResponse])
def admin_list_assignments(
    course_id: int | None = None,
    status: Literal["all", "open", "closed"] = "all",
    grading: Literal["all", "needs_grading", "fully_graded", "no_submissions"] = "all",
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Assignment, Course, Module, User)
        .join(Course, Assignment.course_id == Course.id)
        .outerjoin(Module, Assignment.module_id == Module.id)
        .outerjoin(User, Course.teacher_id == User.id)
    )
    if course_id is not None:
        query = query.filter(Assignment.course_id == course_id)
    if status == "open":
        query = query.filter(Assignment.is_open == True)  # noqa: E712
    elif status == "closed":
        query = query.filter(Assignment.is_open == False)  # noqa: E712

    rows = query.order_by(Assignment.due_at.asc().nullslast(), Assignment.created_at.desc()).all()
    assignment_ids = [assignment.id for assignment, _, _, _ in rows]
    if not assignment_ids:
        return []
    course_ids = list({course.id for _, course, _, _ in rows})
    active_cohort = get_active_cohort(db, create_if_missing=False)
    enrollment_count_query = (
        db.query(Enrollment.course_id, func.count(Enrollment.id))
        .filter(
            Enrollment.course_id.in_(course_ids),
            Enrollment.status == "approved",
        )
    )
    if active_cohort:
        enrollment_count_query = enrollment_count_query.filter(Enrollment.cohort_id == active_cohort.id)
    expected_submissions_by_course_id = {
        course_id: count
        for course_id, count in enrollment_count_query.group_by(Enrollment.course_id).all()
    }

    submission_rows = (
        db.query(Submission, Grade, User)
        .outerjoin(Grade, Grade.submission_id == Submission.id)
        .join(User, Submission.student_id == User.id)
        .filter(Submission.assignment_id.in_(assignment_ids))
        .order_by(Submission.submitted_at.desc())
        .all()
    )

    submissions_by_assignment = {assignment_id: [] for assignment_id in assignment_ids}
    for submission, grade, student in submission_rows:
        submissions_by_assignment.setdefault(submission.assignment_id, []).append((submission, grade, student))

    response = []
    for assignment, course, module, teacher in rows:
        submission_items = submissions_by_assignment.get(assignment.id, [])
        total_submissions = len(submission_items)
        graded_submissions = len([item for item in submission_items if item[1] is not None])
        late_submissions = len([item for item in submission_items if item[0].status == "late"])
        pending_grading = max(total_submissions - graded_submissions, 0)
        latest_submission = max((item[0].submitted_at for item in submission_items), default=None)
        latest_grade = max((item[1].graded_at for item in submission_items if item[1] is not None), default=None)
        latest_submission_student = None
        if latest_submission is not None:
            latest_row = next((item for item in submission_items if item[0].submitted_at == latest_submission), None)
            if latest_row:
                latest_submission_student = {
                    "id": latest_row[2].id,
                    "full_name": latest_row[2].full_name,
                    "email": latest_row[2].email,
                    "profile_image_url": latest_row[2].profile_image_url,
                }

        item = {
            "id": assignment.id,
            "title": assignment.title,
            "instructions": assignment.instructions,
            "total_points": assignment.total_points,
            "due_at": assignment.due_at,
            "is_open": assignment.is_open,
            "created_at": assignment.created_at,
            "course": {
                "id": course.id,
                "title": course.title,
                "status": course.status,
            },
            "module": {
                "id": module.id,
                "title": module.title,
                "position": module.position,
            }
            if module
            else None,
            "teacher": {
                "id": teacher.id,
                "full_name": teacher.full_name,
                "email": teacher.email,
                "profile_image_url": teacher.profile_image_url,
            }
            if teacher
            else None,
            "submissions": {
                "total": total_submissions,
                "expected": expected_submissions_by_course_id.get(course.id, 0),
                "graded": graded_submissions,
                "late": late_submissions,
                "pending_grading": pending_grading,
                "latest_submitted_at": latest_submission,
                "latest_student": latest_submission_student,
            },
            "grading": {
                "status": (
                    "no_submissions"
                    if total_submissions == 0
                    else "fully_graded"
                    if pending_grading == 0
                    else "needs_grading"
                ),
                "latest_graded_at": latest_grade,
            },
        }
        if grading == "needs_grading" and item["grading"]["status"] != "needs_grading":
            continue
        if grading == "fully_graded" and item["grading"]["status"] != "fully_graded":
            continue
        if grading == "no_submissions" and item["grading"]["status"] != "no_submissions":
            continue
        response.append(item)

    return response


@app.patch("/admin/assignments/{assignment_id}", response_model=CourseContentResponse)
def admin_update_assignment(
    assignment_id: int,
    data: AssignmentUpdateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    course = db.get(Course, assignment.course_id)
    before = {
        "title": assignment.title,
        "instructions": assignment.instructions,
        "module_id": assignment.module_id,
        "attachment_url": assignment.attachment_url,
        "attachment_name": assignment.attachment_name,
        "total_points": assignment.total_points,
        "estimated_minutes": assignment.estimated_minutes,
        "due_at": assignment.due_at,
        "is_open": assignment.is_open,
    }
    if data.title is not None:
        title = data.title.strip()
        if not title:
            raise HTTPException(status_code=400, detail="Assignment title is required")
        assignment.title = title
    if data.instructions is not None:
        assignment.instructions = data.instructions.strip() if data.instructions else None
    if data.module_id is not None:
        validate_course_module(db, assignment.course_id, data.module_id)
        assignment.module_id = data.module_id
    if data.attachment_url is not None:
        assignment.attachment_url = data.attachment_url.strip() if data.attachment_url else None
    if data.attachment_name is not None:
        assignment.attachment_name = data.attachment_name.strip() if data.attachment_name else None
    if data.total_points is not None:
        assignment.total_points = max(data.total_points, 1)
    if data.estimated_minutes is not None:
        assignment.estimated_minutes = max(data.estimated_minutes, 1)
    if data.due_at is not None:
        assignment.due_at = data.due_at
    if data.is_open is not None:
        assignment.is_open = data.is_open

    create_audit_log(
        db,
        admin,
        "assignment.updated",
        "assignment",
        assignment.id,
        f"Updated assignment {assignment.title}",
        {"course_id": assignment.course_id, "before": before, "after_is_open": assignment.is_open},
    )
    db.commit()
    return admin_course_content_to_response(db, course)


@app.delete("/admin/assignments/{assignment_id}")
def admin_delete_assignment(
    assignment_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    submission_ids = [
        row[0]
        for row in db.query(Submission.id).filter(Submission.assignment_id == assignment.id).all()
    ]
    if submission_ids:
        db.query(Grade).filter(Grade.submission_id.in_(submission_ids)).delete(synchronize_session=False)
        db.query(Submission).filter(Submission.id.in_(submission_ids)).delete(synchronize_session=False)

    assignment_title = assignment.title
    course_id = assignment.course_id
    db.delete(assignment)
    create_audit_log(
        db,
        admin,
        "assignment.deleted",
        "assignment",
        assignment_id,
        f"Deleted assignment {assignment_title}",
        {"course_id": course_id, "submission_count": len(submission_ids)},
    )
    db.commit()
    return {"message": "Assignment deleted", "assignment_id": assignment_id}


@app.get("/admin/grades", response_model=list[AdminGradeOverviewResponse])
def admin_list_grade_overview(
    course_id: int | None = None,
    status: Literal["all", "graded", "ungraded"] = "all",
    search: str = "",
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    StudentUser = aliased(User)
    TeacherUser = aliased(User)
    query = (
        db.query(Submission, Grade, StudentUser, Assignment, Course, Module, TeacherUser)
        .outerjoin(Grade, Grade.submission_id == Submission.id)
        .join(StudentUser, Submission.student_id == StudentUser.id)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .outerjoin(Module, Assignment.module_id == Module.id)
        .outerjoin(TeacherUser, Course.teacher_id == TeacherUser.id)
    )
    if course_id is not None:
        query = query.filter(Course.id == course_id)
    if status == "graded":
        query = query.filter(Grade.id.isnot(None))
    elif status == "ungraded":
        query = query.filter(Grade.id.is_(None))

    normalized_search = search.strip().lower()
    if normalized_search:
        search_pattern = f"%{normalized_search}%"
        query = query.filter(
            (func.lower(StudentUser.full_name).like(search_pattern))
            | (func.lower(StudentUser.email).like(search_pattern))
            | (func.lower(Assignment.title).like(search_pattern))
            | (func.lower(Course.title).like(search_pattern))
        )

    rows = query.order_by(Submission.submitted_at.desc()).all()
    response = []
    for submission, grade, student, assignment, course, module, teacher in rows:
        response.append(
            {
                "submission_id": submission.id,
                "submission_status": submission.status,
                "submitted_at": submission.submitted_at,
                "student": {
                    "id": student.id,
                    "full_name": student.full_name,
                    "email": student.email,
                    "profile_image_url": student.profile_image_url,
                },
                "course": {
                    "id": course.id,
                    "title": course.title,
                    "status": course.status,
                },
                "assignment": {
                    "id": assignment.id,
                    "title": assignment.title,
                    "module": {
                        "id": module.id,
                        "title": module.title,
                        "position": module.position,
                    }
                    if module
                    else None,
                    "total_points": assignment.total_points,
                    "due_at": assignment.due_at,
                },
                "teacher": {
                    "id": teacher.id,
                    "full_name": teacher.full_name,
                    "email": teacher.email,
                    "profile_image_url": teacher.profile_image_url,
                }
                if teacher
                else None,
                "grade": {
                    "id": grade.id,
                    "score": grade.score,
                    "total_points": grade.total_points,
                    "feedback": grade.feedback,
                    "graded_at": grade.graded_at,
                    "percentage": round((grade.score / grade.total_points) * 100, 1) if grade.total_points else None,
                }
                if grade
                else None,
            }
        )
    return response


@app.get("/admin/announcements", response_model=list[AnnouncementResponse])
def admin_list_announcements(
    audience: Literal["all", "platform", "course"] = "all",
    urgent: Literal["all", "urgent", "normal"] = "all",
    course_id: int | None = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Announcement, User, Course)
        .join(User, Announcement.author_id == User.id)
        .outerjoin(Course, Announcement.course_id == Course.id)
    )
    if audience != "all":
        query = query.filter(Announcement.audience == audience)
    if course_id is not None:
        query = query.filter(Announcement.course_id == course_id)
    if urgent == "urgent":
        query = query.filter(Announcement.is_urgent == True)  # noqa: E712
    elif urgent == "normal":
        query = query.filter(Announcement.is_urgent == False)  # noqa: E712

    rows = query.order_by(Announcement.is_urgent.desc(), Announcement.created_at.desc()).all()
    return [announcement_to_response(announcement, author, course) for announcement, author, course in rows]


@app.post("/admin/announcements", response_model=AnnouncementResponse)
def admin_create_announcement(
    data: AnnouncementCreateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    title = data.title.strip()
    body = data.body.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Announcement title is required")
    if not body:
        raise HTTPException(status_code=400, detail="Announcement message is required")

    course = None
    course_id = None
    if data.audience == "course":
        if data.course_id is None:
            raise HTTPException(status_code=400, detail="Select a course for course-specific announcements")
        course = db.query(Course).filter(Course.id == data.course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        course_id = course.id
    elif data.course_id is not None:
        raise HTTPException(status_code=400, detail="Platform announcements should not include a course")

    announcement = Announcement(
        author_id=admin.id,
        course_id=course_id,
        title=title,
        body=body,
        attachment_url=data.attachment_url.strip() if data.attachment_url else None,
        attachment_name=data.attachment_name.strip() if data.attachment_name else None,
        audience=data.audience,
        is_urgent=data.is_urgent,
    )
    db.add(announcement)
    db.flush()
    create_audit_log(
        db,
        admin,
        "announcement.created",
        "announcement",
        announcement.id,
        f"Posted {'urgent ' if announcement.is_urgent else ''}{announcement.audience} announcement {announcement.title}",
        {"course_id": course_id, "audience": announcement.audience, "is_urgent": announcement.is_urgent},
    )
    db.commit()
    db.refresh(announcement)
    return announcement_to_response(announcement, admin, course)


@app.post("/admin/announcements/upload", response_model=MaterialUploadResponse)
async def admin_upload_announcement_attachment(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    upload = await upload_lms_file(file, "announcement-attachment", f"announcements/admin/{admin.id}", "announcements")
    create_audit_log(
        db,
        admin,
        "announcement.attachment_uploaded",
        "announcement",
        None,
        f"Uploaded announcement attachment {upload['file_name']}",
        {"file_path": upload["file_path"], "file_name": upload["file_name"], "size": upload["size"], "content_type": upload["content_type"]},
    )
    db.commit()
    return upload


@app.delete("/admin/announcements/{announcement_id}")
def admin_delete_announcement(
    announcement_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    title = announcement.title
    db.query(AnnouncementRead).filter(AnnouncementRead.announcement_id == announcement.id).delete(synchronize_session=False)
    db.delete(announcement)
    create_audit_log(
        db,
        admin,
        "announcement.deleted",
        "announcement",
        announcement_id,
        f"Deleted announcement {title}",
        {"title": title},
    )
    db.commit()
    return {"message": "Announcement deleted", "announcement_id": announcement_id}


@app.get("/admin/support-tickets", response_model=list[SupportTicketResponse])
def admin_list_support_tickets(
    status: Literal["all", "open", "in_progress", "closed"] = "all",
    category: Literal["all", "student_question", "teacher_issue", "technical_problem", "enrollment_confirmation"] = "all",
    search: str = "",
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = (
        db.query(SupportTicket, User)
        .outerjoin(User, SupportTicket.user_id == User.id)
    )
    if status != "all":
        query = query.filter(SupportTicket.status == status)
    if category != "all":
        query = query.filter(SupportTicket.category == category)

    normalized_search = search.strip().lower()
    if normalized_search:
        search_pattern = f"%{normalized_search}%"
        query = query.filter(
            (func.lower(SupportTicket.name).like(search_pattern))
            | (func.lower(SupportTicket.email).like(search_pattern))
            | (func.lower(SupportTicket.subject).like(search_pattern))
            | (func.lower(SupportTicket.message).like(search_pattern))
        )

    rows = query.order_by(SupportTicket.created_at.desc()).all()
    return [support_ticket_to_response(ticket, user) for ticket, user in rows]


@app.patch("/admin/support-tickets/{ticket_id}/status", response_model=SupportTicketResponse)
def admin_update_support_ticket_status(
    ticket_id: int,
    data: SupportTicketStatusRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    row = (
        db.query(SupportTicket, User)
        .outerjoin(User, SupportTicket.user_id == User.id)
        .filter(SupportTicket.id == ticket_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Support ticket not found")

    ticket, user = row
    before_status = ticket.status
    ticket.status = data.status
    create_audit_log(
        db,
        admin,
        "support.status_updated",
        "support_ticket",
        ticket.id,
        f"Updated support ticket {ticket.subject} from {before_status} to {ticket.status}",
        {"before_status": before_status, "after_status": ticket.status, "category": ticket.category},
    )
    db.commit()
    db.refresh(ticket)
    return support_ticket_to_response(ticket, user)


@app.get("/admin/settings", response_model=PlatformSettingsResponse)
def admin_get_settings(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    settings, updated_at = get_platform_settings(db)
    return {**settings, "updated_at": updated_at}


@app.patch("/admin/settings", response_model=PlatformSettingsResponse)
def admin_update_settings(
    data: PlatformSettingsRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    before, _ = get_platform_settings(db)
    updated_at = save_platform_settings(db, data)
    after, _ = get_platform_settings(db)
    create_audit_log(
        db,
        admin,
        "settings.updated",
        "settings",
        None,
        "Updated platform settings",
        {"before": before, "after": after},
    )
    db.commit()
    return {**after, "updated_at": updated_at}


def teacher_to_response(teacher: User, courses: list[Course]) -> dict:
    return {
        "id": teacher.id,
        "full_name": teacher.full_name,
        "email": teacher.email,
        "phone": teacher.phone,
        "profile_image_url": teacher.profile_image_url,
        "is_active": teacher.is_active,
        "email_verified": teacher.email_verified,
        "created_at": teacher.created_at,
        "assigned_courses": [
            {
                "id": course.id,
                "title": course.title,
                "status": course.status,
            }
            for course in courses
        ],
    }


def student_to_admin_response(
    student: User,
    enrollments: list[tuple[Enrollment, Course]],
    requests: list[tuple[EnrollmentRequest, Course]],
) -> dict:
    return {
        "id": student.id,
        "display_id": learner_display_id(student),
        "full_name": student.full_name,
        "email": student.email,
        "phone": student.phone,
        "profile_image_url": student.profile_image_url,
        "is_active": student.is_active,
        "lifecycle_status": student.lifecycle_status or "active_student",
        "alumni_cohort_id": student.alumni_cohort_id,
        "email_verified": student.email_verified,
        "created_at": student.created_at,
        "enrolled_courses": [
            {
                "enrollment_id": enrollment.id,
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "status": enrollment.status,
                "cohort_id": enrollment.cohort_id,
                "approved_at": enrollment.approved_at,
            }
            for enrollment, course in enrollments
            if enrollment.status == "approved"
        ],
        "enrollment_requests": [
            {
                "id": request_row.id,
                "course_id": course.id,
                "course_title": course.title,
                "status": request_row.status,
                "cohort_id": request_row.cohort_id,
                "prerequisites": request_row.prerequisites,
                "experience_level": request_row.experience_level,
                "learning_goal": request_row.learning_goal,
                "created_at": request_row.created_at,
            }
            for request_row, course in requests
        ],
    }


@app.get("/admin/audit-logs", response_model=list[AuditLogResponse])
def admin_list_audit_logs(
    limit: int = 50,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    safe_limit = min(max(limit, 1), 200)
    rows = (
        db.query(AuditLog, User)
        .outerjoin(User, AuditLog.actor_id == User.id)
        .order_by(AuditLog.created_at.desc())
        .limit(safe_limit)
        .all()
    )
    return [audit_log_to_response(audit_log, actor) for audit_log, actor in rows]


def admin_course_to_response(
    course: Course,
    teacher: User | None,
    enrollments: list[tuple[Enrollment, User]],
) -> dict:
    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "status": course.status,
        "teacher": {
            "id": teacher.id,
            "full_name": teacher.full_name,
            "email": teacher.email,
            "profile_image_url": teacher.profile_image_url,
        }
        if teacher
        else None,
        "enrolled_students": [
            {
                "id": student.id,
                "full_name": student.full_name,
                "email": student.email,
                "phone": student.phone,
                "profile_image_url": student.profile_image_url,
                "enrollment_id": enrollment.id,
                "approved_at": enrollment.approved_at,
            }
            for enrollment, student in enrollments
            if enrollment.status == "approved"
        ],
        "created_at": course.created_at,
    }


def material_to_response(material: CourseMaterial) -> dict:
    return {
        "id": material.id,
        "course_id": material.course_id,
        "module_id": material.module_id,
        "title": material.title,
        "description": material.description,
        "material_type": material.material_type,
        "file_url": material.file_url,
        "external_url": material.external_url,
        "is_visible": material.is_visible,
        "estimated_minutes": material.estimated_minutes,
        "created_at": material.created_at,
    }


def assignment_to_content_response(assignment: Assignment, db: Session | None = None) -> dict:
    payload = {
        "id": assignment.id,
        "course_id": assignment.course_id,
        "module_id": assignment.module_id,
        "title": assignment.title,
        "instructions": assignment.instructions,
        "attachment_url": assignment.attachment_url,
        "attachment_name": assignment.attachment_name,
        "total_points": assignment.total_points,
        "estimated_minutes": assignment.estimated_minutes,
        "due_at": assignment.due_at,
        "is_open": assignment.is_open,
        "created_at": assignment.created_at,
    }
    if db is not None:
        active_cohort = get_active_cohort(db, create_if_missing=False)
        expected_query = db.query(func.count(func.distinct(Enrollment.student_id))).filter(
            Enrollment.course_id == assignment.course_id,
            Enrollment.status == "approved",
        )
        if active_cohort:
            expected_query = expected_query.filter(Enrollment.cohort_id == active_cohort.id)
        expected_count = expected_query.scalar() or 0

        submitted_query = (
            db.query(func.count(func.distinct(Submission.student_id)))
            .join(
                Enrollment,
                (Enrollment.student_id == Submission.student_id)
                & (Enrollment.course_id == assignment.course_id)
                & (Enrollment.status == "approved"),
            )
            .filter(Submission.assignment_id == assignment.id)
        )
        late_query = submitted_query.filter(Submission.status == "late")
        if active_cohort:
            submitted_query = submitted_query.filter(Enrollment.cohort_id == active_cohort.id)
            late_query = late_query.filter(Enrollment.cohort_id == active_cohort.id)

        submitted_count = submitted_query.scalar() or 0
        late_count = late_query.scalar() or 0
        payload["submitted_count"] = submitted_count
        payload["expected_count"] = expected_count
        payload["pending_count"] = max(expected_count - submitted_count, 0)
        payload["late_count"] = late_count
    return payload


def announcement_to_response(announcement: Announcement, author: User, course: Course | None = None, read_at: int | None = None) -> dict:
    return {
        "id": announcement.id,
        "title": announcement.title,
        "body": announcement.body,
        "attachment_url": announcement.attachment_url,
        "attachment_name": announcement.attachment_name,
        "audience": announcement.audience,
        "is_urgent": announcement.is_urgent,
        "created_at": announcement.created_at,
        "is_read": read_at is not None,
        "read_at": read_at,
        "author": {
            "id": author.id,
            "full_name": author.full_name,
            "email": author.email,
            "role": author.role,
            "profile_image_url": author.profile_image_url,
        },
        "course": {
            "id": course.id,
            "title": course.title,
            "status": course.status,
        }
        if course
        else None,
    }


def certificate_to_response(certificate: Certificate, student: User, course: Course) -> dict:
    return {
        "id": certificate.id,
        "file_url": certificate.file_url,
        "file_name": certificate.file_name,
        "created_at": certificate.created_at,
        "student": {
            "id": student.id,
            "full_name": student.full_name,
            "email": student.email,
            "profile_image_url": student.profile_image_url,
        },
        "course": {
            "id": course.id,
            "title": course.title,
            "status": course.status,
        },
    }


def support_ticket_to_response(ticket: SupportTicket, user: User | None = None) -> dict:
    return {
        "id": ticket.id,
        "name": ticket.name,
        "email": ticket.email,
        "category": ticket.category,
        "subject": ticket.subject,
        "message": ticket.message,
        "attachment_url": ticket.attachment_url,
        "status": ticket.status,
        "created_at": ticket.created_at,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "profile_image_url": user.profile_image_url,
        }
        if user
        else None,
    }


DEFAULT_PLATFORM_SETTINGS = {
    "platform_profile": {
        "platform_name": "Three13 IT Solutions LMS",
        "contact_email": "INFO@THREE13ITSOLUTIONS.COM",
        "contact_phone": "732-470-2431",
        "support_email": "INFO@THREE13ITSOLUTIONS.COM",
    },
    "enrollment_rules": {
        "manual_payment_note": "Admin confirms payment manually before approving course access.",
        "default_enrollment_status": "pending",
        "allow_rejected_reapply": True,
        "instructions": "Submit registration, complete manual payment confirmation, then wait for admin approval.",
    },
    "security": {
        "mfa_required": False,
        "session_timeout_hours": 8,
        "password_min_length": 9,
        "google_sign_in_enabled": True,
    },
    "platform_preferences": {
        "language": "english_us",
        "date_format": "month_day_year",
        "time_format": "12h",
    },
    "course_categories": ["Network", "Security", "IT Audit", "AI"],
    "notifications": {
        "enrollment_decisions": False,
        "assignment_posted": False,
        "grade_posted": False,
        "urgent_announcements": False,
    },
}


def get_platform_settings(db: Session) -> tuple[dict, int | None]:
    settings = json.loads(json.dumps(DEFAULT_PLATFORM_SETTINGS))
    rows = db.query(PlatformSetting).all()
    updated_at = None
    for row in rows:
        settings[row.key] = row.value
        updated_at = max(updated_at or 0, row.updated_at)
    return settings, updated_at


def save_platform_settings(db: Session, data: PlatformSettingsRequest) -> int:
    payload = {
        "platform_profile": data.platform_profile,
        "enrollment_rules": data.enrollment_rules,
        "security": data.security,
        "platform_preferences": data.platform_preferences or DEFAULT_PLATFORM_SETTINGS["platform_preferences"],
        "course_categories": [category.strip() for category in data.course_categories if category.strip()],
        "notifications": data.notifications,
    }
    updated_at = now_ts()
    for key, value in payload.items():
        row = db.query(PlatformSetting).filter(PlatformSetting.key == key).first()
        if row:
            row.value = value
            row.updated_at = updated_at
        else:
            db.add(PlatformSetting(key=key, value=value, updated_at=updated_at))
    return updated_at


def admin_course_content_to_response(db: Session, course: Course) -> dict:
    modules = (
        db.query(Module)
        .filter(Module.course_id == course.id)
        .order_by(Module.position.asc(), Module.created_at.asc())
        .all()
    )
    materials = (
        db.query(CourseMaterial)
        .filter(CourseMaterial.course_id == course.id)
        .order_by(CourseMaterial.created_at.desc())
        .all()
    )
    assignments = (
        db.query(Assignment)
        .filter(Assignment.course_id == course.id)
        .order_by(Assignment.due_at.asc().nullslast(), Assignment.created_at.desc())
        .all()
    )

    materials_by_module = {module.id: [] for module in modules}
    assignments_by_module = {module.id: [] for module in modules}
    unassigned_materials = []
    unassigned_assignments = []

    for material in materials:
        material_response = material_to_response(material)
        if material.module_id in materials_by_module:
            materials_by_module[material.module_id].append(material_response)
        else:
            unassigned_materials.append(material_response)

    for assignment in assignments:
        assignment_response = assignment_to_content_response(assignment, db)
        if assignment.module_id in assignments_by_module:
            assignments_by_module[assignment.module_id].append(assignment_response)
        else:
            unassigned_assignments.append(assignment_response)

    return {
        "course": {
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "status": course.status,
        },
        "modules": [
            {
                "id": module.id,
                "course_id": module.course_id,
                "title": module.title,
                "description": module.description,
                "position": module.position,
                "is_visible": module.is_visible,
                "created_at": module.created_at,
                "materials": materials_by_module.get(module.id, []),
                "assignments": assignments_by_module.get(module.id, []),
            }
            for module in modules
        ],
        "unassigned_materials": unassigned_materials,
        "unassigned_assignments": unassigned_assignments,
    }


def validate_course_module(db: Session, course_id: int, module_id: int | None) -> Module | None:
    if module_id is None:
        return None
    module = db.query(Module).filter(Module.id == module_id, Module.course_id == course_id).first()
    if not module:
        raise HTTPException(status_code=400, detail="Module does not belong to this course")
    return module


def teacher_course_or_404(db: Session, teacher: User, course_id: int) -> Course:
    course = db.query(Course).filter(Course.id == course_id, Course.teacher_id == teacher.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Assigned course not found")
    return course


def safe_upload_filename(filename: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", filename.strip()).strip("-._")
    return cleaned or "course-material"


async def upload_lms_file(
    file: UploadFile,
    fallback_name: str,
    storage_prefix: str,
    error_context: str,
) -> dict:
    original_name = safe_upload_filename(file.filename or fallback_name)
    extension = "." + original_name.rsplit(".", 1)[-1].lower() if "." in original_name else ""
    if extension not in ALLOWED_MATERIAL_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"This file type is not allowed for {error_context}")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File is empty")
    if len(content) > MAX_MATERIAL_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File must be 25 MB or smaller")

    prefix = storage_prefix.strip("/")
    file_path = f"{prefix}/{now_ts()}-{uuid.uuid4().hex[:10]}-{original_name}"
    file_url = upload_to_supabase_storage(file_path, content, file.content_type)
    return {
        "file_url": file_url,
        "file_path": file_path,
        "file_name": original_name,
        "content_type": file.content_type,
        "size": len(content),
    }


def read_supabase_error(error: HTTPError) -> str:
    try:
        body = error.read().decode("utf-8", errors="replace")
        parsed = json.loads(body) if body else {}
        return parsed.get("message") or parsed.get("error") or body or error.reason
    except Exception:
        return error.reason


def supabase_storage_request(
    url: str,
    method: str,
    data: bytes | None = None,
    content_type: str = "application/json",
) -> tuple[int, str]:
    request = UrlRequest(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": content_type,
        },
    )
    with urlopen(request, timeout=30) as response:
        body = response.read().decode("utf-8", errors="replace")
        return response.status, body


def ensure_supabase_storage_bucket() -> None:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=500, detail="Supabase Storage is not configured")

    bucket_url = f"{SUPABASE_URL}/storage/v1/bucket"
    payload = json.dumps(
        {
            "id": SUPABASE_STORAGE_BUCKET,
            "name": SUPABASE_STORAGE_BUCKET,
            "public": True,
            "file_size_limit": MAX_MATERIAL_UPLOAD_BYTES,
        }
    ).encode("utf-8")
    try:
        supabase_storage_request(bucket_url, "POST", payload)
    except HTTPError as exc:
        detail = read_supabase_error(exc)
        if exc.code == 409 or "already exists" in detail.lower():
            return
        if exc.code == 404:
            raise HTTPException(
                status_code=502,
                detail="Supabase Storage bucket could not be created. Check SUPABASE_URL and the project Storage setup.",
            ) from exc
        raise HTTPException(status_code=502, detail=f"Unable to prepare Supabase Storage bucket: {detail}") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Unable to prepare Supabase Storage bucket: {exc}") from exc


def upload_to_supabase_storage(file_path: str, content: bytes, content_type: str | None) -> str:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=500, detail="Supabase Storage is not configured")

    upload_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_STORAGE_BUCKET}/{file_path}"
    for attempt in range(2):
        request = UrlRequest(
            upload_url,
            data=content,
            method="POST",
            headers={
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Content-Type": content_type or "application/octet-stream",
                "x-upsert": "true",
            },
        )
        try:
            with urlopen(request, timeout=30) as response:
                if response.status >= 400:
                    raise HTTPException(status_code=502, detail="Unable to upload file to storage")
                break
        except HTTPError as exc:
            detail = read_supabase_error(exc)
            if (exc.code == 404 or "bucket not found" in detail.lower()) and attempt == 0:
                ensure_supabase_storage_bucket()
                continue
            if exc.code == 404 or "bucket not found" in detail.lower():
                raise HTTPException(
                    status_code=502,
                    detail=f"Supabase Storage bucket '{SUPABASE_STORAGE_BUCKET}' was not found. Create it in Supabase Storage or set SUPABASE_STORAGE_BUCKET to the existing bucket name.",
                ) from exc
            raise HTTPException(status_code=502, detail=f"Unable to upload file to storage: {detail}") from exc
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Unable to upload file to storage: {exc}") from exc

    return f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_STORAGE_BUCKET}/{file_path}"


def validate_course_teacher(db: Session, teacher_id: int | None) -> User | None:
    if teacher_id is None:
        return None
    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    if not teacher.is_active:
        raise HTTPException(status_code=400, detail="Teacher must be active before assignment")
    return teacher


@app.get("/admin/courses", response_model=list[AdminCourseResponse])
def admin_list_courses(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    courses = db.query(Course).order_by(Course.created_at.desc()).all()
    course_ids = [course.id for course in courses]
    teacher_ids = [course.teacher_id for course in courses if course.teacher_id]
    teachers = (
        db.query(User).filter(User.id.in_(teacher_ids)).all()
        if teacher_ids
        else []
    )
    teachers_by_id = {teacher.id: teacher for teacher in teachers}
    enrollment_rows = (
        db.query(Enrollment, User)
        .join(User, Enrollment.student_id == User.id)
        .filter(Enrollment.course_id.in_(course_ids))
        .order_by(User.full_name.asc())
        .all()
        if course_ids
        else []
    )
    enrollments_by_course = {course.id: [] for course in courses}
    for enrollment, student in enrollment_rows:
        enrollments_by_course.setdefault(enrollment.course_id, []).append((enrollment, student))

    return [
        admin_course_to_response(
            course,
            teachers_by_id.get(course.teacher_id),
            enrollments_by_course.get(course.id, []),
        )
        for course in courses
    ]


@app.post("/admin/courses", response_model=AdminCourseResponse)
def admin_create_course(
    data: CourseCreateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    title = data.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Course title is required")
    existing_course = db.query(Course).filter(func.lower(Course.title) == title.lower()).first()
    if existing_course:
        raise HTTPException(status_code=409, detail="A course with this title already exists")

    teacher = validate_course_teacher(db, data.teacher_id)
    course = Course(
        title=title,
        description=data.description.strip() if data.description else None,
        status=data.status,
        teacher_id=teacher.id if teacher else None,
    )
    db.add(course)
    db.flush()
    create_audit_log(
        db,
        admin,
        "course.created",
        "course",
        course.id,
        f"Created course {course.title}",
        {"status": course.status, "teacher_id": course.teacher_id},
    )
    db.commit()
    db.refresh(course)
    return admin_course_to_response(course, teacher, [])


@app.patch("/admin/courses/{course_id}", response_model=AdminCourseResponse)
def admin_update_course(
    course_id: int,
    data: CourseUpdateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    before = {
        "title": course.title,
        "description": course.description,
        "status": course.status,
        "teacher_id": course.teacher_id,
    }

    if data.title is not None:
        title = data.title.strip()
        if not title:
            raise HTTPException(status_code=400, detail="Course title is required")
        duplicate = (
            db.query(Course)
            .filter(func.lower(Course.title) == title.lower(), Course.id != course.id)
            .first()
        )
        if duplicate:
            raise HTTPException(status_code=409, detail="A course with this title already exists")
        course.title = title
    if data.description is not None:
        course.description = data.description.strip() if data.description else None
    if data.status is not None:
        course.status = data.status
    if "teacher_id" in data.__fields_set__:
        teacher = validate_course_teacher(db, data.teacher_id)
        course.teacher_id = teacher.id if teacher else None
    else:
        teacher = db.get(User, course.teacher_id) if course.teacher_id else None

    after = {
        "title": course.title,
        "description": course.description,
        "status": course.status,
        "teacher_id": course.teacher_id,
    }
    create_audit_log(
        db,
        admin,
        "course.updated",
        "course",
        course.id,
        f"Updated course {course.title}",
        {"before": before, "after": after},
    )
    db.commit()
    db.refresh(course)
    enrollments = (
        db.query(Enrollment, User)
        .join(User, Enrollment.student_id == User.id)
        .filter(Enrollment.course_id == course.id)
        .order_by(User.full_name.asc())
        .all()
    )
    return admin_course_to_response(course, teacher, enrollments)


@app.delete("/admin/courses/{course_id}", response_model=AdminCourseResponse)
def admin_archive_course(
    course_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    before_status = course.status
    course.status = "archived"
    create_audit_log(
        db,
        admin,
        "course.archived",
        "course",
        course.id,
        f"Archived course {course.title}",
        {"before_status": before_status, "after_status": "archived"},
    )
    db.commit()
    db.refresh(course)
    teacher = db.get(User, course.teacher_id) if course.teacher_id else None
    enrollments = (
        db.query(Enrollment, User)
        .join(User, Enrollment.student_id == User.id)
        .filter(Enrollment.course_id == course.id)
        .order_by(User.full_name.asc())
        .all()
    )
    return admin_course_to_response(course, teacher, enrollments)


@app.delete("/admin/courses/{course_id}/permanent")
def admin_delete_course_permanently(
    course_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    dependency_counts = {
        "enrollments": db.query(Enrollment).filter(Enrollment.course_id == course.id).count(),
        "enrollment_requests": db.query(EnrollmentRequest).filter(EnrollmentRequest.course_id == course.id).count(),
        "modules": db.query(Module).filter(Module.course_id == course.id).count(),
        "materials": db.query(CourseMaterial).filter(CourseMaterial.course_id == course.id).count(),
        "assignments": db.query(Assignment).filter(Assignment.course_id == course.id).count(),
        "announcements": db.query(Announcement).filter(Announcement.course_id == course.id).count(),
    }
    blocking_dependencies = {key: value for key, value in dependency_counts.items() if value > 0}
    if blocking_dependencies:
        raise HTTPException(
            status_code=400,
            detail=f"This course has related LMS records and cannot be permanently deleted. Archive it instead. Related records: {blocking_dependencies}",
        )

    course_title = course.title
    db.delete(course)
    create_audit_log(
        db,
        admin,
        "course.deleted",
        "course",
        course_id,
        f"Permanently deleted course {course_title}",
        {"title": course_title},
    )
    db.commit()
    return {"message": "Course permanently deleted", "course_id": course_id}


@app.get("/admin/courses/{course_id}/content", response_model=CourseContentResponse)
def admin_get_course_content(
    course_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return admin_course_content_to_response(db, course)


@app.post("/admin/courses/{course_id}/modules", response_model=CourseContentResponse)
def admin_create_module(
    course_id: int,
    data: ModuleCreateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    title = data.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Module title is required")

    module = Module(
        course_id=course.id,
        title=title,
        description=data.description.strip() if data.description else None,
        position=data.position,
        is_visible=data.is_visible,
    )
    db.add(module)
    db.flush()
    create_audit_log(
        db,
        admin,
        "module.created",
        "module",
        module.id,
        f"Created module {module.title} for {course.title}",
        {"course_id": course.id, "position": module.position},
    )
    db.commit()
    return admin_course_content_to_response(db, course)


@app.patch("/admin/modules/{module_id}", response_model=CourseContentResponse)
def admin_update_module(
    module_id: int,
    data: ModuleUpdateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    course = db.get(Course, module.course_id)
    before = {
        "title": module.title,
        "description": module.description,
        "position": module.position,
        "is_visible": module.is_visible,
    }

    if data.title is not None:
        title = data.title.strip()
        if not title:
            raise HTTPException(status_code=400, detail="Module title is required")
        module.title = title
    if data.description is not None:
        module.description = data.description.strip() if data.description else None
    if data.position is not None:
        module.position = data.position
    if data.is_visible is not None:
        module.is_visible = data.is_visible

    create_audit_log(
        db,
        admin,
        "module.updated",
        "module",
        module.id,
        f"Updated module {module.title}",
        {
            "course_id": module.course_id,
            "before": before,
            "after": {
                "title": module.title,
                "description": module.description,
                "position": module.position,
                "is_visible": module.is_visible,
            },
        },
    )
    db.commit()
    return admin_course_content_to_response(db, course)


@app.delete("/admin/modules/{module_id}", response_model=CourseContentResponse)
def admin_delete_module(
    module_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    course = db.get(Course, module.course_id)
    material_ids = [
        row[0]
        for row in db.query(CourseMaterial.id).filter(CourseMaterial.module_id == module.id).all()
    ]
    assignment_ids = [
        row[0]
        for row in db.query(Assignment.id).filter(Assignment.module_id == module.id).all()
    ]
    submission_ids = []
    if assignment_ids:
        submission_ids = [
            row[0]
            for row in db.query(Submission.id).filter(Submission.assignment_id.in_(assignment_ids)).all()
        ]

    if material_ids:
        db.query(MaterialProgress).filter(MaterialProgress.material_id.in_(material_ids)).delete(synchronize_session=False)
        db.query(CourseMaterial).filter(CourseMaterial.id.in_(material_ids)).delete(synchronize_session=False)
    if submission_ids:
        db.query(Grade).filter(Grade.submission_id.in_(submission_ids)).delete(synchronize_session=False)
        db.query(Submission).filter(Submission.id.in_(submission_ids)).delete(synchronize_session=False)
    if assignment_ids:
        db.query(Assignment).filter(Assignment.id.in_(assignment_ids)).delete(synchronize_session=False)

    module_title = module.title
    db.delete(module)
    create_audit_log(
        db,
        admin,
        "module.deleted",
        "module",
        module_id,
        f"Deleted module {module_title}",
        {
            "course_id": course.id if course else None,
            "materials_deleted": len(material_ids),
            "assignments_deleted": len(assignment_ids),
            "submissions_deleted": len(submission_ids),
        },
    )
    db.commit()
    return admin_course_content_to_response(db, course)


@app.post("/admin/courses/{course_id}/materials", response_model=CourseContentResponse)
def admin_create_material(
    course_id: int,
    data: MaterialCreateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    title = data.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Material title is required")
    if not data.file_url and not data.external_url:
        raise HTTPException(status_code=400, detail="Add a file URL or external link")
    validate_course_module(db, course.id, data.module_id)

    material = CourseMaterial(
        course_id=course.id,
        module_id=data.module_id,
        title=title,
        description=data.description.strip() if data.description else None,
        material_type=data.material_type.strip() or "external_link",
        file_url=data.file_url.strip() if data.file_url else None,
        external_url=data.external_url.strip() if data.external_url else None,
        is_visible=data.is_visible,
        estimated_minutes=max(data.estimated_minutes, 1),
    )
    db.add(material)
    db.flush()
    create_audit_log(
        db,
        admin,
        "material.created",
        "course_material",
        material.id,
        f"Added material {material.title} to {course.title}",
        {"course_id": course.id, "module_id": material.module_id, "material_type": material.material_type},
    )
    db.commit()
    return admin_course_content_to_response(db, course)


@app.post("/admin/courses/{course_id}/materials/upload", response_model=MaterialUploadResponse)
async def admin_upload_material_file(
    course_id: int,
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    original_name = safe_upload_filename(file.filename or "course-material")
    extension = "." + original_name.rsplit(".", 1)[-1].lower() if "." in original_name else ""
    if extension not in ALLOWED_MATERIAL_EXTENSIONS:
        raise HTTPException(status_code=400, detail="This file type is not allowed for course materials")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File is empty")
    if len(content) > MAX_MATERIAL_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File must be 25 MB or smaller")

    file_path = f"courses/{course.id}/{now_ts()}-{uuid.uuid4().hex[:10]}-{original_name}"
    file_url = upload_to_supabase_storage(file_path, content, file.content_type)
    create_audit_log(
        db,
        admin,
        "material.file_uploaded",
        "course",
        course.id,
        f"Uploaded file {original_name} for {course.title}",
        {"file_path": file_path, "file_name": original_name, "size": len(content), "content_type": file.content_type},
    )
    db.commit()
    return {
        "file_url": file_url,
        "file_path": file_path,
        "file_name": original_name,
        "content_type": file.content_type,
        "size": len(content),
    }


@app.patch("/admin/materials/{material_id}", response_model=CourseContentResponse)
def admin_update_material(
    material_id: int,
    data: MaterialUpdateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    material = db.query(CourseMaterial).filter(CourseMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    course = db.get(Course, material.course_id)
    before = material_to_response(material)

    if "module_id" in data.__fields_set__:
        validate_course_module(db, material.course_id, data.module_id)
        material.module_id = data.module_id
    if data.title is not None:
        title = data.title.strip()
        if not title:
            raise HTTPException(status_code=400, detail="Material title is required")
        material.title = title
    if data.description is not None:
        material.description = data.description.strip() if data.description else None
    if data.material_type is not None:
        material.material_type = data.material_type.strip() or "external_link"
    if data.file_url is not None:
        material.file_url = data.file_url.strip() if data.file_url else None
    if data.external_url is not None:
        material.external_url = data.external_url.strip() if data.external_url else None
    if data.is_visible is not None:
        material.is_visible = data.is_visible
    if not material.file_url and not material.external_url:
        raise HTTPException(status_code=400, detail="Add a file URL or external link")

    create_audit_log(
        db,
        admin,
        "material.updated",
        "course_material",
        material.id,
        f"Updated material {material.title}",
        {"before": before, "after": material_to_response(material)},
    )
    db.commit()
    return admin_course_content_to_response(db, course)


@app.delete("/admin/materials/{material_id}", response_model=CourseContentResponse)
def admin_delete_material(
    material_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    material = db.query(CourseMaterial).filter(CourseMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    course = db.get(Course, material.course_id)
    material_title = material.title
    progress_count = db.query(MaterialProgress).filter(MaterialProgress.material_id == material.id).count()
    if progress_count:
        db.query(MaterialProgress).filter(MaterialProgress.material_id == material.id).delete(synchronize_session=False)
    db.delete(material)
    create_audit_log(
        db,
        admin,
        "material.deleted",
        "course_material",
        material_id,
        f"Deleted material {material_title}",
        {"course_id": course.id if course else None, "progress_records_deleted": progress_count},
    )
    db.commit()
    return admin_course_content_to_response(db, course)


@app.get("/admin/students", response_model=list[StudentAdminResponse])
def admin_list_students(
    search: str = "",
    status: Literal["all", "active", "suspended"] = "all",
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    backfill_unassigned_alumni_cohorts(db)
    query = db.query(User).filter(User.role == "student")
    normalized_search = search.strip().lower()
    if normalized_search:
        search_pattern = f"%{normalized_search}%"
        query = query.filter(
            (func.lower(User.full_name).like(search_pattern))
            | (func.lower(User.email).like(search_pattern))
            | (func.lower(User.phone).like(search_pattern))
        )
    if status == "active":
        query = query.filter(User.is_active == True)  # noqa: E712
    elif status == "suspended":
        query = query.filter(User.is_active == False)  # noqa: E712

    students = query.order_by(User.full_name.asc()).all()
    student_ids = [student.id for student in students]
    enrollment_rows = (
        db.query(Enrollment, Course)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(Enrollment.student_id.in_(student_ids))
        .order_by(Course.title.asc())
        .all()
        if student_ids
        else []
    )
    request_rows = (
        db.query(EnrollmentRequest, Course)
        .join(Course, EnrollmentRequest.course_id == Course.id)
        .filter(EnrollmentRequest.student_id.in_(student_ids))
        .order_by(EnrollmentRequest.created_at.desc())
        .all()
        if student_ids
        else []
    )

    enrollments_by_student = {student.id: [] for student in students}
    requests_by_student = {student.id: [] for student in students}
    for enrollment, course in enrollment_rows:
        enrollments_by_student.setdefault(enrollment.student_id, []).append((enrollment, course))
    for request_row, course in request_rows:
        requests_by_student.setdefault(request_row.student_id, []).append((request_row, course))

    return [
        student_to_admin_response(
            student,
            enrollments_by_student.get(student.id, []),
            requests_by_student.get(student.id, []),
        )
        for student in students
    ]


@app.post("/admin/alumni", response_model=AlumniCreateResponse)
def admin_create_alumni(
    data: AlumniCreateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    full_name = data.full_name.strip()
    email = data.email.strip().lower()
    phone = data.phone.strip() if data.phone else None
    if not full_name:
        raise HTTPException(status_code=400, detail="Full name is required")
    if not email or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise HTTPException(status_code=400, detail="A valid email address is required")

    student = db.query(User).filter(func.lower(User.email) == email).first()
    created = False
    if student and student.role != "student":
        raise HTTPException(status_code=409, detail="This email belongs to a non-student account")
    if student and (student.lifecycle_status or "active_student") != "alumni":
        raise HTTPException(status_code=409, detail="This email already belongs to an active student account")
    alumni_cohort = None
    if data.cohort_id:
        alumni_cohort = db.query(Cohort).filter(Cohort.id == data.cohort_id, Cohort.status == "completed").first()
        if not alumni_cohort:
            raise HTTPException(status_code=400, detail="Choose a valid completed cohort")
    if not alumni_cohort:
        alumni_cohort = (
            db.query(Cohort)
            .filter(Cohort.status == "completed")
            .order_by(Cohort.ends_at.desc().nullslast(), Cohort.created_at.desc())
            .first()
        )
    if not student:
        student = User(
            full_name=full_name,
            email=email,
            phone=phone,
            password_hash=hash_password(secrets.token_urlsafe(24)),
            role="student",
            lifecycle_status="alumni",
            alumni_cohort_id=alumni_cohort.id if alumni_cohort else None,
            is_active=True,
            email_verified=False,
        )
        db.add(student)
        db.flush()
        created = True
    else:
        student.full_name = full_name
        student.phone = phone
        student.lifecycle_status = "alumni"
        student.alumni_cohort_id = student.alumni_cohort_id or (alumni_cohort.id if alumni_cohort else None)
        student.is_active = True

    token = secrets.token_urlsafe(32)
    expires_at = now_ts() + 60 * 60 * 24
    db.add(PasswordResetToken(user_id=student.id, token_hash=hash_reset_token(token), expires_at=expires_at))
    setup_url = f"{FRONTEND_URL.rstrip('/')}/login?reset_token={token}&email={quote(student.email)}"
    email_sent = send_email(
        student.email,
        "Set up your Three13 alumni account",
        (
            f"Hi {student.full_name},\n\n"
            "Your Three13 alumni community account is ready.\n\n"
            f"Open this link to choose your password: {setup_url}\n\n"
            f"Or paste this setup token into the password reset form:\n{token}\n\n"
            "This setup token expires in 24 hours."
        ),
        (
            f"<p>Hi {student.full_name},</p>"
            "<p>Your Three13 alumni community account is ready.</p>"
            f"<p><a href=\"{setup_url}\">Choose your password</a></p>"
            "<p>Or paste this setup token into the password reset form:</p>"
            f"<p><strong>{token}</strong></p>"
            "<p>This setup token expires in 24 hours.</p>"
        ),
    )
    if not email_sent:
        print(f"[alumni setup] Setup token for {student.email}: {token}")

    create_audit_log(
        db,
        admin,
        "alumni.created" if created else "alumni.updated",
        "student",
        student.id,
        f"{'Created' if created else 'Updated'} alumni account for {student.full_name}",
        {"email_sent": email_sent},
    )
    db.commit()
    db.refresh(student)
    return {
        "student": student_to_admin_response(student, [], []),
        "email_sent": email_sent,
        "dev_token": None if email_sent else token,
        "setup_url": None if email_sent else setup_url,
    }


@app.get("/admin/students/{student_id}", response_model=StudentAdminResponse)
def admin_get_student(
    student_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    enrollments = (
        db.query(Enrollment, Course)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(Enrollment.student_id == student.id)
        .order_by(Course.title.asc())
        .all()
    )
    requests = (
        db.query(EnrollmentRequest, Course)
        .join(Course, EnrollmentRequest.course_id == Course.id)
        .filter(EnrollmentRequest.student_id == student.id)
        .order_by(EnrollmentRequest.created_at.desc())
        .all()
    )
    return student_to_admin_response(student, enrollments, requests)


@app.patch("/admin/students/{student_id}/status", response_model=StudentAdminResponse)
def admin_update_student_status(
    student_id: int,
    data: StudentAccountStatusRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    before_status = student.is_active
    before_lifecycle = student.lifecycle_status
    student.is_active = data.is_active
    if data.is_active:
        if (student.lifecycle_status or "active_student") != "alumni":
            student.lifecycle_status = "active_student"
            ensure_student_all_active_course_access(db, student)
    create_audit_log(
        db,
        admin,
        "student.status_updated",
        "student",
        student.id,
        f"{'Activated' if data.is_active else 'Suspended'} student {student.full_name}",
        {"before_is_active": before_status, "after_is_active": data.is_active, "before_lifecycle_status": before_lifecycle, "after_lifecycle_status": student.lifecycle_status},
    )
    db.commit()
    db.refresh(student)
    enrollments = (
        db.query(Enrollment, Course)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(Enrollment.student_id == student.id)
        .order_by(Course.title.asc())
        .all()
    )
    requests = (
        db.query(EnrollmentRequest, Course)
        .join(Course, EnrollmentRequest.course_id == Course.id)
        .filter(EnrollmentRequest.student_id == student.id)
        .order_by(EnrollmentRequest.created_at.desc())
        .all()
    )
    return student_to_admin_response(student, enrollments, requests)


@app.delete("/admin/students/{student_id}")
def admin_delete_pending_student(
    student_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if student.is_active:
        raise HTTPException(status_code=400, detail="Only inactive pending student accounts can be deleted")
    if (student.lifecycle_status or "active_student") == "alumni":
        raise HTTPException(status_code=400, detail="Alumni accounts cannot be deleted from this action")

    has_learning_records = any(
        [
            db.query(Enrollment).filter(Enrollment.student_id == student.id).count(),
            db.query(Submission).filter(Submission.student_id == student.id).count(),
            db.query(Certificate).filter(Certificate.student_id == student.id).count(),
            db.query(MaterialProgress).filter(MaterialProgress.student_id == student.id).count(),
            db.query(AnnouncementRead).filter(AnnouncementRead.student_id == student.id).count(),
            db.query(CommunityPost).filter(CommunityPost.author_id == student.id).count(),
            db.query(CommunityComment).filter(CommunityComment.author_id == student.id).count(),
        ]
    )
    if has_learning_records:
        raise HTTPException(status_code=400, detail="This account already has activity. Suspend it instead of deleting it.")

    student_name = student.full_name
    student_email = student.email
    deleted_requests = db.query(EnrollmentRequest).filter(EnrollmentRequest.student_id == student.id).delete(synchronize_session=False)
    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == student.id).delete(synchronize_session=False)
    db.query(SupportTicket).filter(SupportTicket.user_id == student.id).update({SupportTicket.user_id: None}, synchronize_session=False)
    db.delete(student)
    create_audit_log(
        db,
        admin,
        "student.pending_deleted",
        "student",
        student_id,
        f"Deleted pending student account for {student_name}",
        {"student_email": student_email, "deleted_enrollment_requests": deleted_requests},
    )
    db.commit()
    return {"message": "Pending student account deleted.", "student_id": student_id}


@app.post("/admin/students/{student_id}/assign-course", response_model=StudentAdminResponse)
def admin_assign_student_to_course(
    student_id: int,
    data: StudentCourseAssignmentRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not student.is_active:
        raise HTTPException(status_code=400, detail="Activate this student before assigning courses")
    course = db.query(Course).filter(Course.id == data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    active_cohort = get_active_cohort(db)
    if not active_cohort:
        raise HTTPException(status_code=400, detail="No active cohort is available")
    student.lifecycle_status = "active_student"

    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.student_id == student.id, Enrollment.course_id == course.id, Enrollment.cohort_id == active_cohort.id)
        .first()
    )
    if not enrollment:
        enrollment = Enrollment(student_id=student.id, course_id=course.id, cohort_id=active_cohort.id)
        db.add(enrollment)
    enrollment.status = "approved"
    enrollment.approved_by = admin.id
    enrollment.approved_at = now_ts()

    request_row = (
        db.query(EnrollmentRequest)
        .filter(EnrollmentRequest.student_id == student.id, EnrollmentRequest.course_id == course.id, EnrollmentRequest.cohort_id == active_cohort.id)
        .first()
    )
    if not request_row:
        request_row = EnrollmentRequest(student_id=student.id, course_id=course.id, cohort_id=active_cohort.id)
        db.add(request_row)
    request_row.status = "approved"
    request_row.reviewed_by = admin.id
    request_row.reviewed_at = now_ts()

    create_audit_log(
        db,
        admin,
        "student.course_assigned",
        "student",
        student.id,
        f"Assigned {student.full_name} to {course.title}",
        {"course_id": course.id, "course_title": course.title},
    )
    db.commit()
    db.refresh(student)
    enrollments = (
        db.query(Enrollment, Course)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(Enrollment.student_id == student.id)
        .order_by(Course.title.asc())
        .all()
    )
    requests = (
        db.query(EnrollmentRequest, Course)
        .join(Course, EnrollmentRequest.course_id == Course.id)
        .filter(EnrollmentRequest.student_id == student.id)
        .order_by(EnrollmentRequest.created_at.desc())
        .all()
    )
    return student_to_admin_response(student, enrollments, requests)


@app.post("/admin/students/{student_id}/courses/{course_id}/certificate/upload", response_model=CertificateResponse)
async def admin_upload_student_certificate(
    student_id: int,
    course_id: int,
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.student_id == student.id, Enrollment.course_id == course.id, Enrollment.status == "approved")
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=400, detail="Student is not enrolled in this course")

    upload = await upload_lms_file(file, "certificate", f"certificates/{course.id}/{student.id}", "certificates")
    certificate = (
        db.query(Certificate)
        .filter(Certificate.student_id == student.id, Certificate.course_id == course.id, Certificate.cohort_id == enrollment.cohort_id)
        .first()
    )
    if certificate:
        certificate.file_url = upload["file_url"]
        certificate.file_name = upload["file_name"]
        certificate.issued_by = admin.id
        certificate.created_at = now_ts()
    else:
        certificate = Certificate(
            student_id=student.id,
            course_id=course.id,
            cohort_id=enrollment.cohort_id,
            issued_by=admin.id,
            file_url=upload["file_url"],
            file_name=upload["file_name"],
            created_at=now_ts(),
        )
        db.add(certificate)
    db.flush()
    create_audit_log(
        db,
        admin,
        "certificate.uploaded",
        "certificate",
        certificate.id,
        f"Uploaded certificate for {student.full_name} in {course.title}",
        {"student_id": student.id, "course_id": course.id, "file_path": upload["file_path"], "file_name": upload["file_name"]},
    )
    db.commit()
    db.refresh(certificate)
    return certificate_to_response(certificate, student, course)


@app.get("/admin/students/{student_id}/courses/{course_id}/activity", response_model=StudentCourseActivityResponse)
def admin_get_student_course_activity(
    student_id: int,
    course_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == student.id,
            Enrollment.course_id == course.id,
            Enrollment.status == "approved",
        )
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=404, detail="Student is not approved for this course")

    teacher = db.get(User, course.teacher_id) if course.teacher_id else None
    materials = (
        db.query(CourseMaterial)
        .filter(CourseMaterial.course_id == course.id)
        .order_by(CourseMaterial.created_at.desc())
        .all()
    )
    material_ids = [material.id for material in materials]
    material_progress_rows = (
        db.query(MaterialProgress)
        .filter(
            MaterialProgress.student_id == student.id,
            MaterialProgress.material_id.in_(material_ids),
        )
        .all()
        if material_ids
        else []
    )
    material_progress_by_id = {progress.material_id: progress for progress in material_progress_rows}
    assignments = (
        db.query(Assignment)
        .filter(Assignment.course_id == course.id)
        .order_by(Assignment.due_at.asc().nullslast(), Assignment.created_at.desc())
        .all()
    )
    assignment_ids = [assignment.id for assignment in assignments]
    submissions = (
        db.query(Submission)
        .filter(
            Submission.student_id == student.id,
            Submission.assignment_id.in_(assignment_ids),
        )
        .all()
        if assignment_ids
        else []
    )
    submissions_by_assignment = {submission.assignment_id: submission for submission in submissions}
    grades = (
        db.query(Grade)
        .filter(Grade.submission_id.in_([submission.id for submission in submissions]))
        .all()
        if submissions
        else []
    )
    grades_by_submission = {grade.submission_id: grade for grade in grades}
    announcements = (
        db.query(Announcement, User)
        .join(User, Announcement.author_id == User.id)
        .filter(
            (Announcement.audience == "platform") | (Announcement.course_id == course.id),
        )
        .order_by(Announcement.created_at.desc())
        .limit(10)
        .all()
    )
    announcement_ids = [announcement.id for announcement, _author in announcements]
    announcement_read_rows = (
        db.query(AnnouncementRead)
        .filter(
            AnnouncementRead.student_id == student.id,
            AnnouncementRead.announcement_id.in_(announcement_ids),
        )
        .all()
        if announcement_ids
        else []
    )
    announcement_reads_by_id = {read.announcement_id: read for read in announcement_read_rows}

    return {
        "student": {
            "id": student.id,
            "full_name": student.full_name,
            "email": student.email,
            "phone": student.phone,
            "profile_image_url": student.profile_image_url,
        },
        "course": {
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "status": course.status,
            "teacher": {
                "id": teacher.id,
                "full_name": teacher.full_name,
                "email": teacher.email,
                "profile_image_url": teacher.profile_image_url,
            }
            if teacher
            else None,
        },
        "enrollment": {
            "id": enrollment.id,
            "status": enrollment.status,
            "approved_at": enrollment.approved_at,
            "created_at": enrollment.created_at,
        },
        "materials": [
            {
                "id": material.id,
                "title": material.title,
                "description": material.description,
                "material_type": material.material_type,
                "file_url": material.file_url,
                "external_url": material.external_url,
                "is_visible": material.is_visible,
                "estimated_minutes": material.estimated_minutes,
                "created_at": material.created_at,
                "viewed_at": material_progress_by_id[material.id].viewed_at if material.id in material_progress_by_id else None,
            }
            for material in materials
        ],
        "assignments": [
            {
                "id": assignment.id,
                "title": assignment.title,
                "instructions": assignment.instructions,
                "total_points": assignment.total_points,
                "estimated_minutes": assignment.estimated_minutes,
                "due_at": assignment.due_at,
                "is_open": assignment.is_open,
                "created_at": assignment.created_at,
                "submission": (
                    {
                        "id": submissions_by_assignment[assignment.id].id,
                        "status": submissions_by_assignment[assignment.id].status,
                        "text_response": submissions_by_assignment[assignment.id].text_response,
                        "file_url": submissions_by_assignment[assignment.id].file_url,
                        "submitted_at": submissions_by_assignment[assignment.id].submitted_at,
                    }
                    if assignment.id in submissions_by_assignment
                    else None
                ),
                "grade": (
                    {
                        "id": grades_by_submission[submissions_by_assignment[assignment.id].id].id,
                        "score": grades_by_submission[submissions_by_assignment[assignment.id].id].score,
                        "total_points": grades_by_submission[submissions_by_assignment[assignment.id].id].total_points,
                        "feedback": grades_by_submission[submissions_by_assignment[assignment.id].id].feedback,
                        "graded_at": grades_by_submission[submissions_by_assignment[assignment.id].id].graded_at,
                    }
                    if assignment.id in submissions_by_assignment
                    and submissions_by_assignment[assignment.id].id in grades_by_submission
                    else None
                ),
            }
            for assignment in assignments
        ],
        "announcements": [
            {
                "id": announcement.id,
                "title": announcement.title,
                "body": announcement.body,
                "audience": announcement.audience,
                "author_name": author.full_name,
                "created_at": announcement.created_at,
                "read_at": announcement_reads_by_id[announcement.id].read_at if announcement.id in announcement_reads_by_id else None,
            }
            for announcement, author in announcements
        ],
    }


@app.delete("/admin/students/{student_id}/enrollments/{enrollment_id}", response_model=StudentAdminResponse)
def admin_remove_student_from_course(
    student_id: int,
    enrollment_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.id == enrollment_id,
            Enrollment.student_id == student.id,
            Enrollment.status == "approved",
        )
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=404, detail="Approved enrollment not found")

    enrollment.status = "removed"
    matching_request = (
        db.query(EnrollmentRequest)
        .filter(
            EnrollmentRequest.student_id == student.id,
            EnrollmentRequest.course_id == enrollment.course_id,
        )
        .first()
    )
    if matching_request:
        matching_request.status = "removed"
        matching_request.reviewed_by = admin.id
        matching_request.reviewed_at = now_ts()

    course = db.get(Course, enrollment.course_id)
    create_audit_log(
        db,
        admin,
        "student.course_removed",
        "student",
        student.id,
        f"Removed {student.full_name} from {course.title if course else 'course'}",
        {"course_id": enrollment.course_id, "enrollment_id": enrollment.id},
    )
    db.commit()
    db.refresh(student)
    enrollments = (
        db.query(Enrollment, Course)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(Enrollment.student_id == student.id)
        .order_by(Course.title.asc())
        .all()
    )
    requests = (
        db.query(EnrollmentRequest, Course)
        .join(Course, EnrollmentRequest.course_id == Course.id)
        .filter(EnrollmentRequest.student_id == student.id)
        .order_by(EnrollmentRequest.created_at.desc())
        .all()
    )
    return student_to_admin_response(student, enrollments, requests)


@app.get("/admin/teachers", response_model=list[TeacherResponse])
def admin_list_teachers(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    teachers = db.query(User).filter(User.role == "teacher").order_by(User.full_name.asc()).all()
    teacher_ids = [teacher.id for teacher in teachers]
    assigned_courses = (
        db.query(Course)
        .filter(Course.teacher_id.in_(teacher_ids))
        .order_by(Course.title.asc())
        .all()
        if teacher_ids
        else []
    )
    courses_by_teacher = {teacher.id: [] for teacher in teachers}
    for course in assigned_courses:
        courses_by_teacher.setdefault(course.teacher_id, []).append(course)

    return [teacher_to_response(teacher, courses_by_teacher.get(teacher.id, [])) for teacher in teachers]


@app.post("/admin/teachers", response_model=TeacherResponse)
def admin_create_teacher(
    data: TeacherCreateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if len(data.password) < 9 or len(data.password) > 72:
        raise HTTPException(status_code=400, detail="Password must be at least 9 characters")

    normalized_email = data.email.strip().lower()
    existing_user = db.query(User).filter(func.lower(User.email) == normalized_email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    teacher = User(
        full_name=data.full_name.strip(),
        email=normalized_email,
        phone=data.phone.strip() if data.phone else None,
        password_hash=hash_password(data.password),
        role="teacher",
        is_active=True,
        email_verified=True,
    )
    db.add(teacher)
    db.flush()
    create_audit_log(
        db,
        admin,
        "teacher.created",
        "teacher",
        teacher.id,
        f"Created teacher account for {teacher.full_name}",
        {"email": teacher.email},
    )
    db.commit()
    db.refresh(teacher)
    return teacher_to_response(teacher, [])


@app.patch("/admin/teachers/{teacher_id}/status", response_model=TeacherResponse)
def admin_update_teacher_status(
    teacher_id: int,
    data: TeacherStatusRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    before_status = teacher.is_active
    teacher.is_active = data.is_active
    create_audit_log(
        db,
        admin,
        "teacher.status_updated",
        "teacher",
        teacher.id,
        f"{'Activated' if data.is_active else 'Deactivated'} teacher {teacher.full_name}",
        {"before_is_active": before_status, "after_is_active": data.is_active},
    )
    db.commit()
    db.refresh(teacher)
    courses = db.query(Course).filter(Course.teacher_id == teacher.id).order_by(Course.title.asc()).all()
    return teacher_to_response(teacher, courses)


@app.patch("/admin/teachers/{teacher_id}", response_model=TeacherResponse)
def admin_update_teacher(
    teacher_id: int,
    data: TeacherUpdateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    full_name = data.full_name.strip()
    email = data.email.strip().lower()
    if not full_name:
        raise HTTPException(status_code=400, detail="Full name is required")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    existing_user = db.query(User).filter(func.lower(User.email) == email, User.id != teacher.id).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    before = {"full_name": teacher.full_name, "email": teacher.email, "phone": teacher.phone}
    teacher.full_name = full_name
    teacher.email = email
    teacher.phone = data.phone.strip() if data.phone else None
    create_audit_log(
        db,
        admin,
        "teacher.updated",
        "teacher",
        teacher.id,
        f"Updated teacher account for {teacher.full_name}",
        {"before": before, "after": {"full_name": teacher.full_name, "email": teacher.email, "phone": teacher.phone}},
    )
    db.commit()
    db.refresh(teacher)
    courses = db.query(Course).filter(Course.teacher_id == teacher.id).order_by(Course.title.asc()).all()
    return teacher_to_response(teacher, courses)


@app.post("/admin/teachers/{teacher_id}/assign-course", response_model=TeacherResponse)
def admin_assign_teacher_to_course(
    teacher_id: int,
    data: TeacherCourseAssignmentRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    if not teacher.is_active:
        raise HTTPException(status_code=400, detail="Activate this teacher before assigning courses")

    course = db.query(Course).filter(Course.id == data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    previous_teacher_id = course.teacher_id
    course.teacher_id = teacher.id
    create_audit_log(
        db,
        admin,
        "teacher.course_assigned",
        "course",
        course.id,
        f"Assigned {teacher.full_name} to teach {course.title}",
        {"teacher_id": teacher.id, "previous_teacher_id": previous_teacher_id},
    )
    db.commit()
    db.refresh(teacher)
    courses = db.query(Course).filter(Course.teacher_id == teacher.id).order_by(Course.title.asc()).all()
    return teacher_to_response(teacher, courses)


@app.delete("/admin/teachers/{teacher_id}/courses/{course_id}", response_model=TeacherResponse)
def admin_unassign_teacher_course(
    teacher_id: int,
    course_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    course = db.query(Course).filter(Course.id == course_id, Course.teacher_id == teacher.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Assigned course not found")

    course.teacher_id = None
    create_audit_log(
        db,
        admin,
        "teacher.course_unassigned",
        "course",
        course.id,
        f"Unassigned {teacher.full_name} from {course.title}",
        {"teacher_id": teacher.id},
    )
    db.commit()
    db.refresh(teacher)
    courses = db.query(Course).filter(Course.teacher_id == teacher.id).order_by(Course.title.asc()).all()
    return teacher_to_response(teacher, courses)


@app.post("/admin/enrollment-requests/{request_id}/decision", response_model=EnrollmentRequestResponse)
def admin_decide_enrollment_request(
    request_id: int,
    data: EnrollmentDecisionRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    row = (
        db.query(EnrollmentRequest, User, Course)
        .join(User, EnrollmentRequest.student_id == User.id)
        .join(Course, EnrollmentRequest.course_id == Course.id)
        .filter(EnrollmentRequest.id == request_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Enrollment request not found")

    enrollment_request, student, course = row
    enrollment_request.status = data.status
    enrollment_request.reviewed_by = admin.id
    enrollment_request.reviewed_at = now_ts()

    if data.status == "approved":
        student.is_active = True
        student.lifecycle_status = "active_student"
        if not enrollment_request.cohort_id:
            active_cohort = get_active_cohort(db)
            enrollment_request.cohort_id = active_cohort.id if active_cohort else None
        enrollment = (
            db.query(Enrollment)
            .filter(
                Enrollment.student_id == enrollment_request.student_id,
                Enrollment.course_id == enrollment_request.course_id,
                Enrollment.cohort_id == enrollment_request.cohort_id,
            )
            .first()
        )
        if not enrollment:
            enrollment = Enrollment(
                student_id=enrollment_request.student_id,
                course_id=enrollment_request.course_id,
                cohort_id=enrollment_request.cohort_id,
            )
            db.add(enrollment)
        enrollment.status = "approved"
        enrollment.approved_by = admin.id
        enrollment.approved_at = now_ts()

    create_audit_log(
        db,
        admin,
        f"enrollment_request.{data.status}",
        "enrollment_request",
        enrollment_request.id,
        f"{data.status.title()} enrollment request for {student.full_name} in {course.title}",
        {"student_id": student.id, "course_id": course.id, "status": data.status},
    )
    db.commit()
    db.refresh(enrollment_request)
    return enrollment_request_to_response(enrollment_request, student, course)


@app.get("/auth/google")
def start_google_sign_in(request: Request):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=503,
            detail="Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI on the backend.",
        )

    redirect_uri = GOOGLE_REDIRECT_URI or str(request.url_for("google_sign_in_callback"))
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    }
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}")


@app.get("/auth/google/callback", name="google_sign_in_callback")
def google_sign_in_callback():
    raise HTTPException(
        status_code=501,
        detail="Google sign-in is not enabled.",
    )
