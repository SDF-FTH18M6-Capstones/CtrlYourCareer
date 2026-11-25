import json
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app import create_app
from app.extensions import db
from app.models import User, Career, Skill, CareerSkill
from app.journey_models import LearningResource


CATALOGUE_PATH = Path(__file__).with_name("career_catalogue.json")

ADDITIONAL_SKILLS = [
    {
        "name": "Flask",
        "category": "Backend Development",
        "description": "Python framework for building web applications and APIs.",
    },
    {
        "name": "HTML",
        "category": "Frontend Development",
        "description": "Markup language for structuring web pages.",
    },
    {
        "name": "CSS",
        "category": "Frontend Development",
        "description": "Stylesheet language for designing web pages.",
    },
    {
        "name": "REST APIs",
        "category": "Backend Development",
        "description": "Designing and consuming RESTful web services.",
    },
    {
        "name": "Git",
        "category": "Tools",
        "description": "Version control system for managing source code.",
    },
    {
        "name": "Kubernetes",
        "category": "DevOps",
        "description": "Container orchestration and deployment management.",
    },
]

ADDITIONAL_CAREERS = [
    {
        "title": "Penetration Tester",
        "category": "Cybersecurity",
        "description": (
            "Conducts authorized security assessments "
            "to identify vulnerabilities in systems."
        ),
    },
]

ADDITIONAL_RELATIONSHIPS = {
    "Frontend Developer": {
        "HTML": "Intermediate",
        "CSS": "Intermediate",
        "Git": "Beginner",
    },
    "Backend Developer": {
        "Flask": "Intermediate",
        "REST APIs": "Intermediate",
        "Git": "Beginner",
    },
    "Full Stack Developer": {
        "HTML": "Intermediate",
        "CSS": "Intermediate",
        "Flask": "Intermediate",
        "REST APIs": "Intermediate",
        "Git": "Intermediate",
    },
    "Data Analyst": {
        "Data Analysis": "Intermediate",
        "Microsoft Excel": "Intermediate",
        "Data Visualization": "Intermediate",
        "Statistics": "Beginner",
    },
    "UI/UX Designer": {
        "Figma": "Intermediate",
        "User Research": "Intermediate",
        "Prototyping": "Intermediate",
        "Design Thinking": "Intermediate",
        "Visual Design": "Intermediate",
    },
    "DevOps Engineer": {
        "Kubernetes": "Intermediate",
        "Git": "Intermediate",
    },
    "Penetration Tester": {
        "Ethical Hacking": "Intermediate",
        "Vulnerability Assessment": "Intermediate",
        "Network Security": "Intermediate",
    },
}

ADDITIONAL_RESOURCES = {
    "Flask": [
        (
            "Official Flask Tutorial",
            "Documentation",
            "https://flask.palletsprojects.com/en/stable/tutorial/",
            "Beginner",
        ),
    ],
    "HTML": [
        (
            "HTML Learning Guide - MDN",
            "Documentation",
            "https://developer.mozilla.org/en-US/docs/Web/HTML",
            "Beginner",
        ),
    ],
    "CSS": [
        (
            "CSS Learning Guide - MDN",
            "Documentation",
            "https://developer.mozilla.org/en-US/docs/Web/CSS",
            "Beginner",
        ),
    ],
    "REST APIs": [
        (
            "REST API Introduction",
            "Tutorial",
            "https://restfulapi.net/",
            "Beginner",
        ),
    ],
    "Git": [
        (
            "Pro Git Book",
            "Documentation",
            "https://git-scm.com/book/en/v2",
            "Beginner",
        ),
    ],
    "Kubernetes": [
        (
            "Official Kubernetes Tutorials",
            "Tutorial",
            "https://kubernetes.io/docs/tutorials/",
            "Beginner",
        ),
    ],
}

def get_or_create_skill(data):
    skill = Skill.query.filter(
        db.func.lower(Skill.name) == data["name"].lower()
    ).first()

    if skill is None:
        skill = Skill(
            name=data["name"],
            category=data.get("category"),
            description=data.get("description"),
        )

        db.session.add(skill)
        db.session.flush()

    return skill


def get_or_create_career(data):
    career = Career.query.filter(
        db.func.lower(Career.title) == data["title"].lower()
    ).first()

    if career is None:
        career = Career(
            title=data["title"],
            description=data.get("description"),
            category=data.get("category"),
            education_level=data.get("education_level"),
            education_requirements=data.get(
                "education_requirements"
            ),
            experience_level=data.get("experience_level"),
        )

        db.session.add(career)
        db.session.flush()

    return career


def get_or_create_relationship(
    career,
    skill,
    required_level,
):
    relationship = CareerSkill.query.filter_by(
        career_id=career.id,
        skill_id=skill.id,
    ).first()

    if relationship is None:
        relationship = CareerSkill(
            career_id=career.id,
            skill_id=skill.id,
            required_level=required_level,
        )

        db.session.add(relationship)
        db.session.flush()

    return relationship


def get_or_create_resource(
    skill,
    title,
    resource_type,
    url,
    difficulty,
):
    resource = LearningResource.query.filter_by(
        skill_id=skill.id,
        url=url,
        title=title,
    ).first()

    if resource is None:
        resource = LearningResource(
            skill_id=skill.id,
            title=title,
            resource_type=resource_type,
            url=url,
            difficulty=difficulty,
        )

        db.session.add(resource)
        db.session.flush()

    return resource

def seed_production():
    app = create_app()

    with app.app_context():

        if not CATALOGUE_PATH.exists():
            raise FileNotFoundError(
                f"Catalogue not found: {CATALOGUE_PATH}"
            )

        with CATALOGUE_PATH.open(
            "r",
            encoding="utf-8",
        ) as file:
            catalogue = json.load(file)

        career_map = {}
        skill_map = {}

        print("\n===== PRODUCTION DATABASE SEEDING =====")
        print("Database driver:", db.engine.dialect.name)

        try:

            print("\nImporting original skills...")

            for item in catalogue["skills"]:
                skill = get_or_create_skill(item)
                skill_map[item["id"]] = skill

            print("Importing original careers...")

            for item in catalogue["careers"]:
                career = get_or_create_career(item)
                career_map[item["id"]] = career

            print("Importing original career-skill links...")

            for item in catalogue["career_skills"]:
                career = career_map[item["career_id"]]
                skill = skill_map[item["skill_id"]]

                get_or_create_relationship(
                    career,
                    skill,
                    item["required_level"],
                )

            print("Importing original learning resources...")

            for item in catalogue["learning_resources"]:
                skill = skill_map[item["skill_id"]]

                get_or_create_resource(
                    skill,
                    item["title"],
                    item["resource_type"],
                    item["url"],
                    item.get("difficulty"),
                )

            print("Adding additional skills...")

            for item in ADDITIONAL_SKILLS:
                get_or_create_skill(item)

            print("Adding additional careers...")

            for item in ADDITIONAL_CAREERS:
                get_or_create_career(item)

            print("Adding additional career-skill links...")

            for career_title, skills in (
                ADDITIONAL_RELATIONSHIPS.items()
            ):
                career = Career.query.filter(
                    db.func.lower(Career.title)
                    == career_title.lower()
                ).first()

                if career is None:
                    raise ValueError(
                        f"Career not found: {career_title}"
                    )

                for skill_name, level in skills.items():
                    skill = Skill.query.filter(
                        db.func.lower(Skill.name)
                        == skill_name.lower()
                    ).first()

                    if skill is None:
                        raise ValueError(
                            f"Skill not found: {skill_name}"
                        )

                    get_or_create_relationship(
                        career,
                        skill,
                        level,
                    )

            print("Adding additional learning resources...")

            for skill_name, resources in (
                ADDITIONAL_RESOURCES.items()
            ):
                skill = Skill.query.filter(
                    db.func.lower(Skill.name)
                    == skill_name.lower()
                ).first()

                if skill is None:
                    raise ValueError(
                        f"Skill not found: {skill_name}"
                    )

                for resource in resources:
                    get_or_create_resource(
                        skill,
                        *resource,
                    )

            missing_resources = (
                Skill.query.outerjoin(
                    LearningResource,
                    Skill.id == LearningResource.skill_id,
                )
                .filter(LearningResource.id.is_(None))
                .all()
            )

            if missing_resources:
                missing_names = ", ".join(
                    skill.name for skill in missing_resources
                )

                raise RuntimeError(
                    f"Skills without resources: {missing_names}"
                )

            db.session.commit()

        except Exception:
            db.session.rollback()
            raise

        print("\n===== SEEDING SUCCESSFUL =====")

        print("Users:", User.query.count())
        print("Careers:", Career.query.count())
        print("Skills:", Skill.query.count())
        print("Career-skill links:", CareerSkill.query.count())
        print(
            "Learning resources:",
            LearningResource.query.count(),
        )
        print(
            "Skills without learning resources:",
            len(missing_resources),
        )

        print("\nProduction catalogue is ready!")


if __name__ == "__main__":
    seed_production()