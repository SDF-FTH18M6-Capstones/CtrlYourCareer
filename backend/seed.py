
from app import create_app
from app.extensions import db
from app.models import Skill, Career, CareerSkill

app = create_app()

with app.app_context():

    skills_data = [
        ("Python", "Programming"),
        ("Flask", "Backend Development"),
        ("SQL", "Database"),
        ("HTML", "Frontend Development"),
        ("CSS", "Frontend Development"),
        ("JavaScript", "Programming"),
        ("React", "Frontend Development"),
        ("REST APIs", "Backend Development"),
        ("Git", "Tools"),
        ("Communication", "Professional Skills")
    ]

    for name, category in skills_data:
        skill = Skill.query.filter_by(name=name).first()

        if not skill:
            db.session.add(
                Skill(
                    name=name,
                    category=category,
                    description=f"{name} skill"
                )
            )

    db.session.commit()

    careers_data = [
        {
            "title": "Backend Developer",
            "description": "Builds server-side applications and APIs.",
            "category": "Software Development",
            "skills": ["Python", "Flask", "SQL", "REST APIs", "Git"]
        },
        {
            "title": "Frontend Developer",
            "description": "Builds user interfaces and web applications.",
            "category": "Software Development",
            "skills": ["HTML", "CSS", "JavaScript", "React", "Git"]
        },
        {
            "title": "Full Stack Developer",
            "description": "Builds both frontend and backend applications.",
            "category": "Software Development",
            "skills": [
                "Python", "Flask", "SQL", "HTML",
                "CSS", "JavaScript", "React", "Git"
            ]
        }
    ]

    for item in careers_data:
        career = Career.query.filter_by(
            title=item["title"]
        ).first()

        if not career:
            career = Career(
                title=item["title"],
                description=item["description"],
                category=item["category"]
            )

            db.session.add(career)
            db.session.flush()

        for skill_name in item["skills"]:
            skill = Skill.query.filter_by(
                name=skill_name
            ).first()

            if skill:
                relationship = CareerSkill.query.filter_by(
                    career_id=career.id,
                    skill_id=skill.id
                ).first()

                if not relationship:
                    db.session.add(
                        CareerSkill(
                            career_id=career.id,
                            skill_id=skill.id,
                            required_level="Beginner"
                        )
                    )

    db.session.commit()

    print("Sprint 4 seed data created successfully.")
