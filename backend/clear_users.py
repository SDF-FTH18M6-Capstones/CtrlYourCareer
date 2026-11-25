from app import create_app
from app.extensions import db
from sqlalchemy import MetaData, select, func

app = create_app()

TABLES_TO_CLEAR = [
    "admin_challenges",
    "admin_credentials",
    "journey_steps",
    "career_journeys",
    "user_skills",
    "profiles",
    "users",
]

PROTECTED_TABLES = [
    "alembic_version",
    "careers",
    "skills",
    "career_skills",
    "learning_resources",
]

with app.app_context():
    metadata = MetaData()
    metadata.reflect(bind=db.engine)

    missing = [
        name
        for name in TABLES_TO_CLEAR + PROTECTED_TABLES
        if name not in metadata.tables
    ]

    if missing:
        raise SystemExit(f"Missing tables: {missing}")

    # Check for unexpected foreign-key dependencies.
    for table in metadata.tables.values():
        if table.name in TABLES_TO_CLEAR:
            continue

        for fk in table.foreign_keys:
            if fk.column.table.name in TABLES_TO_CLEAR:
                raise SystemExit(
                    f"Cannot safely delete accounts: "
                    f"{table.name} references {fk.column.table.name}"
                )

    print("\n===== BEFORE DELETION =====")

    for name in TABLES_TO_CLEAR:
        count = db.session.execute(
            select(func.count()).select_from(metadata.tables[name])
        ).scalar_one()

        print(f"{name}: {count}")

    print("\n===== PROTECTED DATA =====")

    before_counts = {}

    for name in PROTECTED_TABLES:
        count = db.session.execute(
            select(func.count()).select_from(metadata.tables[name])
        ).scalar_one()

        before_counts[name] = count
        print(f"{name}: {count}")

    print("\nWARNING: This will delete ALL registered accounts.")
    print("Admin accounts and PIN credentials will also be deleted.")

    confirmation = input(
        "\nType DELETE ALL USERS to confirm: "
    )

    if confirmation != "DELETE ALL USERS":
        raise SystemExit("Cancelled. No records deleted.")

    try:
        for name in TABLES_TO_CLEAR:
            db.session.execute(metadata.tables[name].delete())

        db.session.commit()

    except Exception:
        db.session.rollback()
        raise

    print("\n===== AFTER DELETION =====")

    for name in TABLES_TO_CLEAR:
        count = db.session.execute(
            select(func.count()).select_from(metadata.tables[name])
        ).scalar_one()

        print(f"{name}: {count}")

    print("\n===== VERIFYING PROTECTED DATA =====")

    for name in PROTECTED_TABLES:
        count = db.session.execute(
            select(func.count()).select_from(metadata.tables[name])
        ).scalar_one()

        status = (
            "PRESERVED"
            if count == before_counts[name]
            else "CHANGED"
        )

        print(f"{name}: {count} [{status}]")

    print("\nAccount cleanup completed successfully!")
