# CtrlYourCareer — Sprint 2 API Documentation

## 1. Overview

CtrlYourCareer is a career-guidance and skill-mapping platform designed to help users explore career paths and relevant skills.

During Sprint 2, the team implemented REST API endpoints using Flask to support CRUD operations for skills and careers.

**Base URL:** `http://127.0.0.1:5000`

**Request and response format:** JSON

## 2. Skills API

The Skills API allows clients to retrieve, create, update, and delete skills.

| Method | Endpoint           | Description              | Successful Status |
| ------ | ------------------ | ------------------------ | ----------------- |
| GET    | `/api/skills`      | Retrieve all skills      | 200 OK            |
| GET    | `/api/skills/<id>` | Retrieve a skill by ID   | 200 OK            |
| POST   | `/api/skills`      | Create a new skill       | 201 Created       |
| PUT    | `/api/skills/<id>` | Update an existing skill | 200 OK            |
| DELETE | `/api/skills/<id>` | Delete a skill           | 200 OK            |

### Create a skill

**Request:** `POST /api/skills`

```json
{
  "name": "React Development",
  "category": "Frontend Development",
  "description": "Building reusable user interfaces and interactive web applications using React."
}
```

**Successful response:** `201 Created`

```json
{
  "id": 3,
  "name": "React Development",
  "category": "Frontend Development",
  "description": "Building reusable user interfaces and interactive web applications using React."
}
```

The returned ID depends on the records in the database.

## 3. Careers API

The Careers API allows clients to retrieve, create, update, and delete career records.

| Method | Endpoint            | Description               | Successful Status |
| ------ | ------------------- | ------------------------- | ----------------- |
| GET    | `/api/careers`      | Retrieve all careers      | 200 OK            |
| GET    | `/api/careers/<id>` | Retrieve a career by ID   | 200 OK            |
| POST   | `/api/careers`      | Create a new career       | 201 Created       |
| PUT    | `/api/careers/<id>` | Update an existing career | 200 OK            |
| DELETE | `/api/careers/<id>` | Delete a career           | 200 OK            |

### Create a career

**Request:** `POST /api/careers`

```json
{
  "title": "Full Stack Developer",
  "category": "Software Development",
  "description": "Designs and develops web applications, including frontend interfaces, backend APIs, and database systems."
}
```

**Successful response:** `201 Created`

```json
{
  "id": 2,
  "title": "Full Stack Developer",
  "category": "Software Development",
  "description": "Designs and develops web applications, including frontend interfaces, backend APIs, and database systems."
}
```

## 4. Request Validation

The API validates incoming JSON payloads.

### Missing required field

A skill request without `name` returns `400 Bad Request`.

```json
{
  "errors": {
    "name": ["Missing data for required field."]
  }
}
```

A career request without `title` returns `400 Bad Request` with a corresponding `title` error.

### Invalid field type

Providing a numeric value instead of a string for `name` or `title` returns `400 Bad Request`.

```json
{
  "errors": {
    "name": ["Not a valid string."]
  }
}
```

## 5. Resource Not Found

Requests for nonexistent skills or careers return `404 Not Found`.

Example: `GET /api/skills/9999`

```json
{
  "error": "Skill not found"
}
```

Example: `GET /api/careers/2278`

```json
{
  "error": "Career not found"
}
```

## 6. API Testing

The API endpoints were tested using Postman.

The exported collection is stored at:

`postman/CtrlYourCareer-Sprint2.json`

The collection includes Skills, Careers, and Health API request groups.

See `docs/testing-guide.md` for recorded test results.
