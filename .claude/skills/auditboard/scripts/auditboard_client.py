#!/usr/bin/env python3
"""
AuditBoard API Client for TPRM Operations

A reusable client class for interacting with the AuditBoard REST API.
Handles authentication, rate limiting, and common TPRM operations.

Usage:
    from auditboard_client import AuditBoardClient

    client = AuditBoardClient(
        tenant="yourcompany",
        api_key="your-api-key",
        email="service@company.com",
        password="password"
    )

    # List all audits
    audits = client.list_ops_audits()

    # Clone from template
    new_audit = client.clone_ops_audit(template_id="123", name="Q1 Vendor Review")
"""

import os
import time
import requests
from typing import Optional, Dict, Any, List


class AuditBoardClient:
    """Client for AuditBoard REST API operations."""

    def __init__(
        self,
        tenant: Optional[str] = None,
        api_key: Optional[str] = None,
        email: Optional[str] = None,
        password: Optional[str] = None,
        rate_limit_per_second: int = 20
    ):
        """
        Initialize AuditBoard client.

        Args:
            tenant: AuditBoard tenant subdomain (or AUDITBOARD_TENANT env var)
            api_key: API key (or AUDITBOARD_API_KEY env var)
            email: Service account email (or AUDITBOARD_EMAIL env var)
            password: Service account password (or AUDITBOARD_PASSWORD env var)
            rate_limit_per_second: Max requests per second (default: 20)
        """
        self.tenant = tenant or os.getenv("AUDITBOARD_TENANT")
        self.api_key = api_key or os.getenv("AUDITBOARD_API_KEY")
        self.email = email or os.getenv("AUDITBOARD_EMAIL")
        self.password = password or os.getenv("AUDITBOARD_PASSWORD")

        if not all([self.tenant, self.api_key, self.email, self.password]):
            raise ValueError(
                "Missing required credentials. Provide tenant, api_key, email, "
                "and password either as arguments or environment variables."
            )

        self.base_url = f"https://{self.tenant}.auditboard.com/api/v1"
        self.token_url = f"https://{self.tenant}.auditboard.com/api/account/serviceToken"
        self.rate_limit = rate_limit_per_second
        self._token: Optional[str] = None
        self._last_request_time: float = 0
        self._min_request_interval: float = 1.0 / rate_limit_per_second

    def _rate_limit_wait(self):
        """Enforce rate limiting between requests."""
        elapsed = time.time() - self._last_request_time
        if elapsed < self._min_request_interval:
            time.sleep(self._min_request_interval - elapsed)
        self._last_request_time = time.time()

    def authenticate(self) -> str:
        """
        Authenticate and obtain bearer token.

        Returns:
            Bearer token string
        """
        payload = {
            "api_key": self.api_key,
            "email": self.email,
            "password": self.password
        }

        response = requests.post(self.token_url, json=payload)

        if response.status_code != 200:
            raise AuthenticationError(
                f"Authentication failed: {response.status_code} - {response.text}"
            )

        data = response.json()
        self._token = data.get("token")

        if not self._token:
            raise AuthenticationError("No token returned from authentication")

        return self._token

    @property
    def token(self) -> str:
        """Get current token, authenticating if needed."""
        if not self._token:
            self.authenticate()
        return self._token

    def _headers(self) -> Dict[str, str]:
        """Get request headers with authentication."""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict] = None,
        json_data: Optional[Dict] = None,
        retry_on_401: bool = True
    ) -> Dict[str, Any]:
        """
        Make an authenticated API request with rate limiting and error handling.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint (without base URL)
            params: Query parameters
            json_data: JSON request body
            retry_on_401: Retry with fresh token on 401 (default: True)

        Returns:
            Response JSON data
        """
        self._rate_limit_wait()

        url = f"{self.base_url}/{endpoint.lstrip('/')}"

        response = requests.request(
            method=method,
            url=url,
            headers=self._headers(),
            params=params,
            json=json_data
        )

        # Handle 401 - reauthenticate and retry once
        if response.status_code == 401 and retry_on_401:
            self._token = None
            self.authenticate()
            return self._request(
                method, endpoint, params, json_data, retry_on_401=False
            )

        # Handle rate limiting with exponential backoff
        if response.status_code == 429:
            retry_after = int(response.headers.get("Retry-After", 5))
            time.sleep(retry_after)
            return self._request(method, endpoint, params, json_data)

        # Handle other errors
        if response.status_code >= 400:
            raise AuditBoardAPIError(
                f"API error: {response.status_code} - {response.text}",
                status_code=response.status_code,
                response=response
            )

        return response.json() if response.text else {}

    # ==================== OpsAudits Operations ====================

    def list_ops_audits(
        self,
        include: Optional[str] = None,
        filters: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        List all OpsAudits.

        Args:
            include: Comma-separated relationships to sideload
            filters: Additional filter parameters

        Returns:
            Dict with 'ops_audits' list and any sideloaded data
        """
        params = filters or {}
        if include:
            params["include"] = include

        return self._request("GET", "/ops_audits", params=params)

    def get_ops_audit(
        self,
        ops_audit_id: str,
        include: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get a specific OpsAudit by ID.

        Args:
            ops_audit_id: The OpsAudit ID
            include: Comma-separated relationships to sideload

        Returns:
            OpsAudit data
        """
        params = {}
        if include:
            params["include"] = include

        return self._request("GET", f"/ops_audits/{ops_audit_id}", params=params)

    def clone_ops_audit(
        self,
        template_id: str,
        name: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Clone an OpsAudit from a template or existing audit.

        Args:
            template_id: ID of template or OpsAudit to clone
            name: Optional name for the cloned audit
            **kwargs: Additional clone parameters

        Returns:
            Cloned OpsAudit data
        """
        payload = kwargs.copy()
        if name:
            payload["name"] = name

        return self._request(
            "POST",
            f"/ops_audits/{template_id}/clone",
            json_data=payload if payload else None
        )

    def cancel_ops_audit(self, ops_audit_id: str) -> Dict[str, Any]:
        """
        Cancel an OpsAudit.

        Args:
            ops_audit_id: The OpsAudit ID to cancel

        Returns:
            Updated OpsAudit data
        """
        return self._request("PUT", f"/ops_audits/{ops_audit_id}/cancel")

    def delete_ops_audit(self, ops_audit_id: str) -> Dict[str, Any]:
        """
        Delete an OpsAudit.

        Args:
            ops_audit_id: The OpsAudit ID to delete

        Returns:
            Deletion confirmation
        """
        return self._request("DELETE", f"/ops_audits/{ops_audit_id}")

    def export_audit_forms(
        self,
        ops_audit_id: str,
        wait_for_download: bool = True,
        max_wait_seconds: int = 60
    ) -> Optional[str]:
        """
        Export audit forms and optionally wait for download URL.

        Args:
            ops_audit_id: The OpsAudit ID to export
            wait_for_download: Wait and poll for download URL
            max_wait_seconds: Maximum seconds to wait for download URL

        Returns:
            Download URL if wait_for_download=True, else export response
        """
        # Initiate export
        response = self._request(
            "POST",
            f"/ops_audits/{ops_audit_id}/export_audit_forms"
        )

        if not wait_for_download:
            return response

        # Poll for download URL
        start_time = time.time()
        while time.time() - start_time < max_wait_seconds:
            time.sleep(2)
            notifications = self.list_notification_messages()

            for msg in notifications.get("notification_messages", []):
                if msg.get("download_url"):
                    return msg["download_url"]

        return None

    def merge_ops_audits(
        self,
        target_ops_audit_id: str,
        source_ops_audit_ids: List[str]
    ) -> Dict[str, Any]:
        """
        Merge multiple OpsAudits into a target.

        Args:
            target_ops_audit_id: ID of target OpsAudit
            source_ops_audit_ids: List of source OpsAudit IDs to merge

        Returns:
            Merged OpsAudit data
        """
        return self._request(
            "POST",
            f"/ops_audits/{target_ops_audit_id}/merge",
            json_data={"source_ops_audit_ids": source_ops_audit_ids}
        )

    # ==================== Notification Messages ====================

    def list_notification_messages(
        self,
        filters: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        List notification messages (includes export download URLs).

        Args:
            filters: Optional filter parameters

        Returns:
            Dict with 'notification_messages' list
        """
        return self._request(
            "GET",
            "/notification_messages",
            params=filters
        )


# ==================== Custom Exceptions ====================

class AuditBoardError(Exception):
    """Base exception for AuditBoard client errors."""
    pass


class AuthenticationError(AuditBoardError):
    """Authentication failed."""
    pass


class AuditBoardAPIError(AuditBoardError):
    """API request error."""

    def __init__(self, message: str, status_code: int = None, response=None):
        super().__init__(message)
        self.status_code = status_code
        self.response = response


# ==================== CLI Interface ====================

def main():
    """Command-line interface for testing."""
    import argparse

    parser = argparse.ArgumentParser(description="AuditBoard API Client")
    parser.add_argument("--tenant", help="AuditBoard tenant subdomain")
    parser.add_argument("--api-key", help="API key")
    parser.add_argument("--email", help="Service account email")
    parser.add_argument("--password", help="Service account password")
    parser.add_argument(
        "action",
        choices=["list", "get", "clone", "cancel", "delete", "export"],
        help="Action to perform"
    )
    parser.add_argument("--id", help="OpsAudit ID (for get/clone/cancel/delete/export)")
    parser.add_argument("--name", help="Name for cloned audit")

    args = parser.parse_args()

    client = AuditBoardClient(
        tenant=args.tenant,
        api_key=args.api_key,
        email=args.email,
        password=args.password
    )

    if args.action == "list":
        result = client.list_ops_audits()
        print(f"Found {len(result.get('ops_audits', []))} OpsAudits")
        for audit in result.get("ops_audits", [])[:10]:
            print(f"  - {audit.get('id')}: {audit.get('name')}")

    elif args.action == "get":
        if not args.id:
            parser.error("--id required for get action")
        result = client.get_ops_audit(args.id)
        print(result)

    elif args.action == "clone":
        if not args.id:
            parser.error("--id required for clone action")
        result = client.clone_ops_audit(args.id, name=args.name)
        print(f"Cloned audit: {result}")

    elif args.action == "cancel":
        if not args.id:
            parser.error("--id required for cancel action")
        result = client.cancel_ops_audit(args.id)
        print(f"Cancelled audit: {result}")

    elif args.action == "delete":
        if not args.id:
            parser.error("--id required for delete action")
        result = client.delete_ops_audit(args.id)
        print(f"Deleted audit: {result}")

    elif args.action == "export":
        if not args.id:
            parser.error("--id required for export action")
        url = client.export_audit_forms(args.id)
        print(f"Download URL: {url}")


if __name__ == "__main__":
    main()
