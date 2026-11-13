# CtrlYourCareer – Database Seed Data

## 1. Purpose

This document explains how to populate the CtrlYourCareer
database with sample data for development and testing.

Seed data allows developers to test the application's
Skills and Careers features without manually entering records.

## 2. Database Tables

The initial seed script populates:

- skills
- careers

## 3. Sample Skills

| Skill Name | Category | Description |
|---|---|---|
| Python | Programming | Backend programming language |
| JavaScript | Programming | Language used for web development |
| React | Frontend | Library for building user interfaces |
| SQL | Database | Language for managing relational databases |
| Communication | Soft Skills | Ability to communicate effectively |

## 4. Sample Careers

| Career Title | Category | Description |
|---|---|---|
| Frontend Developer | Software Development | Builds user interfaces |
| Backend Developer | Software Development | Develops server-side applications |
| Data Analyst | Data | Analyzes data for decision-making |
| UI/UX Designer | Design | Designs user-friendly digital experiences |

## 5. Running the Seed Script

Make sure you are inside the backend directory.

Run:

```bash
pipenv run python seed.py
```

Expected output:

```text
CtrlYourCareer seed data added successfully!
```

## 6. Verifying Seed Data

Start the Flask application and test the following endpoints:

### Retrieve Skills

GET http://127.0.0.1:5000/api/skills

### Retrieve Careers

GET http://127.0.0.1:5000/api/careers

Expected result:

- A list of sample skills should be returned.
- A list of sample careers should be returned.
- Each record should have a unique ID.

## 7. Important Notes

- The seed script should not create duplicate records.
- Existing database records should not be deleted.
- Seed data is intended for development and testing.
- Never store real user passwords or confidential information in seed data.

## 8. Sprint 2 Completion

The database seed-data task is complete when:

- The seed script executes successfully.
- Sample skills are inserted.
- Sample careers are inserted.
- Duplicate records are prevented.
- The API can retrieve the inserted records.
