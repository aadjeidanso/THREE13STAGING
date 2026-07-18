from sqlalchemy import func

from database import Base, SessionLocal, engine
from models import Course
import models  # noqa: F401 - ensures all SQLAlchemy models are registered.

COURSES = [
    {
        "title": "Network Essentials",
        "description": "Build a practical foundation in networking, infrastructure, troubleshooting, and core IT terminology.",
    },
    {
        "title": "Security Essentials",
        "description": "Learn security operations, risk fundamentals, controls, incident response, and exam-ready security practices.",
    },
    {
        "title": "CISA / IT Audit",
        "description": "Prepare for audit, governance, compliance, controls testing, and career paths in assurance.",
    },
    {
        "title": "AI Essentials for IT Professionals",
        "description": "Learn practical AI concepts, prompt workflows, automation opportunities, and responsible AI use for modern IT teams.",
    },
]


def main():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        for course_data in COURSES:
            course = db.query(Course).filter(func.lower(Course.title) == course_data["title"].lower()).first()
            if not course:
                course = Course(title=course_data["title"])
                db.add(course)

            course.description = course_data["description"]
            course.status = "active"

        db.commit()
    finally:
        db.close()

    print(f"Seeded {len(COURSES)} active courses")


if __name__ == "__main__":
    main()
