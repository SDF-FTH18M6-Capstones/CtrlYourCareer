import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app import create_app
from app.extensions import db
from app.models import Skill
from app.journey_models import LearningResource

LEARNING_RESOURCES = {
    "Python": [
        (
            "Official Python Tutorial",
            "Documentation",
            "https://docs.python.org/3/tutorial/",
            "Beginner",
        ),
        (
            "Python Programming - freeCodeCamp",
            "Course",
            "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
            "Beginner",
        ),
    ],

    "JavaScript": [
        (
            "JavaScript Guide - MDN",
            "Documentation",
            "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
            "Beginner",
        ),
    ],

    "React": [
        (
            "Learn React",
            "Documentation",
            "https://react.dev/learn",
            "Beginner",
        ),
    ],

    "SQL": [
        (
            "SQL Tutorial - SQLBolt",
            "Tutorial",
            "https://sqlbolt.com/",
            "Beginner",
        ),
    ],

    "Communication": [
        (
            "Communication Skills - OpenLearn",
            "Course",
            "https://www.open.edu/openlearn/",
            "Beginner",
        ),
    ],

    # ==========================================
    # ENGINEERING
    # ==========================================

    "AutoCAD": [
        (
            "AutoCAD Learning Resources",
            "Tutorial",
            "https://www.autodesk.com/learn",
            "Beginner",
        ),
    ],

    "SolidWorks": [
        (
            "SOLIDWORKS Learning Resources",
            "Tutorial",
            "https://my.solidworks.com/training",
            "Beginner",
        ),
    ],

    "Mechanical Design": [
        (
            "Mechanical Engineering - MIT OpenCourseWare",
            "Course",
            "https://ocw.mit.edu/",
            "Intermediate",
        ),
    ],

    "Engineering Mathematics": [
        (
            "Engineering Mathematics - Khan Academy",
            "Course",
            "https://www.khanacademy.org/math",
            "Beginner",
        ),
    ],

    "Structural Analysis": [
        (
            "Structural Engineering Resources",
            "Course",
            "https://ocw.mit.edu/",
            "Intermediate",
        ),
    ],

    "Construction Management": [
        (
            "Construction Management Learning",
            "Course",
            "https://www.coursera.org/",
            "Beginner",
        ),
    ],

    "Circuit Design": [
        (
            "Circuits and Electronics - MIT",
            "Course",
            "https://ocw.mit.edu/",
            "Intermediate",
        ),
    ],

    "MATLAB": [
        (
            "MATLAB Onramp",
            "Course",
            "https://matlabacademy.mathworks.com/",
            "Beginner",
        ),
    ],

    "Electrical Systems": [
        (
            "Electrical Engineering Resources",
            "Course",
            "https://www.khanacademy.org/",
            "Beginner",
        ),
    ],

    "Process Engineering": [
        (
            "Chemical Engineering - MIT OCW",
            "Course",
            "https://ocw.mit.edu/",
            "Intermediate",
        ),
    ],

    "Chemical Process Design": [
        (
            "Chemical Engineering Learning Resources",
            "Course",
            "https://ocw.mit.edu/",
            "Intermediate",
        ),
    ],

    "Process Optimization": [
        (
            "Optimization - MIT OpenCourseWare",
            "Course",
            "https://ocw.mit.edu/",
            "Intermediate",
        ),
    ],

    "Operations Research": [
        (
            "Operations Research - MIT OCW",
            "Course",
            "https://ocw.mit.edu/",
            "Intermediate",
        ),
    ],

    "Quality Control": [
        (
            "Quality Management Resources",
            "Course",
            "https://asq.org/",
            "Beginner",
        ),
    ],

    # ==========================================
    # DESIGN AND CREATIVITY
    # ==========================================

    "Adobe Photoshop": [
        (
            "Photoshop Tutorials",
            "Tutorial",
            "https://helpx.adobe.com/photoshop/tutorials.html",
            "Beginner",
        ),
    ],

    "Adobe Illustrator": [
        (
            "Illustrator Tutorials",
            "Tutorial",
            "https://helpx.adobe.com/illustrator/tutorials.html",
            "Beginner",
        ),
    ],

    "Typography": [
        (
            "Typography Fundamentals",
            "Tutorial",
            "https://fonts.google.com/knowledge",
            "Beginner",
        ),
    ],

    "Visual Design": [
        (
            "Visual Design Fundamentals",
            "Course",
            "https://www.interaction-design.org/",
            "Beginner",
        ),
    ],

    "Figma": [
        (
            "Figma Learning Resources",
            "Tutorial",
            "https://help.figma.com/",
            "Beginner",
        ),
    ],

    "User Research": [
        (
            "User Research Fundamentals",
            "Course",
            "https://www.nngroup.com/articles/",
            "Beginner",
        ),
    ],

    "Prototyping": [
        (
            "Prototyping with Figma",
            "Tutorial",
            "https://help.figma.com/",
            "Beginner",
        ),
    ],

    "Design Thinking": [
        (
            "Design Thinking Resources",
            "Course",
            "https://designthinking.ideo.com/",
            "Beginner",
        ),
    ],

    "Adobe After Effects": [
        (
            "After Effects Tutorials",
            "Tutorial",
            "https://helpx.adobe.com/after-effects/tutorials.html",
            "Beginner",
        ),
    ],

    "Animation": [
        (
            "Animation Learning Resources",
            "Tutorial",
            "https://www.blender.org/support/tutorials/",
            "Beginner",
        ),
    ],

    # ==========================================
    # HEALTHCARE
    # ==========================================

    "Patient Care": [
        (
            "Patient Care Learning Resources",
            "Course",
            "https://openstax.org/",
            "Beginner",
        ),
    ],

    "Clinical Assessment": [
        (
            "Clinical Skills Resources",
            "Course",
            "https://www.merckmanuals.com/professional",
            "Intermediate",
        ),
    ],

    "Medical Terminology": [
        (
            "Medical Terminology Resources",
            "Course",
            "https://medlineplus.gov/",
            "Beginner",
        ),
    ],

    "Pharmacology": [
        (
            "Pharmacology Learning Resources",
            "Course",
            "https://www.ncbi.nlm.nih.gov/books/",
            "Intermediate",
        ),
    ],

    "Medication Management": [
        (
            "Medication Safety Resources",
            "Documentation",
            "https://www.who.int/",
            "Intermediate",
        ),
    ],

    "Patient Counseling": [
        (
            "Patient Communication Resources",
            "Course",
            "https://www.cdc.gov/",
            "Beginner",
        ),
    ],

    "Laboratory Testing": [
        (
            "Laboratory Testing Resources",
            "Documentation",
            "https://medlineplus.gov/lab-tests/",
            "Beginner",
        ),
    ],

    "Microbiology": [
        (
            "Microbiology - OpenStax",
            "Course",
            "https://openstax.org/",
            "Beginner",
        ),
    ],

    "Clinical Analysis": [
        (
            "Clinical Laboratory Resources",
            "Course",
            "https://www.ncbi.nlm.nih.gov/books/",
            "Intermediate",
        ),
    ],

    "Epidemiology": [
        (
            "CDC Epidemiology Resources",
            "Course",
            "https://www.cdc.gov/",
            "Beginner",
        ),
    ],

    "Health Education": [
        (
            "Health Education Resources",
            "Course",
            "https://www.who.int/",
            "Beginner",
        ),
    ],

    "Public Health Research": [
        (
            "Public Health Research Resources",
            "Course",
            "https://www.cdc.gov/",
            "Intermediate",
        ),
    ],

    # ==========================================
    # BUSINESS AND FINANCE
    # ==========================================

    "Financial Accounting": [
        (
            "Accounting Fundamentals",
            "Course",
            "https://www.accountingcoach.com/",
            "Beginner",
        ),
    ],

    "Bookkeeping": [
        (
            "Bookkeeping Basics",
            "Course",
            "https://www.accountingcoach.com/",
            "Beginner",
        ),
    ],

    "Microsoft Excel": [
        (
            "Excel Learning Resources",
            "Tutorial",
            "https://support.microsoft.com/excel",
            "Beginner",
        ),
    ],

    "Financial Modeling": [
        (
            "Financial Modeling Resources",
            "Course",
            "https://corporatefinanceinstitute.com/",
            "Intermediate",
        ),
    ],

    "Financial Analysis": [
        (
            "Financial Analysis Fundamentals",
            "Course",
            "https://corporatefinanceinstitute.com/",
            "Intermediate",
        ),
    ],

    "Business Analysis": [
        (
            "Business Analysis Resources",
            "Course",
            "https://www.iiba.org/",
            "Beginner",
        ),
    ],

    "Requirements Gathering": [
        (
            "Requirements Engineering Resources",
            "Course",
            "https://www.iiba.org/",
            "Beginner",
        ),
    ],

    # ==========================================
    # MARKETING
    # ==========================================

    "SEO": [
        (
            "Google Search Central SEO Guide",
            "Documentation",
            "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
            "Beginner",
        ),
    ],

    "Social Media Marketing": [
        (
            "Social Media Marketing Resources",
            "Course",
            "https://academy.hubspot.com/",
            "Beginner",
        ),
    ],

    "Content Marketing": [
        (
            "Content Marketing Course",
            "Course",
            "https://academy.hubspot.com/",
            "Beginner",
        ),
    ],

    "Brand Strategy": [
        (
            "Brand Strategy Learning",
            "Course",
            "https://www.coursera.org/",
            "Beginner",
        ),
    ],

    "Market Research": [
        (
            "Market Research Learning Resources",
            "Course",
            "https://www.coursera.org/",
            "Beginner",
        ),
    ],

    "Marketing Strategy": [
        (
            "Marketing Strategy Resources",
            "Course",
            "https://academy.hubspot.com/",
            "Beginner",
        ),
    ],

    # ==========================================
    # DATA AND CYBERSECURITY
    # ==========================================

    "Data Analysis": [
        (
            "Data Analysis with Python",
            "Course",
            "https://www.freecodecamp.org/learn/data-analysis-with-python/",
            "Intermediate",
        ),
    ],

    "Network Security": [
        (
            "Cisco Networking Academy",
            "Course",
            "https://www.netacad.com/",
            "Beginner",
        ),
    ],

    "Threat Analysis": [
        (
            "MITRE ATT&CK",
            "Documentation",
            "https://attack.mitre.org/",
            "Intermediate",
        ),
    ],

    "Incident Response": [
        (
            "Incident Response Resources",
            "Documentation",
            "https://www.cisa.gov/",
            "Intermediate",
        ),
    ],

    "Security Architecture": [
        (
            "Cybersecurity Framework",
            "Documentation",
            "https://www.nist.gov/cyberframework",
            "Intermediate",
        ),
    ],

    "Ethical Hacking": [
        (
            "Web Security Academy",
            "Course",
            "https://portswigger.net/web-security",
            "Intermediate",
        ),
    ],

    "Vulnerability Assessment": [
        (
            "OWASP Testing Guide",
            "Documentation",
            "https://owasp.org/www-project-web-security-testing-guide/",
            "Intermediate",
        ),
    ],

    "Machine Learning": [
        (
            "Machine Learning Crash Course",
            "Course",
            "https://developers.google.com/machine-learning/crash-course",
            "Beginner",
        ),
    ],

    "Statistics": [
        (
            "Statistics and Probability",
            "Course",
            "https://www.khanacademy.org/math/statistics-probability",
            "Beginner",
        ),
    ],

    "Data Pipelines": [
        (
            "Apache Airflow Documentation",
            "Documentation",
            "https://airflow.apache.org/docs/",
            "Intermediate",
        ),
    ],

    "Database Design": [
        (
            "PostgreSQL Documentation",
            "Documentation",
            "https://www.postgresql.org/docs/",
            "Intermediate",
        ),
    ],

    "Power BI": [
        (
            "Microsoft Power BI Learning",
            "Course",
            "https://learn.microsoft.com/training/powerplatform/power-bi/",
            "Beginner",
        ),
    ],

    "Data Visualization": [
        (
            "Data Visualization Learning",
            "Course",
            "https://www.tableau.com/learn",
            "Beginner",
        ),
    ],

    # ==========================================
    # EDUCATION
    # ==========================================

    "Lesson Planning": [
        (
            "Lesson Planning Resources",
            "Course",
            "https://www.edutopia.org/",
            "Beginner",
        ),
    ],

    "Classroom Management": [
        (
            "Classroom Management Resources",
            "Course",
            "https://www.edutopia.org/",
            "Beginner",
        ),
    ],

    "Curriculum Design": [
        (
            "Curriculum Development Resources",
            "Course",
            "https://www.unesco.org/",
            "Intermediate",
        ),
    ],

    "Instructional Design": [
        (
            "Instructional Design Resources",
            "Course",
            "https://www.edx.org/",
            "Beginner",
        ),
    ],

    "Educational Assessment": [
        (
            "Educational Assessment Resources",
            "Course",
            "https://www.edutopia.org/",
            "Intermediate",
        ),
    ],

    "Educational Research": [
        (
            "Education Research Resources",
            "Course",
            "https://ies.ed.gov/",
            "Intermediate",
        ),
    ],

    # ==========================================
    # PRODUCT MANAGEMENT
    # ==========================================

    "Product Strategy": [
        (
            "Product Management Resources",
            "Course",
            "https://www.atlassian.com/agile/product-management",
            "Beginner",
        ),
    ],

    "Roadmapping": [
        (
            "Product Roadmaps",
            "Tutorial",
            "https://www.atlassian.com/agile/product-management/product-roadmaps",
            "Beginner",
        ),
    ],

    "Agile Methodologies": [
        (
            "Scrum Guide",
            "Documentation",
            "https://scrumguides.org/",
            "Beginner",
        ),
    ],

    "Backlog Management": [
        (
            "Product Backlog Management",
            "Tutorial",
            "https://www.atlassian.com/agile/scrum/backlogs",
            "Beginner",
        ),
    ],

    # ==========================================
    # MOBILE DEVELOPMENT
    # ==========================================

    "Flutter": [
        (
            "Flutter Documentation",
            "Documentation",
            "https://docs.flutter.dev/",
            "Beginner",
        ),
    ],

    "Dart": [
        (
            "Dart Language Tour",
            "Documentation",
            "https://dart.dev/language",
            "Beginner",
        ),
    ],

    "Mobile Development": [
        (
            "Android Developers Training",
            "Course",
            "https://developer.android.com/courses",
            "Beginner",
        ),
    ],

    # ==========================================
    # DEVOPS AND CLOUD
    # ==========================================

    "Docker": [
        (
            "Docker Get Started",
            "Documentation",
            "https://docs.docker.com/get-started/",
            "Beginner",
        ),
    ],

    "CI/CD": [
        (
            "GitHub Actions Documentation",
            "Documentation",
            "https://docs.github.com/en/actions",
            "Beginner",
        ),
    ],

    "Linux": [
        (
            "Linux Journey",
            "Tutorial",
            "https://linuxjourney.com/",
            "Beginner",
        ),
    ],

    "Cloud Computing": [
        (
            "AWS Cloud Practitioner Essentials",
            "Course",
            "https://aws.amazon.com/training/",
            "Beginner",
        ),
    ],
}


def seed_learning_resources():
    app = create_app()

    with app.app_context():
        print("\n===== LEARNING RESOURCE SEEDING =====")

        skills = {
            skill.name: skill
            for skill in Skill.query.all()
        }

        added = 0
        skipped = 0
        missing_skills = []

        try:
            for skill_name, resources in LEARNING_RESOURCES.items():
                skill = skills.get(skill_name)

                if skill is None:
                    missing_skills.append(skill_name)
                    continue

                for title, resource_type, url, difficulty in resources:
                    existing = LearningResource.query.filter_by(
                        skill_id=skill.id,
                        url=url,
                    ).first()

                    if existing:
                        skipped += 1
                        continue

                    resource = LearningResource(
                        skill_id=skill.id,
                        title=title,
                        resource_type=resource_type,
                        url=url,
                        difficulty=difficulty,
                    )

                    db.session.add(resource)
                    added += 1

            db.session.commit()

        except Exception:
            db.session.rollback()
            raise

        print(f"\nResources added: {added}")
        print(f"Resources skipped: {skipped}")

        if missing_skills:
            print("\nMissing skills:")
            for name in missing_skills:
                print(f"- {name}")

        print("\n===== DATABASE TOTALS =====")
        print("Skills:", Skill.query.count())
        print(
            "Learning resources:",
            LearningResource.query.count(),
        )

        print("\nLearning resources seeded successfully!")


if __name__ == "__main__":
    seed_learning_resources()
