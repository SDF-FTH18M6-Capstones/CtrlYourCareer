from app import create_app
from app.models import db, Skill, Career

app = create_app()

with app.app_context():

    # Add sample skills
    skills_data = [
        {
            "name": "Python",
            "category": "Programming",
            "description": "Programming language used for backend development."
        },
        {
            "name": "JavaScript",
            "category": "Programming",
            "description": "Programming language used for frontend development."
        },
        {
            "name": "React",
            "category": "Frontend",
            "description": "JavaScript library for building user interfaces."
        },
        {
            "name": "SQL",
            "category": "Database",
            "description": "Language used to manage relational databases."
        },
        {
            "name": "Communication",
            "category": "Soft Skills",
            "description": "Ability to communicate ideas effectively."
        }
    ]

    # Add sample careers
    careers_data = [
        {
            "title": "Frontend Developer",
            "category": "Software Development",
            "description": "Builds user interfaces and interactive web applications."
        },
        {
            "title": "Backend Developer",
            "category": "Software Development",
            "description": "Builds server-side applications and APIs."
        },
        {
            "title": "Data Analyst",
            "category": "Data",
            "description": "Analyzes data to support business decisions."
        },
        {
            "title": "UI/UX Designer",
            "category": "Design",
            "description": "Designs useful and user-friendly digital experiences."
        }
    ]

    for item in skills_data:
        existing = Skill.query.filter_by(name=item["name"]).first()

        if not existing:
            db.session.add(Skill(**item))

    for item in careers_data:
        existing = Career.query.filter_by(title=item["title"]).first()

        if not existing:
            db.session.add(Career(**item))

    db.session.commit()

    print("CtrlYourCareer seed data added successfully!")
