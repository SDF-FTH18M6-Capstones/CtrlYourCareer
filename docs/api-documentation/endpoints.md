# API Endpoints

Base URL: `/api`. Bodies are JSON. Only `/health` is implemented so far; the rest are planned.

## Health
- `GET /health` returns 200 `{"status": "ok"}` when server and database are up.

## Auth and Users
- `POST /api/auth/register` body: `full_name`, `email`, `password`, `role`. Returns 201.
- `POST /api/auth/login` body: `email`, `password`. Returns a token.
- `GET /api/users/me` returns the logged-in user.
- `PUT /api/users/me` updates `full_name`.

## Student Profile
- `GET /api/users/me/profile`
- `PUT /api/users/me/profile` body: `institution`, `course`, `education_level`, `graduation_year`.

## Skills
- `GET /api/skills` lists skills. Filter: `category`.
- `GET /api/skills/{skill_id}`

## Career Interests
- `GET /api/users/me/career-interests`
- `POST /api/users/me/career-interests` body: `career_id`. Returns 201.
- `DELETE /api/users/me/career-interests/{career_id}` returns 204.

## Student Skills
- `GET /api/users/me/skills`
- `POST /api/users/me/skills` body: `skill_id`, `proficiency_level`, `source_type`. Returns 201.
- `PUT /api/users/me/skills/{skill_id}` updates `proficiency_level`.
- `DELETE /api/users/me/skills/{skill_id}` returns 204.

## Careers
- `GET /api/careers` lists careers (`career_name`, `description`, `education_requirements`). Filter: `sector_id`.
- `GET /api/careers/{career_id}` returns the career with its required skills. Each skill includes `importance_weight` and `required_level`.

## Assessments
- `GET /api/assessments` lists assessments (`title`, `description`, `assessment_type`, `time_limit`). Filter: `skill_id`.
- `GET /api/assessments/{assessment_id}` returns the assessment, the skills it measures, and its questions with options. Each question has `question_text`, `question_type` and `marks`. Each option has `option_text`. `is_correct` is never returned to students.
- `POST /api/assessments` creates an assessment (admin only). Returns 201.
- `POST /api/assessments/{assessment_id}/questions` adds a question with its options, each with `is_correct` (admin only). Returns 201.
- `POST /api/assessments/{assessment_id}/attempts` starts an attempt. Sets `started_at` and `status`. Returns 201.
- `POST /api/attempts/{attempt_id}/answers` body: `question_id`, plus `option_id` for multiple choice or `answer_text` for written answers. Returns 201.
- `POST /api/attempts/{attempt_id}/submit` sets `completed_at`, calculates `total_score` from the `marks` of correct answers, and updates `status`.
- `GET /api/attempts/{attempt_id}` returns the attempt with `total_score`, `status` and its answers.
- `GET /api/users/me/attempts` lists the user's attempts.

## Learning Resources
- `GET /api/resources` lists resources. Filters: `resource_type`, `skill_id`.
- `GET /api/resources/{resource_id}` returns one resource with its skills.
- `POST /api/resources` body: `title`, `description`, `resource_url`, `resource_type`. Returns 201.
- `PUT /api/resources/{resource_id}` and `DELETE /api/resources/{resource_id}` (204).
- `POST /api/resources/{resource_id}/skills` body: `skill_id`. Returns 201.
- `DELETE /api/resources/{resource_id}/skills/{skill_id}` returns 204.

## Learning Progress
- `GET /api/users/me/progress`
- `POST /api/users/me/progress` body: `resource_id`, `status`. Sets `started_at`. Returns 201.
- `PATCH /api/progress/{progress_id}` updates `status`; sets `completed_at` when completed.

## Career Matches
- `GET /api/users/me/career-matches` lists matches by `compatibility_score`, highest first.
- `POST /api/users/me/career-matches/generate` recalculates and sets `generated_at`.

## Errors
400 invalid input · 401 not logged in · 403 not allowed · 404 not found · 409 duplicate · 500 server error.
Error body: `{"error": "message"}`.