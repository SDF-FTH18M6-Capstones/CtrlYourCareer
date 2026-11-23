import os
import sys

sys.path.insert(
    0,
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

from app import create_app
from app.extensions import db
from app.models import Career, Skill, CareerSkill


CAREER_DATA = {
    "Engineering": {
        "Mechanical Engineer": [
            "AutoCAD",
            "SolidWorks",
            "Mechanical Design",
            "Engineering Mathematics",
        ],
        "Civil Engineer": [
            "AutoCAD",
            "Structural Analysis",
            "Construction Management",
            "Engineering Mathematics",
        ],
        "Electrical Engineer": [
            "Circuit Design",
            "MATLAB",
            "Electrical Systems",
            "Engineering Mathematics",
        ],
        "Chemical Engineer": [
            "Process Engineering",
            "Chemical Process Design",
            "MATLAB",
        ],
        "Industrial Engineer": [
            "Process Optimization",
            "Operations Research",
            "Quality Control",
        ],
    },

    "Design": {
        "Graphic Designer": [
            "Adobe Photoshop",
            "Adobe Illustrator",
            "Typography",
            "Visual Design",
        ],
        "Product Designer": [
            "Figma",
            "User Research",
            "Prototyping",
            "Design Thinking",
        ],
        "Motion Graphics Designer": [
            "Adobe After Effects",
            "Animation",
            "Visual Design",
        ],
    },

    "Healthcare": {
        "Registered Nurse": [
            "Patient Care",
            "Clinical Assessment",
            "Medical Terminology",
        ],
        "Pharmacist": [
            "Pharmacology",
            "Medication Management",
            "Patient Counseling",
        ],
        "Medical Laboratory Scientist": [
            "Laboratory Testing",
            "Microbiology",
            "Clinical Analysis",
        ],
        "Public Health Officer": [
            "Epidemiology",
            "Health Education",
            "Public Health Research",
        ],
    },

    "Business & Finance": {
        "Accountant": [
            "Financial Accounting",
            "Bookkeeping",
            "Microsoft Excel",
        ],
        "Financial Analyst": [
            "Financial Modeling",
            "Financial Analysis",
            "Microsoft Excel",
        ],
        "Business Analyst": [
            "Business Analysis",
            "Requirements Gathering",
            "Microsoft Excel",
        ],
    },

    "Marketing": {
        "Digital Marketing Specialist": [
            "SEO",
            "Social Media Marketing",
            "Content Marketing",
        ],
        "Brand Manager": [
            "Brand Strategy",
            "Market Research",
            "Marketing Strategy",
        ],
        "Marketing Analyst": [
            "Market Research",
            "Data Analysis",
            "Microsoft Excel",
        ],
    },

    "Cybersecurity": {
        "Cybersecurity Analyst": [
            "Network Security",
            "Threat Analysis",
            "Incident Response",
        ],
        "Security Engineer": [
            "Network Security",
            "Security Architecture",
            "Python",
        ],
        "Penetration Tester": [
            "Ethical Hacking",
            "Vulnerability Assessment",
            "Network Security",
        ],
    },

    "Data & Analytics": {
        "Data Scientist": [
            "Python",
            "Machine Learning",
            "Statistics",
            "Data Analysis",
        ],
        "Data Engineer": [
            "Python",
            "SQL",
            "Data Pipelines",
            "Database Design",
        ],
        "Business Intelligence Analyst": [
            "SQL",
            "Power BI",
            "Data Visualization",
        ],
    },

    "Education": {
        "Teacher": [
            "Lesson Planning",
            "Classroom Management",
            "Communication",
        ],
        "Curriculum Developer": [
            "Curriculum Design",
            "Instructional Design",
            "Educational Assessment",
        ],
        "Education Consultant": [
            "Educational Research",
            "Communication",
            "Curriculum Design",
        ],
    },

    "Product Management": {
        "Product Manager": [
            "Product Strategy",
            "Roadmapping",
            "User Research",
        ],
        "Product Owner": [
            "Agile Methodologies",
            "Backlog Management",
            "Requirements Gathering",
        ],
    },

    "Software Development": {
        "Mobile App Developer": [
            "Flutter",
            "Dart",
            "Mobile Development",
        ],
        "Full Stack Developer": [
            "Python",
            "JavaScript",
            "React",
            "SQL",
        ],
        "DevOps Engineer": [
            "Docker",
            "CI/CD",
            "Linux",
            "Cloud Computing",
        ],
    },
}


def seed_database():
    app = create_app()

    with app.app_context():

        created_careers = 0
        created_skills = 0
        created_links = 0

        for category, careers in CAREER_DATA.items():

            for title, skill_names in careers.items():

                career = Career.query.filter(
                    db.func.lower(Career.title) == title.lower()
                ).first()

                if career is None:

                    career = Career(
                        title=title,
                        category=category,
                        description=(
                            f"A professional career in "
                            f"{category}, specializing in "
                            f"{title.lower()}."
                        ),
                    )

                    db.session.add(career)
                    db.session.flush()

                    created_careers += 1

                elif not career.category:
                    career.category = category

                for skill_name in skill_names:

                    skill = Skill.query.filter(
                        db.func.lower(Skill.name) == skill_name.lower()
                    ).first()

                    if skill is None:

                        skill = Skill(
                            name=skill_name,
                            category=category,
                            description=(
                                f"A skill used in {category} careers."
                            ),
                        )

                        db.session.add(skill)
                        db.session.flush()

                        created_skills += 1

                    relationship = CareerSkill.query.filter_by(
                        career_id=career.id,
                        skill_id=skill.id,
                    ).first()

                    if relationship is None:

                        relationship = CareerSkill(
                            career_id=career.id,
                            skill_id=skill.id,
                            required_level="intermediate",
                        )

                        db.session.add(relationship)

                        created_links += 1

        db.session.commit()

        print("\n===== SEEDING COMPLETE =====")
        print("New careers:", created_careers)
        print("New skills:", created_skills)
        print("New career-skill links:", created_links)

        print("\n===== DATABASE TOTALS =====")
        print("Careers:", Career.query.count())
        print("Skills:", Skill.query.count())
        print("Career-skill links:", CareerSkill.query.count())


if __name__ == "__main__":
    seed_database()
