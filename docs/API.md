# PILOT Backend API Documentation

## Overview
RESTful API for PILOT Trainer Development Lifecycle Management Platform.
Base URL: `http://localhost:5000` (development)

---

## Authentication

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Endpoints

#### POST /auth/login
Login with email and password.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "session": { "access_token": "token", "refresh_token": "token" }
}
```

#### POST /auth/forgot-password
Send password reset email.

**Request**:
```json
{
  "email": "user@example.com"
}
```

---

## Users

### GET /users
List all users (Admin/SuperAdmin).

**Query Parameters**:
- `role`: Filter by role (DTD, DT, Admin, SuperAdmin)
- `status`: Filter by status (Active, Promoted, Archived, Inactive)

**Response**:
```json
[
  {
    "id": "uuid",
    "pilot_id": "PILOT-DTD-001",
    "email": "user@example.com",
    "name": "John Doe",
    "club": "Rotary Club A",
    "role": "DTD",
    "status": "Active",
    "batch": "2026"
  }
]
```

### POST /users
Create new user (SuperAdmin).

**Request**:
```json
{
  "email": "newuser@example.com",
  "name": "Jane Doe",
  "club": "Rotary Club B",
  "role": "DTD",
  "batch": "2026"
}
```

### PATCH /users/:id/promote
Promote user to new role (SuperAdmin).

**Request**:
```json
{
  "newRole": "DT"
}
```

---

## Activities

### POST /activities
Create new activity.

**Request**:
```json
{
  "title": "Event Conducted",
  "category": "Event Conducted",
  "description": "District training event",
  "outcome": "50 participants attended",
  "userId": "uuid"
}
```

### GET /activities
List activities.

**Query Parameters**:
- `userId`: Filter by user
- `status`: Filter by status (Draft, Submitted, Reviewed)

### PATCH /activities/:id/status
Update activity status.

**Request**:
```json
{
  "status": "Submitted"
}
```

---

## Evaluations

### POST /evaluations
Create evaluation.

**Request**:
```json
{
  "candidateId": "uuid",
  "evaluatorId": "uuid",
  "remarks": "Good performance",
  "strengths": "Leadership, communication",
  "improvements": "Time management",
  "recommendation": true
}
```

### GET /evaluations
Get evaluations (optional candidateId query).

---

## Interviews

### POST /interviews
Create interview record.

**Request**:
```json
{
  "candidateId": "uuid",
  "scheduledDate": "2026-07-15T10:00:00Z"
}
```

### PATCH /interviews/:id
Update interview status.

**Request**:
```json
{
  "status": "Passed",
  "notes": "Interview notes"
}
```

---

## Reports

### GET /reports/top-members?role=DTD&limit=10
Get top members by role.

### GET /reports/monthly?year=2026&month=6
Get monthly activity summary.

### GET /reports/promotions
Get promotion history.

---

## Error Responses

All errors return JSON with status code and message.

**Example**:
```json
{
  "error": "User not found"
}
```

**Common Status Codes**:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
