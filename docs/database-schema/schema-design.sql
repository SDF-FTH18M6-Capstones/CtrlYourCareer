-- Planned schema for CtrlYourCareer, written from ERD.mmd.
-- This is the design, not an export from the running app.

CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_profiles (
    profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id),
    institution VARCHAR(255),
    course VARCHAR(255),
    education_level VARCHAR(50),
    graduation_year INTEGER
);

CREATE TABLE sectors (
    sector_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE careers (
    career_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_id INTEGER NOT NULL REFERENCES sectors(sector_id),
    career_name VARCHAR(150) NOT NULL,
    description TEXT,
    education_requirements TEXT
);

CREATE TABLE skills (
    skill_id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    description TEXT
);

CREATE TABLE student_career_interests (
    interest_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    career_id INTEGER NOT NULL REFERENCES careers(career_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_skills (
    student_skill_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    skill_id INTEGER NOT NULL REFERENCES skills(skill_id),
    proficiency_level VARCHAR(50),
    source_type VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE career_skills (
    career_skill_id INTEGER PRIMARY KEY AUTOINCREMENT,
    career_id INTEGER NOT NULL REFERENCES careers(career_id),
    skill_id INTEGER NOT NULL REFERENCES skills(skill_id),
    importance_weight DECIMAL(5,2),
    required_level VARCHAR(50)
);

CREATE TABLE assessments (
    assessment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    assessment_type VARCHAR(50),
    time_limit INTEGER
);

CREATE TABLE assessment_skills (
    assessment_skill_id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id INTEGER NOT NULL REFERENCES assessments(assessment_id),
    skill_id INTEGER NOT NULL REFERENCES skills(skill_id)
);

CREATE TABLE questions (
    question_id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id INTEGER NOT NULL REFERENCES assessments(assessment_id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(50),
    marks DECIMAL(5,2)
);

CREATE TABLE question_options (
    option_id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL REFERENCES questions(question_id),
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE assessment_attempts (
    attempt_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    assessment_id INTEGER NOT NULL REFERENCES assessments(assessment_id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    total_score DECIMAL(6,2),
    status VARCHAR(20)
);

CREATE TABLE assessment_answers (
    answer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id INTEGER NOT NULL REFERENCES assessment_attempts(attempt_id),
    question_id INTEGER NOT NULL REFERENCES questions(question_id),
    selected_option_id INTEGER REFERENCES question_options(option_id),
    answer_text TEXT,
    awarded_marks DECIMAL(5,2)
);

CREATE TABLE learning_resources (
    resource_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    resource_url TEXT,
    resource_type VARCHAR(50)
);

CREATE TABLE resource_skills (
    resource_skill_id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id INTEGER NOT NULL REFERENCES learning_resources(resource_id),
    skill_id INTEGER NOT NULL REFERENCES skills(skill_id)
);

CREATE TABLE learning_progress (
    progress_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    resource_id INTEGER NOT NULL REFERENCES learning_resources(resource_id),
    status VARCHAR(20),
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE career_matches (
    match_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    career_id INTEGER NOT NULL REFERENCES careers(career_id),
    compatibility_score DECIMAL(5,2),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);