import base64
import hmac
import json
import re
import secrets
import time
import uuid
from hashlib import sha256
from typing import Literal
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request as UrlRequest, urlopen

import bcrypt
from fastapi import Depends, FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy import func, inspect, text
from sqlalchemy.orm import Session, aliased
from config import APP_SECRET, GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET, SUPABASE_URL
from database import Base, engine, get_db
from models import Announcement, Assignment, AuditLog, Course, CourseMaterial, Enrollment, EnrollmentRequest, Grade, Module, PlatformSetting, Submission, SupportTicket, User, now_ts
import models  # noqa: F401 - ensures all SQLAlchemy models are registered.

SESSION_TTL_SECONDS = 60 * 60 * 8
MAX_MATERIAL_UPLOAD_BYTES = 25 * 1024 * 1024
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
    ".json",
    ".sql",
}
Role = Literal["admin", "teacher", "student"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: Role
    is_active: bool
    email_verified: bool
    profile_image_url: str | None = None


class CourseResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    status: str


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


class MaterialUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    material_type: str | None = None
    module_id: int | None = None
    file_url: str | None = None
    external_url: str | None = None
    is_visible: bool | None = None


class AssignmentCreateRequest(BaseModel):
    title: str
    instructions: str | None = None
    module_id: int | None = None
    attachment_url: str | None = None
    attachment_name: str | None = None
    total_points: int = 100
    due_at: int | None = None
    is_open: bool = True


class AssignmentUpdateRequest(BaseModel):
    title: str | None = None
    instructions: str | None = None
    module_id: int | None = None
    attachment_url: str | None = None
    attachment_name: str | None = None
    total_points: int | None = None
    due_at: int | None = None
    is_open: bool | None = None


class GradeSubmissionRequest(BaseModel):
    score: int
    total_points: int
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
    audience: Literal["platform", "course"] = "platform"
    course_id: int | None = None
    is_urgent: bool = False


class AnnouncementResponse(BaseModel):
    id: int
    title: str
    body: str
    audience: str
    is_urgent: bool
    created_at: int
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
    course_categories: list[str]
    notifications: dict


class PlatformSettingsResponse(BaseModel):
    platform_profile: dict
    enrollment_rules: dict
    security: dict
    course_categories: list[str]
    notifications: dict
    updated_at: int | None = None


class EnrollmentRegistrationRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    password: str
    course_titles: list[str]
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


class EnrollmentDecisionRequest(BaseModel):
    status: Literal["approved", "rejected"]


class StudentEnrollmentStatusResponse(BaseModel):
    approved: list[dict]
    pending: list[dict]
    rejected: list[dict]


class AdminDashboardSummaryResponse(BaseModel):
    totals: dict
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


class TeacherStatusRequest(BaseModel):
    is_active: bool


class StudentAccountStatusRequest(BaseModel):
    is_active: bool


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
    assigned_courses: list[dict]


class StudentAdminResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str | None = None
    profile_image_url: str | None = None
    is_active: bool
    email_verified: bool
    enrolled_courses: list[dict]
    enrollment_requests: list[dict]


class StudentCourseActivityResponse(BaseModel):
    student: dict
    course: dict
    enrollment: dict
    materials: list[dict]
    assignments: list[dict]
    announcements: list[dict]


class StudentDashboardSummaryResponse(BaseModel):
    approved_courses: list[dict]
    recent_materials: list[dict]
    upcoming_assignments: list[dict]
    recent_grades: list[dict]
    announcements: list[dict]


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

    assignment_columns = {column["name"] for column in inspector.get_columns("assignments")}
    with engine.begin() as connection:
        if "attachment_url" not in assignment_columns:
            connection.execute(text("ALTER TABLE assignments ADD COLUMN attachment_url TEXT"))
        if "attachment_name" not in assignment_columns:
            connection.execute(text("ALTER TABLE assignments ADD COLUMN attachment_name VARCHAR(255)"))

    enrollment_request_columns = {column["name"] for column in inspector.get_columns("enrollment_requests")}
    with engine.begin() as connection:
        if "experience_level" not in enrollment_request_columns:
            connection.execute(text("ALTER TABLE enrollment_requests ADD COLUMN experience_level VARCHAR(80)"))
        if "learning_goal" not in enrollment_request_columns:
            connection.execute(text("ALTER TABLE enrollment_requests ADD COLUMN learning_goal VARCHAR(120)"))

    announcement_columns = {column["name"] for column in inspector.get_columns("announcements")}
    if "is_urgent" not in announcement_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE announcements ADD COLUMN is_urgent BOOLEAN NOT NULL DEFAULT FALSE"))

    support_ticket_columns = {column["name"] for column in inspector.get_columns("support_tickets")}
    if "category" not in support_ticket_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE support_tickets ADD COLUMN category VARCHAR(80) NOT NULL DEFAULT 'student_question'"))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def encode_token(payload: dict) -> str:
    body = {
        **payload,
        "exp": int(time.time()) + SESSION_TTL_SECONDS,
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


def user_to_response(user: User) -> dict:
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "email_verified": user.email_verified,
        "profile_image_url": user.profile_image_url,
    }


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing session token")

    payload = decode_token(authorization.removeprefix("Bearer ").strip())
    user = db.get(User, payload["sub"])
    if not user or not user.is_active:
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
            "full_name": actor.full_name,
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
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been deactivated")

    response_user = user_to_response(user)
    token = encode_token({"sub": user.id, "role": user.role})
    return {"token": token, "user": response_user}


@app.get("/auth/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return user_to_response(current_user)


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
    if not data.course_titles:
        raise HTTPException(status_code=400, detail="Select at least one course")
    if len(data.password) < 9 or len(data.password) > 72:
        raise HTTPException(status_code=400, detail="Password must be at least 9 characters")

    normalized_email = data.email.strip().lower()
    selected_titles = [title.strip() for title in data.course_titles if title.strip()]
    courses = (
        db.query(Course)
        .filter(func.lower(Course.title).in_([title.lower() for title in selected_titles]))
        .all()
    )
    found_titles = {course.title.lower() for course in courses}
    missing_titles = [title for title in selected_titles if title.lower() not in found_titles]
    if missing_titles:
        raise HTTPException(status_code=400, detail=f"Unknown course selection: {', '.join(missing_titles)}")

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
        is_active=True,
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
            )
            .first()
        )
        if not enrollment_request:
            enrollment_request = EnrollmentRequest(student_id=student.id, course_id=course.id)
            db.add(enrollment_request)
            db.flush()

        enrollment_request.status = "pending"
        enrollment_request.prerequisites = data.prerequisites
        enrollment_request.experience_level = data.experience_level
        enrollment_request.learning_goal = data.learning_goal
        request_ids.append(enrollment_request.id)

    db.commit()
    return {
        "message": "Enrollment request submitted. You can now sign in, but course access is pending approval.",
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
    db.commit()
    db.refresh(ticket)
    return support_ticket_to_response(ticket, user)


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
    return (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == student_id,
            Enrollment.course_id == course_id,
            Enrollment.status == "approved",
        )
        .first()
    )


def require_student_course_access(db: Session, student: User, course_id: int) -> Enrollment:
    enrollment = get_student_approved_enrollment(db, student.id, course_id)
    if not enrollment:
        raise HTTPException(status_code=403, detail="Course access is pending approval")
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
            "approved_at": enrollment.approved_at,
            "created_at": enrollment.created_at,
        }
        if enrollment
        else None,
        "created_at": course.created_at,
    }


def assignment_with_student_status(
    assignment: Assignment,
    course: Course,
    module: Module | None,
    submission: Submission | None,
    grade: Grade | None,
) -> dict:
    now = now_ts()
    status = "not_submitted"
    if submission:
        status = "graded" if grade else submission.status
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
        "grade": {
            "id": grade.id,
            "score": grade.score,
            "total_points": grade.total_points,
            "feedback": grade.feedback,
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
    request_rows = (
        db.query(EnrollmentRequest, Course)
        .join(Course, EnrollmentRequest.course_id == Course.id)
        .filter(
            EnrollmentRequest.student_id == student.id,
            EnrollmentRequest.status.in_(["pending", "rejected"]),
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
    course = db.query(Course).filter(Course.id == data.course_id, Course.status == "active").first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if get_student_approved_enrollment(db, student.id, course.id):
        raise HTTPException(status_code=409, detail="You already have access to this course")

    request_row = (
        db.query(EnrollmentRequest)
        .filter(EnrollmentRequest.student_id == student.id, EnrollmentRequest.course_id == course.id)
        .first()
    )
    if request_row and request_row.status == "pending":
        raise HTTPException(status_code=409, detail="This course is already pending approval")
    if request_row:
        request_row.status = "pending"
        request_row.reviewed_by = None
        request_row.reviewed_at = None
    else:
        request_row = EnrollmentRequest(student_id=student.id, course_id=course.id)
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
    TeacherUser = aliased(User)
    approved_rows = (
        db.query(Enrollment, Course, TeacherUser)
        .join(Course, Enrollment.course_id == Course.id)
        .outerjoin(TeacherUser, Course.teacher_id == TeacherUser.id)
        .filter(Enrollment.student_id == student.id, Enrollment.status == "approved")
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
    assignment_rows = (
        db.query(Assignment, Module, Submission, Grade)
        .outerjoin(Module, Assignment.module_id == Module.id)
        .outerjoin(
            Submission,
            (Submission.assignment_id == Assignment.id) & (Submission.student_id == student.id),
        )
        .outerjoin(Grade, Grade.submission_id == Submission.id)
        .filter(Assignment.course_id == course.id, Assignment.is_open == True)  # noqa: E712
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
        target = materials_by_module.get(material.module_id) if material.module_id else None
        if target is not None:
            target.append(material_to_response(material))
        else:
            unassigned_materials.append(material_to_response(material))

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


@app.get("/student/assignments")
def student_list_assignments(
    status: Literal["all", "open", "submitted", "graded", "late"] = "all",
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
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
        .filter(Assignment.course_id.in_(course_ids), Assignment.is_open == True)  # noqa: E712
        .order_by(Assignment.due_at.asc().nullslast(), Assignment.created_at.desc())
        .all()
    )
    assignments = [assignment_with_student_status(assignment, course, module, submission, grade) for assignment, course, module, submission, grade in rows]
    if status == "all":
        return assignments
    if status == "open":
        return [assignment for assignment in assignments if assignment["student_status"] in ["not_submitted", "late"]]
    return [assignment for assignment in assignments if assignment["student_status"] == status]


@app.post("/student/assignments/{assignment_id}/submit")
def student_submit_assignment(
    assignment_id: int,
    data: StudentAssignmentSubmitRequest,
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    row = (
        db.query(Assignment, Course)
        .join(Course, Assignment.course_id == Course.id)
        .filter(Assignment.id == assignment_id, Assignment.is_open == True)  # noqa: E712
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Assignment not found")
    assignment, course = row
    require_student_course_access(db, student, assignment.course_id)
    text_response = (data.text_response or "").strip()
    file_url = (data.file_url or "").strip() or None
    if not text_response and not file_url:
        raise HTTPException(status_code=400, detail="Add a text response or file link before submitting")

    submission = (
        db.query(Submission)
        .filter(Submission.assignment_id == assignment.id, Submission.student_id == student.id)
        .first()
    )
    submitted_at = now_ts()
    due_late = bool(assignment.due_at and submitted_at > assignment.due_at)
    if submission:
        submission.text_response = text_response or submission.text_response
        submission.file_url = file_url
        submission.submitted_at = submitted_at
        submission.status = "late" if due_late else "submitted"
    else:
        submission = Submission(
            assignment_id=assignment.id,
            student_id=student.id,
            text_response=text_response,
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


@app.get("/student/announcements")
def student_list_announcements(
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
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
    return [announcement_to_response(announcement, author, course) for announcement, author, course in rows]


@app.get("/student/dashboard-summary", response_model=StudentDashboardSummaryResponse)
def student_dashboard_summary(
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
):
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
    recent_grade_rows = (
        db.query(Grade, Submission, Assignment, Course)
        .join(Submission, Grade.submission_id == Submission.id)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .filter(
            Submission.student_id == student.id,
            Assignment.course_id.in_(course_ids),
        )
        .order_by(Grade.graded_at.desc())
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
        "recent_grades": [
            {
                "id": grade.id,
                "assignment_title": assignment.title,
                "course_title": course.title,
                "score": grade.score,
                "total_points": grade.total_points,
                "feedback": grade.feedback,
                "graded_at": grade.graded_at,
            }
            for grade, _, assignment, course in recent_grade_rows
        ],
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
            "upcoming_assignments": [],
            "recent_activity": [],
        }

    total_students = (
        db.query(Enrollment.student_id)
        .filter(Enrollment.course_id.in_(course_ids), Enrollment.status == "approved")
        .distinct()
        .count()
    )
    assignment_rows = db.query(Assignment).filter(Assignment.course_id.in_(course_ids)).all()
    assignment_ids = [assignment.id for assignment in assignment_rows]
    submissions = (
        db.query(Submission, Grade, Assignment, Course, User)
        .outerjoin(Grade, Grade.submission_id == Submission.id)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .join(User, Submission.student_id == User.id)
        .filter(Submission.assignment_id.in_(assignment_ids))
        .order_by(Submission.submitted_at.desc())
        .limit(8)
        .all()
        if assignment_ids
        else []
    )
    pending_submissions = len([row for row in submissions if row[1] is None])
    upcoming = (
        db.query(Assignment, Course)
        .join(Course, Assignment.course_id == Course.id)
        .filter(Assignment.course_id.in_(course_ids), Assignment.is_open == True)  # noqa: E712
        .order_by(Assignment.due_at.asc().nullslast(), Assignment.created_at.desc())
        .limit(6)
        .all()
    )
    return {
        "assigned_courses": [
            {"id": course.id, "title": course.title, "description": course.description, "status": course.status}
            for course in courses
        ],
        "total_students": total_students,
        "pending_submissions": pending_submissions,
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
        "recent_activity": [
            {
                "submission_id": submission.id,
                "student_name": student.full_name,
                "assignment_title": assignment.title,
                "course_title": course.title,
                "submitted_at": submission.submitted_at,
                "graded": grade is not None,
            }
            for submission, grade, assignment, course, student in submissions
        ],
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
        response.append({
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "status": course.status,
            "enrolled_students": enrolled_count,
            "modules": module_count,
            "materials": material_count,
            "assignments": assignment_count,
        })
    return response


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
        due_at=data.due_at,
        is_open=data.is_open,
    )
    db.add(assignment)
    db.flush()
    create_audit_log(db, teacher, "teacher.assignment_created", "assignment", assignment.id, f"Teacher created assignment {assignment.title}", {"course_id": course.id})
    db.commit()
    return admin_course_content_to_response(db, course)


@app.get("/teacher/submissions")
def teacher_list_submissions(
    course_id: int | None = None,
    grading: Literal["all", "graded", "ungraded"] = "all",
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Submission, Grade, Assignment, Course, User)
        .outerjoin(Grade, Grade.submission_id == Submission.id)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Course, Assignment.course_id == Course.id)
        .join(User, Submission.student_id == User.id)
        .filter(Course.teacher_id == teacher.id)
    )
    if course_id is not None:
        query = query.filter(Course.id == course_id)
    if grading == "graded":
        query = query.filter(Grade.id.isnot(None))
    elif grading == "ungraded":
        query = query.filter(Grade.id.is_(None))
    rows = query.order_by(Submission.submitted_at.desc()).all()
    return [
        {
            "submission_id": submission.id,
            "submission_status": submission.status,
            "submitted_at": submission.submitted_at,
            "text_response": submission.text_response,
            "file_url": submission.file_url,
            "student": {"id": student.id, "full_name": student.full_name, "email": student.email, "profile_image_url": student.profile_image_url},
            "course": {"id": course.id, "title": course.title},
            "assignment": {"id": assignment.id, "title": assignment.title, "total_points": assignment.total_points, "due_at": assignment.due_at},
            "grade": {"id": grade.id, "score": grade.score, "total_points": grade.total_points, "feedback": grade.feedback, "graded_at": grade.graded_at} if grade else None,
        }
        for submission, grade, assignment, course, student in rows
    ]


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
    if not grade:
        grade = Grade(submission_id=submission.id, graded_by=teacher.id, score=data.score, total_points=data.total_points, feedback=data.feedback.strip() if data.feedback else None)
        db.add(grade)
    else:
        grade.graded_by = teacher.id
        grade.score = data.score
        grade.total_points = data.total_points
        grade.feedback = data.feedback.strip() if data.feedback else None
        grade.graded_at = now_ts()
    submission.status = "graded"
    create_audit_log(db, teacher, "teacher.submission_graded", "submission", submission.id, f"Teacher graded {assignment.title}", {"course_id": course.id, "score": data.score})
    db.commit()
    return {"message": "Submission graded", "submission_id": submission.id}


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
    announcement = Announcement(author_id=teacher.id, course_id=course.id, title=title, body=body, audience="course", is_urgent=data.is_urgent)
    db.add(announcement)
    db.flush()
    create_audit_log(db, teacher, "teacher.announcement_created", "announcement", announcement.id, f"Teacher posted announcement {announcement.title}", {"course_id": course.id})
    db.commit()
    db.refresh(announcement)
    return announcement_to_response(announcement, teacher, course)


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


@app.get("/admin/dashboard-summary", response_model=AdminDashboardSummaryResponse)
def admin_dashboard_summary(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    total_students = db.query(User).filter(User.role == "student").count()
    total_teachers = db.query(User).filter(User.role == "teacher").count()
    total_courses = db.query(Course).count()
    pending_requests = db.query(EnrollmentRequest).filter(EnrollmentRequest.status == "pending").count()

    recent_submission_rows = (
        db.query(Submission, User)
        .join(User, Submission.student_id == User.id)
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

    return {
        "totals": {
            "students": total_students,
            "teachers": total_teachers,
            "courses": total_courses,
            "pending_enrollment_requests": pending_requests,
        },
        "recent_submissions": [
            {
                "id": submission.id,
                "student_name": student.full_name,
                "status": submission.status,
                "submitted_at": submission.submitted_at,
            }
            for submission, student in recent_submission_rows
        ],
        "recent_announcements": [
            {
                "id": announcement.id,
                "title": announcement.title,
                "audience": announcement.audience,
                "author_name": author.full_name,
                "created_at": announcement.created_at,
            }
            for announcement, author in recent_announcement_rows
        ],
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
        "full_name": student.full_name,
        "email": student.email,
        "phone": student.phone,
        "profile_image_url": student.profile_image_url,
        "is_active": student.is_active,
        "email_verified": student.email_verified,
        "enrolled_courses": [
            {
                "enrollment_id": enrollment.id,
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "status": enrollment.status,
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
        "created_at": material.created_at,
    }


def assignment_to_content_response(assignment: Assignment) -> dict:
    return {
        "id": assignment.id,
        "course_id": assignment.course_id,
        "module_id": assignment.module_id,
        "title": assignment.title,
        "instructions": assignment.instructions,
        "attachment_url": assignment.attachment_url,
        "attachment_name": assignment.attachment_name,
        "total_points": assignment.total_points,
        "due_at": assignment.due_at,
        "is_open": assignment.is_open,
        "created_at": assignment.created_at,
    }


def announcement_to_response(announcement: Announcement, author: User, course: Course | None = None) -> dict:
    return {
        "id": announcement.id,
        "title": announcement.title,
        "body": announcement.body,
        "audience": announcement.audience,
        "is_urgent": announcement.is_urgent,
        "created_at": announcement.created_at,
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
        "contact_phone": "732-470-2430",
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
        assignment_response = assignment_to_content_response(assignment)
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
    dependency_counts = {
        "materials": db.query(CourseMaterial).filter(CourseMaterial.module_id == module.id).count(),
        "assignments": db.query(Assignment).filter(Assignment.module_id == module.id).count(),
    }
    blocking_dependencies = {key: value for key, value in dependency_counts.items() if value > 0}
    if blocking_dependencies:
        raise HTTPException(
            status_code=400,
            detail="Move or delete this module's materials and assignments before deleting it.",
        )

    module_title = module.title
    db.delete(module)
    create_audit_log(
        db,
        admin,
        "module.deleted",
        "module",
        module_id,
        f"Deleted module {module_title}",
        {"course_id": course.id if course else None},
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
    db.delete(material)
    create_audit_log(
        db,
        admin,
        "material.deleted",
        "course_material",
        material_id,
        f"Deleted material {material_title}",
        {"course_id": course.id if course else None},
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
    student.is_active = data.is_active
    create_audit_log(
        db,
        admin,
        "student.status_updated",
        "student",
        student.id,
        f"{'Activated' if data.is_active else 'Suspended'} student {student.full_name}",
        {"before_is_active": before_status, "after_is_active": data.is_active},
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

    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.student_id == student.id, Enrollment.course_id == course.id)
        .first()
    )
    if not enrollment:
        enrollment = Enrollment(student_id=student.id, course_id=course.id)
        db.add(enrollment)
    enrollment.status = "approved"
    enrollment.approved_by = admin.id
    enrollment.approved_at = now_ts()

    request_row = (
        db.query(EnrollmentRequest)
        .filter(EnrollmentRequest.student_id == student.id, EnrollmentRequest.course_id == course.id)
        .first()
    )
    if not request_row:
        request_row = EnrollmentRequest(student_id=student.id, course_id=course.id)
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
                "created_at": material.created_at,
            }
            for material in materials
        ],
        "assignments": [
            {
                "id": assignment.id,
                "title": assignment.title,
                "instructions": assignment.instructions,
                "total_points": assignment.total_points,
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
        enrollment = (
            db.query(Enrollment)
            .filter(
                Enrollment.student_id == enrollment_request.student_id,
                Enrollment.course_id == enrollment_request.course_id,
            )
            .first()
        )
        if not enrollment:
            enrollment = Enrollment(
                student_id=enrollment_request.student_id,
                course_id=enrollment_request.course_id,
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
        detail="Google callback received. Add token exchange, student lookup, and session creation here.",
    )
