#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone


DEFAULT_BASE_URL = "http://127.0.0.1:8000"
REQUEST_TIMEOUT_SECONDS = 10


def utc_stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")


def make_url(base_url: str, path: str) -> str:
    return f"{base_url.rstrip('/')}{path}"


def body_looks_like_html(body: str) -> bool:
    stripped = body.lstrip().lower()
    return stripped.startswith("<!doctype html") or stripped.startswith("<html")


def request(method: str, url: str, payload: dict | None = None) -> tuple[int | None, str, str]:
    data = None
    headers = {}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            body = response.read().decode("utf-8", errors="replace")
            return response.getcode(), response.headers.get("content-type", ""), body
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        return error.code, error.headers.get("content-type", ""), body
    except urllib.error.URLError as error:
        print(f"REQUEST FAILED: {method} {url} ({error})")
        return None, "", ""


def parse_json(body: str) -> object:
    return json.loads(body)


def print_failure(label: str, status: int | None, content_type: str, body: str) -> None:
    print(f"FAIL: {label}")
    print(f"status: {status}")
    print(f"content-type: {content_type}")
    print(body[:500])


def check_json_endpoint(
    base_url: str,
    path: str,
    label: str,
    expected_type: type,
) -> tuple[object, bool]:
    status, content_type, body = request("GET", make_url(base_url, path))
    if status is None:
        print_failure(label, status, content_type, body)
        return None, False

    if status >= 500:
        print_failure(label, status, content_type, body)
        return None, False

    if status != 200:
        print_failure(label, status, content_type, body)
        return None, False

    if body_looks_like_html(body):
        print(f"FAIL: {label} returned HTML instead of JSON")
        print(f"content-type: {content_type}")
        print(body[:500])
        return None, False

    try:
        parsed = parse_json(body)
    except Exception as error:
        print(f"FAIL: {label} is not valid JSON")
        print(f"content-type: {content_type}")
        print(body[:500])
        print(f"error: {error}")
        return None, False

    if not isinstance(parsed, expected_type):
        print(f"FAIL: {label} returned {type(parsed).__name__}, expected {expected_type.__name__}")
        print(f"content-type: {content_type}")
        print(body[:500])
        return None, False

    return parsed, True


def post_json(base_url: str, path: str, payload: dict, label: str) -> tuple[dict | None, bool]:
    status, content_type, body = request("POST", make_url(base_url, path), payload)
    if status is None:
        print_failure(label, status, content_type, body)
        return None, False

    if status >= 500:
        print_failure(label, status, content_type, body)
        return None, False

    if status not in (200, 201):
        print_failure(label, status, content_type, body)
        return None, False

    if body_looks_like_html(body):
        print(f"FAIL: {label} returned HTML instead of JSON")
        print(f"content-type: {content_type}")
        print(body[:500])
        return None, False

    try:
        parsed = parse_json(body)
    except Exception as error:
        print(f"FAIL: {label} is not valid JSON")
        print(f"content-type: {content_type}")
        print(body[:500])
        print(f"error: {error}")
        return None, False

    if not isinstance(parsed, dict):
        print(f"FAIL: {label} returned {type(parsed).__name__}, expected dict")
        print(f"content-type: {content_type}")
        print(body[:500])
        return None, False

    if not parsed.get("id"):
        print(f"FAIL: {label} response has no id")
        print(body[:500])
        return None, False

    return parsed, True


def contains_id(items: list[object], record_id: str) -> bool:
    return any(isinstance(item, dict) and item.get("id") == record_id for item in items)


def delete_and_verify(base_url: str, path: str, record_id: str, list_path: str) -> bool:
    status, content_type, body = request("DELETE", make_url(base_url, path))
    if status is None:
        print(f"WARNING: delete failed for {record_id} (request error)")
    elif status >= 500:
        print(f"WARNING: delete failed for {record_id} with status {status}")
        print(f"content-type: {content_type}")
        print(body[:500])
    elif status not in (200, 204, 404):
        print(f"WARNING: delete returned status {status} for {record_id}")
        print(f"content-type: {content_type}")
        print(body[:500])

    items, ok = check_json_endpoint(base_url, list_path, f"cleanup verify {list_path}", list)
    if not ok:
        return False

    if contains_id(items, record_id):
        print(f"WARNING: record still present after delete: {record_id}")
        return False

    return True


def build_brew_payload(stamp: str) -> dict:
    return {
        "folderId": None,
        "lotName": f"TEST SMOKE V60 {stamp}",
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
        "notes": "created by scripts/check_production.py",
    }


def build_batch_payload(stamp: str) -> dict:
    return {
        "folderId": None,
        "lotName": f"TEST SMOKE BATCH {stamp}",
        "roaster": "TEST",
        "thermosVolumeMl": 1000,
        "ratio": "60 g/l",
        "brewerProgram": "TEST PROGRAM",
        "coffeeDoseG": 60,
        "grindClicks": "7.0",
        "waterVolumeMl": 1000,
        "notes": "created by scripts/check_production.py",
    }


def build_signature_payload(stamp: str) -> dict:
    return {
        "folderId": None,
        "drinkName": f"TEST SMOKE SIGNATURE {stamp}",
        "category": "cold",
        "servingVolumeMl": 300,
        "vessel": "test glass",
        "ingredients": [
            {"ingredientName": "Test ingredient", "exactAmount": "1 pc"},
        ],
        "serviceSteps": ["Mix and serve."],
        "allergensAndComposition": "",
        "storageConditions": "",
        "notes": "created by scripts/check_production.py",
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--production-smoke", action="store_true", help="Run non-destructive production checks")
    parser.add_argument("--crud-smoke", action="store_true", help="Run create/list/delete smoke tests")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    base_url = args.base_url.rstrip("/")
    production_smoke = True if not args.production_smoke and not args.crud_smoke else args.production_smoke or args.crud_smoke
    crud_smoke = bool(args.crud_smoke)

    report = {
        "health": "FAIL",
        "brew_bar_get": "FAIL",
        "batch_brew_get": "FAIL",
        "signature_ttk_get": "FAIL",
        "pastry_get": "FAIL",
        "checklist_get": "FAIL",
        "crud_smoke": "SKIPPED",
        "created_test_records_cleaned": "skipped",
        "overall": "FAIL",
    }

    overall_ok = True

    if production_smoke:
        health_json, ok = check_json_endpoint(base_url, "/api/health", "GET /api/health", dict)
        if not ok:
            overall_ok = False
        else:
            report["health"] = "PASS"
            if isinstance(health_json, dict) and health_json.get("status") not in (None, "ok"):
                print("FAIL: /api/health returned unexpected payload")
                print(json.dumps(health_json, ensure_ascii=False)[:500])
                overall_ok = False
                report["health"] = "FAIL"

        checks = [
            ("/api/recipes/brew-bar", "GET /api/recipes/brew-bar", "brew_bar_get"),
            ("/api/recipes/batch-brew", "GET /api/recipes/batch-brew", "batch_brew_get"),
            ("/api/recipes/signature-ttk", "GET /api/recipes/signature-ttk", "signature_ttk_get"),
            ("/api/items?category=pastry", "GET /api/items?category=pastry", "pastry_get"),
            ("/api/items?category=checklist", "GET /api/items?category=checklist", "checklist_get"),
        ]

        for path, label, report_key in checks:
            _, ok = check_json_endpoint(base_url, path, label, list)
            if ok:
                report[report_key] = "PASS"
            else:
                overall_ok = False

    created_records: list[dict[str, str]] = []

    if crud_smoke:
        stamp = utc_stamp()

        brew_payload = build_brew_payload(stamp)
        brew_json, ok = post_json(base_url, "/api/recipes/brew-bar", brew_payload, "POST /api/recipes/brew-bar")
        if not ok:
            overall_ok = False
        else:
            brew_id = str(brew_json["id"])
            items, ok = check_json_endpoint(base_url, "/api/recipes/brew-bar", "VERIFY /api/recipes/brew-bar", list)
            if not ok or not contains_id(items, brew_id):
                print("FAIL: created brew-bar recipe did not appear in GET list")
                overall_ok = False
            else:
                created_records.append({
                    "id": brew_id,
                    "type": "brew-bar",
                    "delete_path": f"/api/recipes/brew-bar/{brew_id}",
                    "list_path": "/api/recipes/brew-bar",
                    "label": brew_payload["lotName"],
                })

        batch_payload = build_batch_payload(stamp)
        batch_json, ok = post_json(base_url, "/api/recipes/batch-brew", batch_payload, "POST /api/recipes/batch-brew")
        if not ok:
            overall_ok = False
        else:
            batch_id = str(batch_json["id"])
            items, ok = check_json_endpoint(base_url, "/api/recipes/batch-brew", "VERIFY /api/recipes/batch-brew", list)
            if not ok or not contains_id(items, batch_id):
                print("FAIL: created batch-brew recipe did not appear in GET list")
                overall_ok = False
            else:
                created_records.append({
                    "id": batch_id,
                    "type": "batch-brew",
                    "delete_path": f"/api/recipes/batch-brew/{batch_id}",
                    "list_path": "/api/recipes/batch-brew",
                    "label": batch_payload["lotName"],
                })

        signature_payload = build_signature_payload(stamp)
        signature_json, ok = post_json(base_url, "/api/recipes/signature-ttk", signature_payload, "POST /api/recipes/signature-ttk")
        if not ok:
            overall_ok = False
        else:
            signature_id = str(signature_json["id"])
            items, ok = check_json_endpoint(base_url, "/api/recipes/signature-ttk", "VERIFY /api/recipes/signature-ttk", list)
            if not ok or not contains_id(items, signature_id):
                print("FAIL: created signature-ttk recipe did not appear in GET list")
                overall_ok = False
            else:
                created_records.append({
                    "id": signature_id,
                    "type": "signature-ttk",
                    "delete_path": f"/api/recipes/signature-ttk/{signature_id}",
                    "list_path": "/api/recipes/signature-ttk",
                    "label": signature_payload["drinkName"],
                })

        cleanup_ok = True
        if created_records:
            for record in created_records:
                cleaned = delete_and_verify(base_url, record["delete_path"], record["id"], record["list_path"])
                if not cleaned:
                    cleanup_ok = False
            report["created_test_records_cleaned"] = "yes" if cleanup_ok else "no"
        else:
            report["created_test_records_cleaned"] = "skipped"

        report["crud_smoke"] = "PASS" if cleanup_ok and overall_ok else "FAIL"
        overall_ok = overall_ok and cleanup_ok

    if not crud_smoke:
        report["crud_smoke"] = "SKIPPED"
        report["created_test_records_cleaned"] = "skipped"

    report["overall"] = "PASS" if overall_ok else "FAIL"

    print()
    print("PRODUCTION SMOKE REPORT")
    print()
    print(f"* health: {report['health']}")
    print(f"* brew-bar GET: {report['brew_bar_get']}")
    print(f"* batch-brew GET: {report['batch_brew_get']}")
    print(f"* signature-ttk GET: {report['signature_ttk_get']}")
    print(f"* pastry GET: {report['pastry_get']}")
    print(f"* checklist GET: {report['checklist_get']}")
    print(f"* crud smoke: {report['crud_smoke']}")
    print(f"* created test records cleaned: {report['created_test_records_cleaned']}")
    print(f"* overall: {report['overall']}")

    return 0 if overall_ok else 1


if __name__ == "__main__":
    sys.exit(main())
