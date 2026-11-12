# CtrlYourCareer — Sprint 2 API Testing Guide

## 1. Testing Objective

Verify that the Flask REST API correctly performs CRUD operations, validates incoming data, and returns appropriate HTTP status codes.

**Testing tool:** Postman

**Base URL:** `http://127.0.0.1:5000`

## 2. Recorded Test Results

The following results were observed during manual Postman testing.

| Test Case                 | Method | Endpoint            | Expected | Observed | Result |
| ------------------------- | ------ | ------------------- | -------- | -------- | ------ |
| Retrieve all skills       | GET    | `/api/skills`       | 200      | 200      | PASS   |
| Retrieve existing skill   | GET    | `/api/skills/1`     | 200      | 200      | PASS   |
| Create skill              | POST   | `/api/skills`       | 201      | 201      | PASS   |
| Update skill              | PUT    | `/api/skills/3`     | 200      | 200      | PASS   |
| Delete skill              | DELETE | `/api/skills/3`     | 200      | 200      | PASS   |
| Retrieve all careers      | GET    | `/api/careers`      | 200      | 200      | PASS   |
| Retrieve existing career  | GET    | `/api/careers/1`    | 200      | 200      | PASS   |
| Create career             | POST   | `/api/careers`      | 201      | 201      | PASS   |
| Update career             | PUT    | `/api/careers/2`    | 200      | 200      | PASS   |
| Delete career             | DELETE | `/api/careers/2`    | 200      | 200      | PASS   |
| Skill missing name        | POST   | `/api/skills`       | 400      | 400      | PASS   |
| Career missing title      | POST   | `/api/careers`      | 400      | 400      | PASS   |
| Skill name is numeric     | POST   | `/api/skills`       | 400      | 400      | PASS   |
| Career title is numeric   | POST   | `/api/careers`      | 400      | 400      | PASS   |
| Skill not found           | GET    | `/api/skills/9999`  | 404      | 404      | PASS   |
| Career not found          | GET    | `/api/careers/2278` | 404      | 404      | PASS   |
| Update nonexistent skill  | PUT    | `/api/skills/9999`  | 404      | 404      | PASS   |
| Update nonexistent career | PUT    | `/api/careers/9999` | 404      | 404      | PASS   |

**Total documented test cases: 18**

**Observed passing cases: 18**

These results reflect the manual requests shown in Postman screenshots. They do not represent automated test-suite coverage.

## 3. Testing Procedure

1. Start the Flask development server.
2. Open the CtrlYourCareer API collection in Postman.
3. Select a Skills or Careers API request.
4. Confirm the request method, URL, and JSON body.
5. Click **Send**.
6. Compare the response status and JSON body against the expected result.
7. Record any failures and report them to the backend team.

For POST and PUT requests, use `Body → raw → JSON` and provide valid JSON data.

## 4. Validation Testing

Validation tests confirm that malformed or incomplete requests are rejected.

- Missing required skill name: 400 Bad Request.
- Missing required career title: 400 Bad Request.
- Numeric skill name: 400 Bad Request.
- Numeric career title: 400 Bad Request.

The API returned structured error messages identifying the invalid fields.

## 5. Not-Found Testing

Requests involving nonexistent records returned `404 Not Found`.

This was verified for retrieving and updating nonexistent skills and careers.

## 6. Testing Evidence

The exported Postman collection is stored at:

`postman/CtrlYourCareer-Sprint2.json`

The collection contains requests that can be reviewed and rerun against a running local backend.

## 7. Sprint 2 Testing Summary

The recorded manual tests demonstrate that Skills and Careers CRUD endpoints work for the tested requests, and that the API handles the tested invalid inputs and nonexistent records appropriately.

Remaining milestone verification should include running the backend automated test suite, checking seed data, and confirming that the frontend forms capture state correctly.
