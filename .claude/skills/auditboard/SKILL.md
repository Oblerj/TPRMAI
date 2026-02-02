---
name: auditboard
description: AuditBoard API integration for Third Party Risk Management (TPRM). Use when working with AuditBoard platform for: (1) Managing OpsAudits (list, get, clone, cancel, delete, export), (2) Risk assessments and controls management, (3) Audit workflow automation, (4) Evidence collection and compliance tasks, (5) Any integration with AuditBoard's REST API. Triggers on mentions of AuditBoard, audit management, TPRM workflows, or GRC (Governance, Risk, Compliance) operations.
---

# AuditBoard API Integration

## Overview

Integrate with AuditBoard's REST API to automate TPRM workflows including OpsAudits management, risk assessments, controls tracking, and compliance evidence collection.

## Authentication

AuditBoard uses a two-step bearer token authentication:

1. **Obtain credentials** from AuditBoard administrator:
   - API Key
   - Service Account Email
   - Service Account Password
   - Tenant subdomain (e.g., `yourcompany` from `yourcompany.auditboard.com`)

2. **Get bearer token** via POST to `/api/account/serviceToken`:
```python
import requests

def get_auditboard_token(tenant, api_key, email, password):
    url = f"https://{tenant}.auditboard.com/api/account/serviceToken"
    payload = {
        "api_key": api_key,
        "email": email,
        "password": password
    }
    response = requests.post(url, json=payload)
    return response.json()["token"]
```

3. **Use token** in Authorization header: `Authorization: Bearer {token}`

## Base URL Pattern

```
https://{tenant}.auditboard.com/api/v1/{endpoint}
```

## Rate Limiting

- **Limit**: 20 requests per second
- Implement exponential backoff on 429 responses
- For bulk operations, batch requests appropriately

## Core Endpoints

### OpsAudits

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| List | GET | `/ops_audits` | Get all OpsAudits with optional filtering |
| Get | GET | `/ops_audits/{id}` | Get specific OpsAudit by ID |
| Clone | POST | `/ops_audits/{id}/clone` | Clone from template or existing audit |
| Cancel | PUT | `/ops_audits/{id}/cancel` | Cancel an OpsAudit |
| Delete | DELETE | `/ops_audits/{id}` | Delete an OpsAudit |
| Export | POST | `/ops_audits/{id}/export_audit_forms` | Export audit forms |
| Merge | POST | `/ops_audits/{id}/merge` | Merge OpsAudits |

### Notification Messages

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| List | GET | `/notification_messages` | Get notifications (includes export download URLs) |

## TPRM Workflow Examples

### List Active Audits
```python
def list_ops_audits(tenant, token, include=None):
    """
    List OpsAudits with optional sideloaded relationships.

    Args:
        include: Comma-separated list of relationships to sideload
    """
    url = f"https://{tenant}.auditboard.com/api/v1/ops_audits"
    headers = {"Authorization": f"Bearer {token}"}
    params = {}
    if include:
        params["include"] = include

    response = requests.get(url, headers=headers, params=params)
    return response.json()
```

### Clone Audit from Template
```python
def clone_ops_audit(tenant, token, template_id, name=None):
    """
    Clone an OpsAudit from a template or existing audit.

    Args:
        template_id: ID of template or existing OpsAudit to clone
        name: Optional name for the new audit
    """
    url = f"https://{tenant}.auditboard.com/api/v1/ops_audits/{template_id}/clone"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {}
    if name:
        payload["name"] = name

    response = requests.post(url, headers=headers, json=payload)
    return response.json()
```

### Export Audit Forms
```python
def export_audit_forms(tenant, token, ops_audit_id):
    """
    Export audit forms. Requires follow-up GET to /notification_messages
    to retrieve the download URL.
    """
    url = f"https://{tenant}.auditboard.com/api/v1/ops_audits/{ops_audit_id}/export_audit_forms"
    headers = {"Authorization": f"Bearer {token}"}

    # Initiate export
    response = requests.post(url, headers=headers)

    # Poll for download URL
    import time
    for _ in range(30):  # Max 30 attempts
        time.sleep(2)
        notifications = requests.get(
            f"https://{tenant}.auditboard.com/api/v1/notification_messages",
            headers=headers
        ).json()

        for msg in notifications.get("notification_messages", []):
            if msg.get("download_url"):
                return msg["download_url"]

    return None
```

## Error Handling

```python
def handle_auditboard_response(response):
    """Standard error handling for AuditBoard API responses."""
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 401:
        raise Exception("Authentication failed - check credentials")
    elif response.status_code == 403:
        raise Exception("Permission denied - check API permissions")
    elif response.status_code == 404:
        raise Exception("Resource not found")
    elif response.status_code == 429:
        raise Exception("Rate limited - implement backoff")
    else:
        raise Exception(f"API error: {response.status_code} - {response.text}")
```

## Environment Setup

Store credentials securely in environment variables:

```bash
AUDITBOARD_TENANT=yourcompany
AUDITBOARD_API_KEY=your-api-key
AUDITBOARD_EMAIL=service-account@company.com
AUDITBOARD_PASSWORD=service-account-password
```

## Resources

- **API Reference**: See [references/api_endpoints.md](references/api_endpoints.md) for complete endpoint documentation
- **Python Client**: See [scripts/auditboard_client.py](scripts/auditboard_client.py) for reusable client class
