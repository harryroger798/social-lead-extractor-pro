"""Proxy management and rotation service."""
import asyncio
import time
import random
import requests
from typing import Optional


class ProxyManager:
    """Manages proxy rotation for scraping requests."""

    def __init__(self) -> None:
        self.proxies: list[dict] = []
        self.current_index: int = 0
        self.rotation_strategy: str = "round-robin"

    def add_proxy(self, proxy: dict) -> None:
        """Add a proxy to the pool."""
        self.proxies.append(proxy)

    def remove_proxy(self, proxy_id: str) -> None:
        """Remove a proxy from the pool."""
        self.proxies = [p for p in self.proxies if p.get("id") != proxy_id]

    def get_proxy_url(self, proxy: dict) -> str:
        """Build proxy URL from proxy config."""
        protocol = proxy.get("protocol", "http")
        host = proxy.get("host", "")
        port = proxy.get("port", 8080)
        username = proxy.get("username", "")
        password = proxy.get("password", "")
        if username and password:
            return f"{protocol}://{username}:{password}@{host}:{port}"
        return f"{protocol}://{host}:{port}"

    def get_next_proxy(self) -> Optional[dict]:
        """Get the next proxy based on rotation strategy."""
        active = [p for p in self.proxies if p.get("status") == "active"]
        if not active:
            return None

        if self.rotation_strategy == "round-robin":
            proxy = active[self.current_index % len(active)]
            self.current_index += 1
            return proxy
        elif self.rotation_strategy == "random":
            return random.choice(active)
        elif self.rotation_strategy == "fastest":
            return min(active, key=lambda p: p.get("speed", float("inf")))
        return active[0]

    def set_strategy(self, strategy: str) -> None:
        """Set the rotation strategy."""
        if strategy in ("round-robin", "random", "fastest"):
            self.rotation_strategy = strategy

    def get_requests_proxies(self) -> Optional[dict[str, str]]:
        """Get proxy dict for use with requests library."""
        proxy = self.get_next_proxy()
        if not proxy:
            return None
        url = self.get_proxy_url(proxy)
        return {"http": url, "https": url}


def test_proxy_sync(proxy: dict) -> dict:
    """Test a single proxy and return results."""
    protocol = proxy.get("protocol", "http")
    host = proxy.get("host", "")
    port = proxy.get("port", 8080)
    username = proxy.get("username", "")
    password = proxy.get("password", "")

    if username and password:
        proxy_url = f"{protocol}://{username}:{password}@{host}:{port}"
    else:
        proxy_url = f"{protocol}://{host}:{port}"

    proxies = {"http": proxy_url, "https": proxy_url}

    try:
        start = time.time()
        response = requests.get(
            "https://httpbin.org/ip",
            proxies=proxies,
            timeout=10,
        )
        elapsed = time.time() - start

        if response.status_code == 200:
            return {
                "status": "active",
                "speed": round(elapsed * 1000),
                "ip": response.json().get("origin", ""),
                "error": None,
            }
        return {
            "status": "failed",
            "speed": 0,
            "ip": "",
            "error": f"HTTP {response.status_code}",
        }
    except requests.exceptions.Timeout:
        return {"status": "failed", "speed": 0, "ip": "", "error": "Timeout"}
    except Exception as e:
        return {"status": "failed", "speed": 0, "ip": "", "error": str(e)}


async def test_proxy(proxy: dict) -> dict:
    """Test a proxy asynchronously."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, test_proxy_sync, proxy)


def parse_proxy_line(line: str) -> Optional[dict]:
    """Parse a proxy from format: host:port:username:password"""
    parts = line.strip().split(":")
    if len(parts) < 2:
        return None
    result: dict = {
        "host": parts[0],
        "port": int(parts[1]) if parts[1].isdigit() else 8080,
        "username": parts[2] if len(parts) > 2 else "",
        "password": parts[3] if len(parts) > 3 else "",
        "protocol": "http",
        "country": "",
        "speed": 0,
        "status": "inactive",
    }
    return result


# Global proxy manager instance
proxy_manager = ProxyManager()
