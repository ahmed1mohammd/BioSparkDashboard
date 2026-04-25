# BioSpark Admin Dashboard - API Documentation

This document outlines the required REST API endpoints to migrate the current LocalStorage-based dashboard to a real backend.

## Base URL
`https://api.biospark.com/v1` (Example)

## 1. Authentication
Endpoints for managing admin access.

| Endpoint | Method | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `/auth/login` | `POST` | Login and get JWT token | `{ "email": "", "password": "" }` |
| `/auth/logout` | `POST` | Invalidate token | (Header Only) |
| `/auth/profile` | `GET` | Get current admin info | (Header Only) |

## 2. Dashboard Statistics
Summary data for the main dashboard screen.

| Endpoint | Method | Description | Response Example |
| :--- | :--- | :--- | :--- |
| `/dashboard/stats` | `GET` | Get counts for all entities | `{ "visits": 1250, "products": 12, "workshops": 5, "events": 3, "articles": 8 }` |

## 3. Products
Management of BioSpark products.

| Endpoint | Method | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `/products` | `GET` | Get all products | - |
| `/products/:id` | `GET` | Get single product | - |
| `/products` | `POST` | Create new product | `{ "title": "", "date": "", "desc": "", "image": "URL" }` |
| `/products/:id` | `PUT` | Update product | `{ "title": "", "date": "", "desc": "", "image": "URL" }` |
| `/products/:id` | `DELETE` | Delete product | - |

## 4. Workshops & Events & Articles
These entities follow the exact same CRUD pattern as **Products**.

| Collection | Endpoints Root |
| :--- | :--- |
| **Workshops** | `/workshops` |
| **Events** | `/events` |
| **Articles** | `/articles` |

---

## Data Models (Schemas)

### Common Fields
All main entities (Products, Workshops, etc.) should have:
- `id`: Unique identifier (String/UUID or Integer).
- `title`: String.
- `date`: String (ISO Format recommended: YYYY-MM-DD).
- `desc`: String (Supports HTML/Text).
- `image`: String (Direct URL).
- `registrationLink`: String (URL, optional, specifically for Google Forms in Events/Workshops).

### Success Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message description",
  "code": 401
}
```

---

## Design Decisions
- **Images**: We use direct URLs provided by the user.
- **Registration**: Support for individual Google Form links per event/workshop.
- **Security**: All endpoints except `/auth/login` should require a `Bearer Token`.
