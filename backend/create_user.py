import argparse

import bcrypt
from sqlalchemy import func

from database import Base, SessionLocal, engine
from models import User, now_ts
import models  # noqa: F401 - ensures all SQLAlchemy models are registered.


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def main():
    parser = argparse.ArgumentParser(description="Create or update a Three13 LMS user.")
    parser.add_argument("--name", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--role", required=True, choices=["admin", "teacher", "student"])
    parser.add_argument("--inactive", action="store_true")
    parser.add_argument("--unverified", action="store_true")
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        email = args.email.lower()
        user = db.query(User).filter(func.lower(User.email) == email).first()
        if not user:
            user = User(email=email, created_at=now_ts())
            db.add(user)

        user.full_name = args.name
        user.password_hash = hash_password(args.password)
        user.role = args.role
        user.is_active = not args.inactive
        user.email_verified = not args.unverified
        db.commit()
    finally:
        db.close()

    print(f"Saved {args.role} account for {args.email.lower()}")


if __name__ == "__main__":
    main()
