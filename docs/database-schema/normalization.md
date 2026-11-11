
# SkillMap Database Normalization

## Introduction

Normalization is the process of organizing database tables to reduce data duplication and improve data integrity.

The SkillMap database is designed around three main normal forms: First Normal Form (1NF), Second Normal Form (2NF) and Third Normal Form (3NF).

## 1. First Normal Form (1NF)

A table satisfies 1NF when:

- Each column contains atomic (single) values.
- Each record is unique.
- There are no repeating groups or multiple values stored in one column.

### SkillMap example

Incorrect design:

| user_id | full_name | skills |
|---|---|---|
| 1 | John Doe | Python, SQL, HTML |

The skills column contains multiple values.

Correct design:

**users**

| user_id | full_name |
|---|---|
| 1 | John Doe |

**student_skills**

| student_skill_id | user_id | skill_id |
|---|---|---|
| 1 | 1 | 1 |
| 2 | 1 | 2 |
| 3 | 1 | 3 |

Each skill is stored as a separate record.

## 2. Second Normal Form (2NF)

A table satisfies 2NF when:

- It already satisfies 1NF.
- Every non-key attribute depends on the whole candidate key.
- There are no partial dependencies on part of a composite key.

### SkillMap example

Suppose we stored career and skill information together:

| career_id | skill_id | career_name | skill_name | importance_weight |
|---|---|---|---|---|
| 1 | 1 | Software Developer | Python | 5 |
| 1 | 2 | Software Developer | SQL | 4 |

The career name depends only on career_id, and the skill name depends only on skill_id.

These details should be stored in separate tables.

Correct design:

- careers stores career information.
- skills stores skill information.
- career_skills connects careers and skills and stores importance_weight.

This avoids repeating career names and skill names.

## 3. Third Normal Form (3NF)

A table satisfies 3NF when:

- It already satisfies 2NF.
- Non-key attributes depend only on the key.
- There are no transitive dependencies.

### SkillMap example

Suppose a careers table contains:

| career_id | career_name | sector_id | sector_name |
|---|---|---|---|
| 1 | Software Developer | 1 | Technology |
| 2 | Data Analyst | 1 | Technology |

The sector_name depends on sector_id rather than directly on career_id.

This creates a transitive dependency.

Correct design:

**sectors**

| sector_id | sector_name |
|---|---|
| 1 | Technology |

**careers**

| career_id | career_name | sector_id |
|---|---|---|
| 1 | Software Developer | 1 |
| 2 | Data Analyst | 1 |

The sector name is stored once in the sectors table.

## 4. Normalization Summary

| Normal Form | How SkillMap applies it |
|---|---|
| 1NF | Stores individual skills, questions and answers in separate records. |
| 2NF | Separates career, skill and linking information to avoid partial dependencies. |
| 3NF | Separates sectors from careers and avoids storing descriptive information repeatedly. |

## Conclusion

The SkillMap database is designed to follow 1NF, 2NF and 3NF.

This reduces unnecessary duplication, supports consistent updates and makes the database easier to maintain as the platform grows.

The final implementation should be checked against the actual SQLAlchemy models and PostgreSQL constraints.
