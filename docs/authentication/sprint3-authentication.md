# CtrlYourCareer Sprint 3 Authentication API

## Overview

The authentication system allows users to register,
log in and access protected backend endpoints using JWT.

## Endpoints

| Method | Endpoint           | Authentication |
| ------ | ------------------ | -------------- |
| POST   | /api/auth/register | Public         |
| POST   | /api/auth/login    | Public         |
| GET    | /api/auth/me       | JWT required   |

## Registration

POST /api/auth/register

Request:

{
"username": "testuser",
"email": "test@example.com",
"password": "Password123"
}

Success: HTTP 201

## Login

POST /api/auth/login

Request:

{
"email": "test@example.com",
"password": "Password123"
}

Success: HTTP 200

Response includes an access_token.

## Current User

GET /api/auth/me

Authorization:
Bearer <access_token>

Success: HTTP 200

Without a valid token: HTTP 401

## Security

- Passwords are hashed using Bcrypt.
- Protected endpoints require JWT authentication.
- JWT secrets are stored in environment variables.
- Password hashes are never returned by the API.
