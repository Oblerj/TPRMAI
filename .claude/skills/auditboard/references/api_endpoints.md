# AuditBoard API Endpoint Reference

Complete reference for AuditBoard REST API endpoints. API Version: 23.8.0

## Table of Contents

1. [Authentication](#authentication)
2. [OpsAudits](#opsaudits)
3. [Notification Messages](#notification-messages)
4. [Common Parameters](#common-parameters)
5. [Response Formats](#response-formats)
6. [Error Codes](#error-codes)

---

## Authentication

### Get Service Token

Obtain a bearer token for API authentication.

**Endpoint:** `POST /api/account/serviceToken`

**Request Body:**
```json
{
  "api_key": "your-api-key",
  "email": "service-account@company.com",
  "password": "service-account-password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_at": "2024-01-15T12:00:00Z"
}
```

**Usage:**
```
Authorization: Bearer {token}
```

---

## OpsAudits

### List OpsAudits

Retrieve all OpsAudits with optional filtering and sideloading.

**Endpoint:** `GET /api/v1/ops_audits`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `include` | string | Comma-separated relationships to sideload |
| `page` | integer | Page number for pagination |
| `per_page` | integer | Items per page (default: 25, max: 100) |
| `sort` | string | Sort field (prefix with `-` for descending) |
| `filter[status]` | string | Filter by status |
| `filter[created_at_gte]` | datetime | Created after date |
| `filter[created_at_lte]` | datetime | Created before date |

**Response:**
```json
{
  "ops_audits": [
    {
      "id": "123",
      "name": "Q1 2024 Vendor Assessment",
      "status": "in_progress",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T12:00:00Z",
      "template_id": "456",
      "owner_id": "789"
    }
  ],
  "meta": {
    "total_count": 100,
    "page": 1,
    "per_page": 25
  }
}
```

---

### Get OpsAudit

Retrieve a specific OpsAudit by ID.

**Endpoint:** `GET /api/v1/ops_audits/{ops_audit_id}`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ops_audit_id` | string | The OpsAudit ID |

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `include` | string | Comma-separated relationships to sideload |

**Response:**
```json
{
  "ops_audit": {
    "id": "123",
    "name": "Q1 2024 Vendor Assessment",
    "status": "in_progress",
    "description": "Annual vendor risk assessment",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z",
    "template_id": "456",
    "owner_id": "789",
    "audit_forms": [...],
    "controls": [...],
    "risks": [...]
  }
}
```

---

### Clone OpsAudit

Create a new OpsAudit by cloning a template or existing audit.

**Endpoint:** `POST /api/v1/ops_audits/{id}/clone`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Template ID or existing OpsAudit ID to clone |

**Request Body:**
```json
{
  "name": "New Audit Name",
  "description": "Optional description",
  "owner_id": "user-id",
  "due_date": "2024-06-30"
}
```

**Response:**
```json
{
  "ops_audit": {
    "id": "new-id",
    "name": "New Audit Name",
    "status": "not_started",
    "cloned_from_id": "123",
    "created_at": "2024-01-15T12:00:00Z"
  }
}
```

---

### Cancel OpsAudit

Cancel an in-progress OpsAudit.

**Endpoint:** `PUT /api/v1/ops_audits/{ops_audit_id}/cancel`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ops_audit_id` | string | The OpsAudit ID to cancel |

**Request Body:** *(optional)*
```json
{
  "cancellation_reason": "Project scope changed"
}
```

**Response:**
```json
{
  "ops_audit": {
    "id": "123",
    "status": "cancelled",
    "cancelled_at": "2024-01-15T12:00:00Z",
    "cancellation_reason": "Project scope changed"
  }
}
```

---

### Delete OpsAudit

Permanently delete an OpsAudit.

**Endpoint:** `DELETE /api/v1/ops_audits/{ops_audit_id}`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ops_audit_id` | string | The OpsAudit ID to delete |

**Response:**
```json
{
  "success": true,
  "deleted_id": "123"
}
```

---

### Export Audit Forms

Export audit forms from an OpsAudit. This is an async operation.

**Endpoint:** `POST /api/v1/ops_audits/{ops_audit_id}/export_audit_forms`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ops_audit_id` | string | The OpsAudit ID to export |

**Request Body:** *(optional)*
```json
{
  "format": "pdf",
  "include_attachments": true
}
```

**Response:**
```json
{
  "export_job_id": "export-123",
  "status": "processing",
  "message": "Export initiated. Poll /notification_messages for download URL."
}
```

**Follow-up:** Poll `GET /api/v1/notification_messages` to retrieve the download URL.

---

### Merge OpsAudits

Merge multiple OpsAudits into a target audit.

**Endpoint:** `POST /api/v1/ops_audits/{ops_audit_id}/merge`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ops_audit_id` | string | Target OpsAudit ID to merge into |

**Request Body:**
```json
{
  "source_ops_audit_ids": ["id-1", "id-2", "id-3"]
}
```

**Response:**
```json
{
  "ops_audit": {
    "id": "target-id",
    "merged_from": ["id-1", "id-2", "id-3"],
    "merged_at": "2024-01-15T12:00:00Z"
  }
}
```

---

## Notification Messages

### List Notification Messages

Retrieve notification messages, including export download URLs.

**Endpoint:** `GET /api/v1/notification_messages`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `per_page` | integer | Items per page |
| `filter[unread]` | boolean | Filter unread messages |

**Response:**
```json
{
  "notification_messages": [
    {
      "id": "notif-123",
      "type": "export_complete",
      "message": "Your export is ready",
      "download_url": "https://auditboard.com/exports/file.pdf",
      "created_at": "2024-01-15T12:00:00Z",
      "read": false
    }
  ]
}
```

---

## Common Parameters

### Sideloading (include parameter)

Common sideloadable relationships:
- `audit_forms` - Related audit forms
- `controls` - Associated controls
- `risks` - Associated risks
- `users` - Related users (owners, assignees)
- `entities` - Related entities/vendors
- `attachments` - File attachments
- `comments` - Comments and notes

Example: `?include=controls,risks,users`

### Pagination

All list endpoints support pagination:
- `page` - Page number (1-indexed)
- `per_page` - Items per page (default: 25, max: 100)

### Sorting

Use `sort` parameter with field name. Prefix with `-` for descending:
- `?sort=created_at` - Oldest first
- `?sort=-created_at` - Newest first
- `?sort=-updated_at` - Recently updated first

### Filtering

Use `filter[field]` syntax:
- `?filter[status]=in_progress`
- `?filter[created_at_gte]=2024-01-01`
- `?filter[owner_id]=user-123`

---

## Response Formats

### Success Response

```json
{
  "ops_audit": { ... },
  "meta": {
    "total_count": 100,
    "page": 1,
    "per_page": 25
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

---

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `BAD_REQUEST` | Invalid request syntax |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource conflict (e.g., duplicate) |
| 422 | `VALIDATION_ERROR` | Request validation failed |
| 429 | `RATE_LIMITED` | Too many requests (20/sec limit) |
| 500 | `INTERNAL_ERROR` | Server error |

### Rate Limiting Headers

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1705320000
Retry-After: 5
```

---

## TPRM-Specific Patterns

### Vendor Risk Assessment Workflow

1. Clone assessment template: `POST /ops_audits/{template_id}/clone`
2. Assign to vendor owner: Update via PUT (not documented here)
3. Monitor progress: `GET /ops_audits/{id}?include=audit_forms,controls`
4. Export results: `POST /ops_audits/{id}/export_audit_forms`
5. Archive completed: Update status or delete

### Bulk Operations

For bulk operations, iterate through resources respecting the 20 req/sec rate limit:

```python
import time

for audit_id in audit_ids:
    client.get_ops_audit(audit_id)
    time.sleep(0.05)  # 50ms between requests = 20/sec
```

---

## Additional Resources

- **AuditBoard Help Center**: Access via your tenant URL
- **API Developer Portal**: Contact your AuditBoard administrator
- **Go Client Reference**: github.com/dja852/auditboard-go-client
- **Postman Collection**: Available from AuditBoard support
