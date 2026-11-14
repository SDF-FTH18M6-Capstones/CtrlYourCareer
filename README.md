# CtrlYourCareer

## Career Guidance and Skill Mapping Platform

CtrlYourCareer is a full-stack web application designed to help users explore career opportunities, discover relevant professional skills, and understand the skills associated with different career paths.

The project combines a Python Flask REST API with a React frontend. It is developed collaboratively by a four-member team using Git and GitHub.

## Project Objectives

- Provide a structured collection of professional skills and career paths.
- Allow users to explore available career opportunities.
- Support the creation, retrieval, updating, and deletion of skills and careers.
- Validate API requests and return meaningful error responses.
- Build a user-friendly interface for career exploration.
- Establish a foundation for future personalized career recommendations.

## Technology Stack

| Component             | Technology        |
| --------------------- | ----------------- |
| Backend               | Python, Flask     |
| API Architecture      | RESTful API       |
| Database              | SQLite            |
| ORM                   | SQLAlchemy        |
| Database Migrations   | Flask-Migrate     |
| Data Validation       | Marshmallow       |
| Frontend              | React, JavaScript |
| Frontend Build Tool   | Vite              |
| Backend Testing       | pytest            |
| API Testing           | Postman           |
| Dependency Management | pip, Pipenv, npm  |
| Version Control       | Git and GitHub    |

## Project Structure

```text
CtrlYourCareer/
├── .github/
│   └── pull_request_template.md
│
├── backend/
│   ├── .venv/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── careers.py
│   │   │   ├── health.py
│   │   │   └── skills.py
│   │   ├── __init__.py
│   │   ├── extensions.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── instance/
│   │   └── ctrl_your_career.db
│   ├── migrations/
│   ├── tests/
│   ├── .gitignore
│   ├── config.py
│   ├── Pipfile
│   ├── Pipfile.lock
│   ├── requirements.txt
│   └── run.py
│
├── docs/
│   ├── api-documentation/
│   │   ├── api-documentation.md
│   │   ├── endpoints.md
│   │   └── testing-guide.md
│   └── database-schema/
│       ├── database-design.md
│       ├── ERD.dbml
│       ├── ERD.png
│       ├── normalization.md
│       └── schema-design.sql
│
├── frontend/
│   ├── figma-design/
│   ├── public/
│   ├── src/
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
│
├── postman/
│   └── CtrlYourCareer-Sprint2.json
│
├── pytest.ini
└── README.md
```

**Note:** The SQLite database and Python virtual environment are local development files and should not be committed to Git.

## Backend Architecture

The backend is built using Flask and follows a modular application structure.

| File or Directory               | Purpose                                              |
| ------------------------------- | ---------------------------------------------------- |
| `backend/run.py`                | Flask application entry point                        |
| `backend/config.py`             | Application configuration                            |
| `backend/app/__init__.py`       | Flask application initialization                     |
| `backend/app/extensions.py`     | Shared Flask extensions                              |
| `backend/app/models.py`         | Database models                                      |
| `backend/app/schemas.py`        | Marshmallow schemas for validation and serialization |
| `backend/app/routes/skills.py`  | Skills API endpoints                                 |
| `backend/app/routes/careers.py` | Careers API endpoints                                |
| `backend/app/routes/health.py`  | Health-check endpoint implementation                 |
| `backend/migrations/`           | Database migration files                             |
| `backend/tests/`                | Backend tests                                        |

## Frontend Architecture

The frontend is developed using React and Vite.

The `frontend/src/` directory contains the application source code, while `frontend/public/` stores public assets.

The `frontend/figma-design/` directory contains frontend design resources.

## Sprint 1 — Project Foundation

Sprint 1 focused on establishing the project's technical and collaborative foundation.

The project structure includes:

- Flask backend initialization.
- React and Vite frontend setup.
- Database models and configuration.
- Database schema design and normalization documentation.
- Entity Relationship Diagram (ERD).
- Database migration infrastructure.
- GitHub repository structure and pull request template.

Database design resources are available in [Database Design Documentation](docs/database-schema/database-design.md).

## Sprint 2 — Core APIs and Frontend Foundations

### Sprint Goal

Implement core CRUD functionality for Skills and Careers, validate incoming requests, prepare initial data, and develop foundational frontend components.

### Skills API

The Skills API manages professional skills.

| HTTP Method | Endpoint           | Description              | Success Status |
| ----------- | ------------------ | ------------------------ | -------------- |
| GET         | `/api/skills`      | Retrieve all skills      | 200            |
| GET         | `/api/skills/<id>` | Retrieve a skill by ID   | 200            |
| POST        | `/api/skills`      | Create a new skill       | 201            |
| PUT         | `/api/skills/<id>` | Update an existing skill | 200            |
| DELETE      | `/api/skills/<id>` | Delete a skill           | 200            |

Example request:

**POST `/api/skills`**

```json
{
  "name": "React Development",
  "category": "Frontend Development",
  "description": "Building reusable user interfaces and interactive web applications using React."
}
```

### Careers API

The Careers API manages career information.

| HTTP Method | Endpoint            | Description               | Success Status |
| ----------- | ------------------- | ------------------------- | -------------- |
| GET         | `/api/careers`      | Retrieve all careers      | 200            |
| GET         | `/api/careers/<id>` | Retrieve a career by ID   | 200            |
| POST        | `/api/careers`      | Create a new career       | 201            |
| PUT         | `/api/careers/<id>` | Update an existing career | 200            |
| DELETE      | `/api/careers/<id>` | Delete a career           | 200            |

Example request:

**POST `/api/careers`**

```json
{
  "title": "Full Stack Developer",
  "category": "Software Development",
  "description": "Develops both frontend and backend web applications."
}
```

### Request Validation and Error Handling

The API uses Marshmallow schemas to validate incoming request data.

| HTTP Status     | Description                             |
| --------------- | --------------------------------------- |
| 200 OK          | Request completed successfully          |
| 201 Created     | New resource created successfully       |
| 400 Bad Request | Invalid data or missing required fields |
| 404 Not Found   | Requested resource does not exist       |

Example validation error for a missing skill name:

```json
{
  "errors": {
    "name": ["Missing data for required field."]
  }
}
```

Example not-found response:

```json
{
  "error": "Skill not found"
}
```

## Getting Started

### Prerequisites

Ensure the following tools are installed:

- Python 3
- Node.js and npm
- Git
- Postman (optional)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CtrlYourCareer
```

Replace `<repository-url>` with the team's actual GitHub repository URL.

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python3 -m venv .venv
```

Activate it on Linux, macOS, or WSL:

```bash
source .venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

The repository also includes `Pipfile` and `Pipfile.lock` for projects using Pipenv.

### 3. Start the Flask Backend

From the `backend/` directory, run:

```bash
python run.py
```

The API should be accessible locally at:

`http://127.0.0.1:5000`

This is the base URL used for the documented Postman tests.

### 4. Set Up the Frontend

Open a new terminal from the project root:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in the terminal.

### 5. Database Setup

The backend uses SQLite and includes database migration files under `backend/migrations/`.

For a fresh local setup, the database may need to be initialized or upgraded using the project's configured Flask migration commands.

Check the backend configuration and existing migration setup before running database initialization commands.

Do not commit local SQLite database changes created during development or testing.

## Running Backend Tests

The repository includes a `backend/tests/` directory and a root-level `pytest.ini` configuration file.

From the project root, with the backend virtual environment activated, run:

```bash
python -m pytest
```

Test results depend on the current implementation and environment.

## Manual API Testing with Postman

Sprint 2 API endpoints were manually tested using Postman.

### Import the Postman Collection

1. Open Postman.
2. Select **Import**.
3. Choose `postman/CtrlYourCareer-Sprint2.json`.
4. Start the Flask backend.
5. Open the imported collection.
6. Send the requests and inspect the responses.

### Sprint 2 Manual Test Results

The documented manual testing covered:

- Retrieving all skills and careers.
- Retrieving individual records.
- Creating skills and careers.
- Updating existing records.
- Deleting existing records.
- Missing required fields.
- Invalid data types.
- Requests for nonexistent resources.
- Updates to nonexistent resources.

**All 18 documented manual test cases returned their expected HTTP status codes.**

These are manual Postman test results and should not be interpreted as automated pytest coverage.

Detailed testing procedures are available in the [Testing Guide](docs/api-documentation/testing-guide.md).

## Project Documentation

| Document                                                         | Description                             |
| ---------------------------------------------------------------- | --------------------------------------- |
| [API Documentation](docs/api-documentation/api-documentation.md) | REST API reference and request examples |
| [API Endpoints](docs/api-documentation/endpoints.md)             | Additional endpoint documentation       |
| [Testing Guide](docs/api-documentation/testing-guide.md)         | Postman testing procedures and results  |
| [Database Design](docs/database-schema/database-design.md)       | Database structure and design           |
| [ERD Diagram](docs/database-schema/ERD.png)                      | Visual Entity Relationship Diagram      |
| [Database Normalization](docs/database-schema/normalization.md)  | Database normalization documentation    |
| [SQL Schema](docs/database-schema/schema-design.sql)             | Database schema definitions             |
| [Postman Collection](postman/CtrlYourCareer-Sprint2.json)        | Exported Sprint 2 API requests          |

## Team Collaboration and Git Workflow

CtrlYourCareer is developed collaboratively by four team members.

The team uses Git feature branches and GitHub pull requests to manage contributions.

The general workflow is:

1. Create a feature branch for an assigned task.
2. Implement and test the changes.
3. Commit changes with descriptive messages.
4. Push the feature branch to GitHub.
5. Open a pull request targeting the shared `development` branch.
6. Review and integrate the changes.

A pull request template is available in `.github/pull_request_template.md`.

## Sprint 2 Milestone Checklist

The Sprint 2 milestone covers:

- [x] Skills CRUD API endpoints manually tested.
- [x] Careers CRUD API endpoints manually tested.
- [x] Request validation and error handling manually tested.
- [x] Postman collection exported.
- [x] API documentation prepared.
- [x] Manual API testing guide prepared.
- [ ] Confirm seed data setup and verification.
- [ ] Confirm automated backend test results.
- [ ] Confirm frontend base components and form-state behavior.
- [ ] Confirm integration and team pull request reviews.

The unchecked items require confirmation from the relevant team members before marking the full Sprint 2 milestone complete.

## Future Enhancements

Potential future enhancements include:

- User authentication and account management.
- Personalized skill profiles.
- Career recommendations.
- Skill-gap analysis.
- Career-to-skill mapping.
- Enhanced frontend and backend integration.

## Contributors

Developed collaboratively by the CtrlYourCareer project team.

## License

A project license has not yet been specified.
