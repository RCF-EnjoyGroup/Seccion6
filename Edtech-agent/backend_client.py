import logging
import os
from typing import Any, Optional

import httpx

log = logging.getLogger(__name__)

DEFAULT_TIMEOUT = 10.0
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:3000")
API_PREFIX = os.getenv("BACKEND_API_PREFIX", "/api/agent")


class BackendClient:
    def __init__(self) -> None:
        self.base_url = BACKEND_BASE_URL.rstrip("/")
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=DEFAULT_TIMEOUT)
        return self._client

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    def _full_path(self, path: str) -> str:
        return f"{self.base_url}{API_PREFIX}{path}"

    async def get(
        self,
        path: str,
        params: Optional[dict[str, Any]] = None,
        headers: Optional[dict[str, str]] = None,
    ) -> dict | list:
        client = await self._get_client()
        url = self._full_path(path)
        h = headers or {}
        r = await client.get(url, params=params, headers=h)
        r.raise_for_status()
        return r.json()

    async def post(
        self,
        path: str,
        body: dict[str, Any],
        headers: Optional[dict[str, str]] = None,
    ) -> dict:
        client = await self._get_client()
        url = self._full_path(path)
        h = headers or {}
        r = await client.post(url, json=body, headers=h)
        r.raise_for_status()
        data = r.json()
        return data if isinstance(data, dict) else {}

    async def patch(
        self,
        path: str,
        body: dict[str, Any],
        headers: Optional[dict[str, str]] = None,
    ) -> dict:
        client = await self._get_client()
        url = self._full_path(path)
        h = headers or {}
        r = await client.patch(url, json=body, headers=h)
        r.raise_for_status()
        data = r.json()
        return data if isinstance(data, dict) else {}
