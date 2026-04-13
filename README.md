# TaskFlow — Task Management API

A RESTful API for managing projects and tasks with JWT authentication,
built with Node.js, Express, and PostgreSQL.

## Overview

TaskFlow allows users to register, authenticate, create projects,
and manage tasks within those projects. Tasks can be assigned to users,
filtered by status and assignee, and paginated.

### Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Database:** PostgreSQL 16
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **Migration Tool:** dbmate
- **Logging:** Winston (structured JSON logging)
- **Testing:** Jest + Supertest
- **Containerization:** Docker + Docker Compose

## Architecture Decisions

### Layered Architecture

The API follows a layered architecture pattern:


- **Routes:** URL mapping only. No logic.
- **Controllers:** HTTP request/response handling. Thin layer.
- **Validators:** Input validation and sanitization. Returns structured errors.
- **Services:** Business logic and authorization. No HTTP or SQL knowledge.
- **Repositories:** Database queries only. Raw SQL via `pg` library.

**Why this pattern?**
- Clear separation of concerns (each layer has one job)
- Easy to test each layer independently
- Easy to find and fix bugs (know exactly which layer to look at)
- No "god functions" that do everything

### Raw SQL over ORM

Used the `pg` library with hand-written SQL instead of an ORM (Prisma, Sequelize).

**Why?**
- Assignment requires "not auto-migrate or ORM magic"
- Full control over queries and database schema
- Migrations are hand-written SQL files
- No hidden queries or auto-generated code

### Authentication
- JWT tokens with 24-hour expiry
- bcrypt password hashing with cost factor 12
- Same error message for wrong email and wrong password (prevents information leakage)
- JWT secret loaded from environment variable (never hardcoded)

### Authorization

| Action | Who can do it |
|---|---|
| Create project | Any authenticated user |
| View project | Owner or user with tasks assigned in it |
| Update project | Owner only |
| Delete project | Owner only (cascades to tasks) |
| Create task | Any authenticated user |
| Update task | Any authenticated user with access |
| Delete task | Project owner OR task creator |

### Database Design

- PostgreSQL ENUM types for task status and priority (database-level validation)
- Foreign keys with appropriate cascade rules:
  - User → Project: RESTRICT (can't delete user who owns projects)
  - User → Task (assignee): SET NULL (task becomes unassigned)
  - Project → Task: CASCADE (delete project = delete its tasks)
- Indexes on frequently queried columns (owner_id, project_id, assignee_id, composite index on project_id + status)
- Added `created_by` field on tasks (not in original spec but required for delete authorization)

## Running Locally

### Prerequisites

- Docker and Docker Compose installed

### Steps

```bash
git clone https://github.com/your-name/taskflow
cd taskflow
cp .env.example .env
docker compose up
```

App available at http://localhost:3000

## Running Migrations

Migrations run automatically on startup using dbmate. No manual commands required.

## Test Credentials

Seed user credentials so you can log in immediately without registering:

Email:    test@example.com  
Password: password123

## API Reference

Import the Postman collection located at `taskflow/postman/TaskFlow.postman_collection.json` for all endpoints with examples.

## What You'd Do With More Time

With more time, I'd focus on the following improvements:

- **Frontend UI**: Build a React/Vue.js dashboard for better user experience instead of API-only.
- **API Documentation**: Generate OpenAPI/Swagger docs automatically from code.
- **Rate Limiting & Security**: Add rate limiting, input sanitization beyond basic validation, and CORS configuration.
- **Features**: Implement task comments, file attachments, notifications, and advanced filtering/search.

Shortcuts taken: Focused on core functionality and clean architecture, but skipped advanced features like caching, background jobs, and comprehensive error recovery to meet the assignment deadline.