#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request


DEFAULT_BASE_URL = "http://127.0.0.1:8000"
EXPECTED_ROUTES = [
    "/api/recipes",
    "/api/recipes/brew-bar",
    "/api/recipes/batch-brew",
    "/api/recipes/signature-ttk",
    "/api/items",
]


BREW_BAR_PAYLOAD = {
    "lotName": "TEST V60 API CHECK",
    "roaster": "TEST",
    "origin": "TEST",
    "processing": "",
    "method": "v60",
    "grinder": "EK43",
    "grindClicks": "7.0",
    "coffeeWeightG": 15,
    "waterVolumeMl": 250,
    "temperature": 93,
    "waterPpm": 80,
    "steps": [],
    "cupDescription": "",
    "notes": "created by scripts/check_api.py",
}

PASTRY_PAYLOAD = {
    "category": "pastry",
    "title": "TEST PASTRY API CHECK",
    "subtitle": "TEST",
    "description": "",
    "composition": "",
    "shelfLife": "",
    "price": None,
    "imageUrl": "",
    "specs": [],
    "steps": [],
    "tags": [],
    "isFavorite": False,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    return parser.parse_args()


def make_url(base_url: str, path: str) -> str:
    return f"{base_url.rstrip('/')}{path}"


def request(method: str, url: str, payload: dict | None = None) -> tuple[int | None, str, str]:
    data = None
    headers = {}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            body = response.read().decode("utf-8", errors="replace")
            return response.getcode(), response.headers.get("content-type", ""), body
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        return error.code, error.headers.get("content-type", ""), body
    except urllib.error.URLError:
        return None, "", ""


def parse_json(body: str) -> object | None:
    return json.loads(body) if body else None


def body_looks_like_html(body: str) -> bool:
    stripped = body.lstrip().lower()
    return stripped.startswith("<!doctype html") or stripped.startswith("<html")


def print_report(report: dict[str, str]) -> None:
    print()
    print("API DIAGNOSTIC REPORT")
    print()
    print(f"* backend reachable: {report['backend_reachable']}")
    print(f"* openapi available: {report['openapi_available']}")
    print(f"* recipes routes registered: {report['recipes_routes_registered']}")
    print(f"* GET recipes returns JSON: {report['get_recipes_returns_json']}")
    print(f"* POST brew-bar works: {report['post_brew_bar_works']}")
    print(f"* POST pastry works: {report['post_pastry_works']}")
    print(f"* likely problem: {report['likely_problem']}")
    print(f"* recommended next step: {report['recommended_next_step']}")


def main() -> int:
    args = parse_args()
    base_url = args.base_url.rstrip("/")

    report = {
        "backend_reachable": "no",
        "openapi_available": "no",
        "recipes_routes_registered": "no",
        "get_recipes_returns_json": "no",
        "post_brew_bar_works": "no",
        "post_pastry_works": "no",
        "likely_problem": "backend is not reachable",
        "recommended_next_step": "cd backend && python -m uvicorn app.main:app --reload --port 8000",
    }

    health_status, _, health_body = request("GET", make_url(base_url, "/api/health"))
    if health_status is None:
        print("FAIL: backend is not reachable")
        print("cd backend")
        print("python -m uvicorn app.main:app --reload --port 8000")
        print_report(report)
        return 1

    if health_status != 200:
        print(f"FAIL: backend health returned status {health_status}")
        if health_body:
            print(health_body[:500])
        report["likely_problem"] = f"/api/health returned status {health_status}"
        report["recommended_next_step"] = "check backend logs and route mounting"
        print_report(report)
        return 1

    report["backend_reachable"] = "yes"

    openapi_status, openapi_content_type, openapi_body = request("GET", make_url(base_url, "/openapi.json"))
    if openapi_status != 200:
        print(f"FAIL: openapi is not available (status {openapi_status})")
        report["likely_problem"] = "/openapi.json is unavailable"
        report["recommended_next_step"] = "check FastAPI startup and docs configuration"
        print_report(report)
        return 1

    try:
        openapi_data = parse_json(openapi_body)
        assert isinstance(openapi_data, dict)
    except Exception:
        print("FAIL: openapi is not valid JSON")
        print(f"content-type: {openapi_content_type}")
        print(openapi_body[:500])
        report["likely_problem"] = "/openapi.json returned invalid JSON"
        report["recommended_next_step"] = "check reverse proxy or SPA fallback configuration"
        print_report(report)
        return 1

    report["openapi_available"] = "yes"
    registered_paths = set(openapi_data.get("paths", {}).keys())
    missing_routes = [route for route in EXPECTED_ROUTES if route not in registered_paths]
    if missing_routes:
        print("FAIL: API routes are not registered")
        print("Missing routes:")
        for route in missing_routes:
            print(route)
        report["likely_problem"] = f"missing OpenAPI routes: {', '.join(missing_routes)}"
        report["recommended_next_step"] = "check app.include_router(...) in backend/app/main.py"
        print_report(report)
        return 1

    report["recipes_routes_registered"] = "yes"

    brew_get_url = make_url(base_url, "/api/recipes/brew-bar")
    brew_get_status, brew_get_content_type, brew_get_body = request("GET", brew_get_url)
    if brew_get_status != 200:
        print(f"FAIL: GET /api/recipes/brew-bar returned status {brew_get_status}")
        print(brew_get_body[:500])
        report["likely_problem"] = f"GET /api/recipes/brew-bar returned {brew_get_status}"
        report["recommended_next_step"] = "check backend router registration and upstream base URL"
        print_report(report)
        return 1

    if "text/html" in brew_get_content_type.lower() or body_looks_like_html(brew_get_body):
        print("FAIL: API request is handled by SPA fallback instead of API router")
        print(f"content-type: {brew_get_content_type}")
        print(brew_get_body[:500])
        report["likely_problem"] = "SPA fallback is handling /api/recipes/brew-bar"
        report["recommended_next_step"] = "block /api/* from the SPA catch-all and point frontend to the real backend"
        print_report(report)
        return 1

    try:
        brew_get_json = parse_json(brew_get_body)
        if not isinstance(brew_get_json, list):
            raise ValueError("Expected list")
    except Exception:
        print("FAIL: GET /api/recipes/brew-bar did not return JSON list")
        print(f"content-type: {brew_get_content_type}")
        print(brew_get_body[:500])
        report["likely_problem"] = "GET /api/recipes/brew-bar returned non-JSON data"
        report["recommended_next_step"] = "check backend response and upstream proxy target"
        print_report(report)
        return 1

    report["get_recipes_returns_json"] = "yes"

    brew_post_status, brew_post_content_type, brew_post_body = request(
        "POST",
        make_url(base_url, "/api/recipes/brew-bar"),
        BREW_BAR_PAYLOAD,
    )
    if brew_post_status not in (200, 201):
        print(f"FAIL: POST /api/recipes/brew-bar returned status {brew_post_status}")
        print(f"content-type: {brew_post_content_type}")
        print(brew_post_body[:500])
        report["likely_problem"] = f"POST /api/recipes/brew-bar returned {brew_post_status}"
        report["recommended_next_step"] = "check that POST /api/recipes/brew-bar is served by FastAPI, not SPA or another backend"
        print_report(report)
        return 1

    try:
        brew_post_json = parse_json(brew_post_body)
        assert isinstance(brew_post_json, dict)
    except Exception:
        print("FAIL: POST /api/recipes/brew-bar did not return JSON")
        print(f"content-type: {brew_post_content_type}")
        print(brew_post_body[:500])
        report["likely_problem"] = "POST /api/recipes/brew-bar returned invalid JSON"
        report["recommended_next_step"] = "check backend handler and proxy response"
        print_report(report)
        return 1

    brew_id = brew_post_json.get("id")
    if not brew_id:
        print("FAIL: POST /api/recipes/brew-bar response has no id")
        print(brew_post_body[:500])
        report["likely_problem"] = "create brew-bar response has no id"
        report["recommended_next_step"] = "check create_brew_bar serializer"
        print_report(report)
        return 1

    brew_list_status, brew_list_content_type, brew_list_body = request("GET", brew_get_url)
    if brew_list_status != 200:
        print(f"FAIL: second GET /api/recipes/brew-bar returned status {brew_list_status}")
        print(brew_list_body[:500])
        report["likely_problem"] = f"follow-up GET /api/recipes/brew-bar returned {brew_list_status}"
        report["recommended_next_step"] = "check persistence layer and backend logs"
        print_report(report)
        return 1

    try:
        brew_list_json = parse_json(brew_list_body)
        assert isinstance(brew_list_json, list)
    except Exception:
        print("FAIL: second GET /api/recipes/brew-bar did not return JSON list")
        print(f"content-type: {brew_list_content_type}")
        print(brew_list_body[:500])
        report["likely_problem"] = "follow-up GET /api/recipes/brew-bar returned invalid JSON"
        report["recommended_next_step"] = "check backend list_brew_bar response"
        print_report(report)
        return 1

    if not any(isinstance(item, dict) and item.get("id") == brew_id for item in brew_list_json):
        print("FAIL: created brew-bar recipe is not present in subsequent GET list")
        report["likely_problem"] = "brew-bar create succeeded but list does not include created item"
        report["recommended_next_step"] = "check transaction commit and repository list query"
        print_report(report)
        return 1

    print("PASS: backend recipe CRUD works")
    report["post_brew_bar_works"] = "yes"

    pastry_post_status, pastry_post_content_type, pastry_post_body = request(
        "POST",
        make_url(base_url, "/api/items"),
        PASTRY_PAYLOAD,
    )
    if pastry_post_status not in (200, 201):
        print(f"FAIL: POST /api/items returned status {pastry_post_status}")
        print(f"content-type: {pastry_post_content_type}")
        print(pastry_post_body[:500])
        report["likely_problem"] = f"POST /api/items returned {pastry_post_status}"
        report["recommended_next_step"] = "check items router and persistence path"
        print_report(report)
        return 1

    try:
        pastry_post_json = parse_json(pastry_post_body)
        assert isinstance(pastry_post_json, dict)
    except Exception:
        print("FAIL: POST /api/items did not return JSON")
        print(f"content-type: {pastry_post_content_type}")
        print(pastry_post_body[:500])
        report["likely_problem"] = "POST /api/items returned invalid JSON"
        report["recommended_next_step"] = "check create_item response serialization"
        print_report(report)
        return 1

    pastry_id = pastry_post_json.get("id")
    if not pastry_id:
        print("FAIL: POST /api/items response has no id")
        print(pastry_post_body[:500])
        report["likely_problem"] = "create item response has no id"
        report["recommended_next_step"] = "check create_item serializer"
        print_report(report)
        return 1

    pastry_get_status, pastry_get_content_type, pastry_get_body = request(
        "GET",
        make_url(base_url, "/api/items?category=pastry"),
    )
    if pastry_get_status != 200:
        print(f"FAIL: GET /api/items?category=pastry returned status {pastry_get_status}")
        print(f"content-type: {pastry_get_content_type}")
        print(pastry_get_body[:500])
        report["likely_problem"] = f"GET /api/items?category=pastry returned {pastry_get_status}"
        report["recommended_next_step"] = "check items list endpoint and filters"
        print_report(report)
        return 1

    try:
        pastry_get_json = parse_json(pastry_get_body)
        assert isinstance(pastry_get_json, list)
    except Exception:
        print("FAIL: GET /api/items?category=pastry did not return JSON list")
        print(f"content-type: {pastry_get_content_type}")
        print(pastry_get_body[:500])
        report["likely_problem"] = "GET /api/items?category=pastry returned invalid JSON"
        report["recommended_next_step"] = "check items list response"
        print_report(report)
        return 1

    if not any(isinstance(item, dict) and item.get("id") == pastry_id for item in pastry_get_json):
        print("FAIL: created pastry item is not present in subsequent GET list")
        report["likely_problem"] = "pastry create succeeded but list does not include created item"
        report["recommended_next_step"] = "check item repository commit and query filter"
        print_report(report)
        return 1

    report["post_pastry_works"] = "yes"
    report["likely_problem"] = "none detected in the checked API paths"
    report["recommended_next_step"] = "point frontend base URL to this backend and reproduce from the app if saves still fail"
    print_report(report)
    return 0


if __name__ == "__main__":
    sys.exit(main())
