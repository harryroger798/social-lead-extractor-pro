#!/usr/bin/env python3
"""
SnapLeads Weekly Incremental Sync
Checks leads.cm (vorbidden.com) for new datasets and uploads them to iDrive S3.
Designed to run as a GitHub Actions cron job every Sunday 2 AM UTC.

Architecture:
  - LinkedIn: Probes max_dataset+1 for each of 187 countries
  - Instagram: Probes current_max+1 sequentially until 2 consecutive 404s
  - Technology: HEAD request to check if CSV file size changed
  - All new data -> converted to CSV -> uploaded to iDrive S3
  - Progress/manifest updated on S3

Environment variables (set in GitHub Actions secrets):
  S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY
"""

import json
import csv
import io
import os
import sys
import time
import traceback
import requests
import boto3
from botocore.config import Config
from datetime import datetime

# === Configuration (from env vars or defaults) ===
BASE_URL = "https://vorbidden.com"
S3_ENDPOINT = os.environ.get("S3_ENDPOINT", "https://s3.us-west-1.idrivee2.com")
S3_BUCKET = os.environ.get("S3_BUCKET", "crop-spray-uploads")
S3_ACCESS_KEY = os.environ.get("S3_ACCESS_KEY", "")
S3_SECRET_KEY = os.environ.get("S3_SECRET_KEY", "")
S3_REGION = os.environ.get("S3_REGION", "us-west-1")
S3_PREFIX = "leads-cm-database"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://app.leads.cm/",
    "Accept": "application/json",
}

# Full 187-country mapping (country -> last known max dataset number)
COUNTRY_MAX_DATASETS = {
    "United_States": 670, "India": 120, "United_Kingdom": 116, "Brazil": 73,
    "Canada": 68, "France": 59, "Netherlands": 50, "Australia": 45,
    "Italy": 37, "Spain": 35, "Germany": 28, "Mexico": 25,
    "Afghanistan": 2, "Albania": 2, "Algeria": 3, "Andorra": 2,
    "Angola": 2, "Antigua_and_Barbuda": 2, "Argentina": 16, "Armenia": 2,
    "Austria": 5, "Azerbaijan": 2, "Bahrain": 2, "Bangladesh": 4,
    "Barbados": 2, "Belarus": 2, "Belgium": 16, "Belize": 2,
    "Benin": 2, "Bhutan": 2, "Bolivia": 2, "Bosnia_and_Herzegovina": 2,
    "Botswana": 2, "Brunei": 2, "Bulgaria": 3, "Burkina_Faso": 2,
    "Burundi": 2, "Cambodia": 2, "Cameroon": 2, "Central_African_Republic": 2,
    "Chad": 2, "Chile": 13, "China": 19, "Colombia": 12,
    "Comoros": 2, "Costa_Rica": 3, "Croatia": 3, "Cuba": 2,
    "Cyprus": 2, "Czech_Republic": 9, "Denmark": 11, "Djibouti": 2,
    "Dominica": 2, "Dominican_Republic": 3, "Ecuador": 4, "Egypt": 8,
    "El_Salvador": 2, "Equatorial_Guinea": 2, "Eritrea": 2, "Estonia": 2,
    "Eswatini": 2, "Ethiopia": 2, "Fiji": 2, "Finland": 7,
    "Gabon": 2, "Georgia": 2, "Ghana": 3, "Greece": 5,
    "Grenada": 2, "Guatemala": 2, "Guinea": 2, "Guinea-Bissau": 2,
    "Guyana": 2, "Haiti": 2, "Honduras": 2, "Hungary": 4,
    "Iceland": 2, "Indonesia": 13, "Iran": 5, "Iraq": 2,
    "Ireland": 9, "Israel": 7, "Jamaica": 2, "Japan": 6,
    "Jordan": 3, "Kazakhstan": 2, "Kenya": 5, "Kiribati": 2,
    "Kosovo": 2, "Kuwait": 3, "Kyrgyzstan": 2, "Laos": 2,
    "Latvia": 2, "Lebanon": 3, "Lesotho": 2, "Liberia": 2,
    "Libya": 2, "Liechtenstein": 2, "Lithuania": 2, "Luxembourg": 2,
    "Madagascar": 2, "Malawi": 2, "Malaysia": 10, "Maldives": 2,
    "Mali": 2, "Malta": 2, "Marshall_Islands": 2, "Mauritania": 2,
    "Mauritius": 2, "Micronesia": 2, "Moldova": 2, "Monaco": 2,
    "Mongolia": 2, "Montenegro": 2, "Morocco": 4, "Mozambique": 2,
    "Namibia": 2, "Nauru": 2, "Nepal": 2, "New_Zealand": 8,
    "Nicaragua": 2, "Niger": 2, "Nigeria": 18, "North_Macedonia": 2,
    "Norway": 9, "Oman": 3, "Pakistan": 9, "Palau": 2,
    "Palestine": 2, "Panama": 2, "Papua_New_Guinea": 2, "Paraguay": 2,
    "Peru": 9, "Philippines": 12, "Poland": 10, "Portugal": 8,
    "Qatar": 4, "Romania": 8, "Russia": 8, "Rwanda": 2,
    "Saint_Kitts_and_Nevis": 2, "Saint_Lucia": 2,
    "Saint_Vincent_and_the_Grenadines": 2, "Samoa": 2, "San_Marino": 2,
    "Saudi_Arabia": 10, "Senegal": 2, "Serbia": 3, "Seychelles": 2,
    "Sierra_Leone": 2, "Singapore": 10, "Slovakia": 3, "Slovenia": 2,
    "Solomon_Islands": 2, "Somalia": 2, "South_Africa": 11, "South_Korea": 5,
    "South_Sudan": 2, "Sri_Lanka": 3, "Sudan": 2, "Suriname": 2,
    "Sweden": 19, "Switzerland": 10, "Syria": 2, "Taiwan": 5,
    "Tajikistan": 2, "Tanzania": 2, "Thailand": 5, "Togo": 2,
    "Tonga": 2, "Trinidad_and_Tobago": 2, "Tunisia": 3, "Turkey": 17,
    "Turkmenistan": 2, "Tuvalu": 2, "Uganda": 2, "Ukraine": 5,
    "United_Arab_Emirates": 15, "Uruguay": 3, "Uzbekistan": 2, "Vanuatu": 2,
    "Vatican_City": 2, "Venezuela": 5, "Vietnam": 4, "Yemen": 2,
    "Zambia": 2, "Zimbabwe": 2,
}

INSTAGRAM_MAX_DATASET = 160

TECHNOLOGIES = [
    "Shopify", "ClickFunnels", "Hubspot", "HighLevel", "Wistia",
    "Kajabi", "Calendly", "Magento", "Shopify1-10M", "MailChimp",
    "Intercom", "ActiveCampaign", "Typeform", "LuckyOrange", "Stripe",
    "ThriveCart", "PrestaShop", "PracticeBetter", "Kong", "ActiveProspect",
    "SimplePractice",
]


def get_s3():
    return boto3.client(
        "s3",
        endpoint_url=S3_ENDPOINT,
        aws_access_key_id=S3_ACCESS_KEY,
        aws_secret_access_key=S3_SECRET_KEY,
        region_name=S3_REGION,
        config=Config(signature_version="s3v4", retries={"max_attempts": 3}),
    )


def probe_url(url):
    """Check if a URL returns 200 (data exists) or 404 (no data)."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        return resp.status_code
    except Exception:
        return 0


def download_json(url):
    """Download JSON data from vorbidden.com."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=120)
        if resp.status_code != 200:
            return None
        data = resp.json()
        if "headers" not in data or "rows" not in data:
            return None
        return data
    except Exception:
        return None


def json_to_csv_bytes(headers, rows):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(headers)
    w.writerows(rows)
    return buf.getvalue().encode("utf-8")


def upload_csv(s3, csv_bytes, s3_key):
    s3.put_object(Bucket=S3_BUCKET, Key=s3_key, Body=csv_bytes, ContentType="text/csv")


def load_sync_state(s3):
    """Load the weekly sync state from S3."""
    try:
        obj = s3.get_object(Bucket=S3_BUCKET, Key=f"{S3_PREFIX}/weekly_sync_state.json")
        return json.loads(obj["Body"].read())
    except Exception:
        return {
            "country_max": dict(COUNTRY_MAX_DATASETS),
            "instagram_max": INSTAGRAM_MAX_DATASET,
            "last_sync": None,
            "total_new_records": 0,
            "sync_history": [],
        }


def save_sync_state(s3, state):
    """Save weekly sync state to S3."""
    s3.put_object(
        Bucket=S3_BUCKET,
        Key=f"{S3_PREFIX}/weekly_sync_state.json",
        Body=json.dumps(state, indent=2).encode(),
        ContentType="application/json",
    )


def check_linkedin(s3, state):
    """Probe each country for new datasets beyond known max."""
    print("\n=== PHASE 1: LinkedIn Probe (187 countries) ===")
    new_datasets = []
    for country, max_ds in state["country_max"].items():
        probe_num = max_ds + 1
        url = f"{BASE_URL}/{country}/{probe_num}.json"
        status = probe_url(url)
        if status == 200:
            print(f"  [NEW] {country} has dataset {probe_num}!")
            new_datasets.append((country, probe_num))
        time.sleep(0.3)
    print(f"  LinkedIn probe complete: {len(new_datasets)} new datasets found")
    return new_datasets


def download_linkedin_new(s3, state, new_datasets):
    """Download and upload all new LinkedIn datasets found."""
    total_new = 0
    for country, start_num in new_datasets:
        consecutive_404 = 0
        n = start_num
        while consecutive_404 < 2:
            url = f"{BASE_URL}/{country}/{n}.json"
            print(f"  [DOWNLOAD] {country}/{n}.json ...", end=" ", flush=True)
            data = download_json(url)
            if data is None:
                consecutive_404 += 1
                print("404")
                n += 1
                continue
            consecutive_404 = 0
            rows = data["rows"]
            num = len(rows)
            csv_bytes = json_to_csv_bytes(data["headers"], rows)
            s3_key = f"{S3_PREFIX}/linkedin/{country}/dataset_{n}.csv"
            upload_csv(s3, csv_bytes, s3_key)
            total_new += num
            state["country_max"][country] = n
            print(f"OK - {num} records")
            n += 1
            time.sleep(0.5)
    return total_new


def check_instagram(s3, state):
    """Probe for new Instagram datasets beyond known max."""
    print("\n=== PHASE 2: Instagram Probe ===")
    current_max = state["instagram_max"]
    new_datasets = []
    consecutive_404 = 0
    n = current_max + 1
    while consecutive_404 < 2:
        url = f"{BASE_URL}/Instagram/{n}.json"
        status = probe_url(url)
        if status == 200:
            print(f"  [NEW] Instagram dataset {n} found!")
            new_datasets.append(n)
            consecutive_404 = 0
        else:
            consecutive_404 += 1
        n += 1
        time.sleep(0.3)
    print(f"  Instagram probe complete: {len(new_datasets)} new datasets found")
    return new_datasets


def download_instagram_new(s3, state, new_datasets):
    """Download and upload all new Instagram datasets."""
    total_new = 0
    for n in new_datasets:
        url = f"{BASE_URL}/Instagram/{n}.json"
        print(f"  [DOWNLOAD] Instagram/{n}.json ...", end=" ", flush=True)
        data = download_json(url)
        if data is None:
            print("FAILED")
            continue
        rows = data["rows"]
        num = len(rows)
        csv_bytes = json_to_csv_bytes(data["headers"], rows)
        s3_key = f"{S3_PREFIX}/instagram/dataset_{n}.csv"
        upload_csv(s3, csv_bytes, s3_key)
        total_new += num
        state["instagram_max"] = max(state["instagram_max"], n)
        print(f"OK - {num} records")
        time.sleep(0.5)
    return total_new


def check_technology(s3, state):
    """Check if technology CSV files have changed (by Content-Length)."""
    print("\n=== PHASE 3: Technology Probe (21 technologies) ===")
    for tech in TECHNOLOGIES:
        url = f"{BASE_URL}/TLClean/{tech}/{tech}_100%25.csv"
        try:
            resp = requests.head(url, headers=HEADERS, timeout=15)
            if resp.status_code == 200:
                size = resp.headers.get("Content-Length", "unknown")
                print(f"  [OK] {tech}: {size} bytes")
            else:
                print(f"  [{resp.status_code}] {tech}")
        except Exception as e:
            print(f"  [ERROR] {tech}: {e}")
        time.sleep(0.3)


def main():
    start_time = datetime.utcnow()
    print("=" * 60)
    print("SNAPLEADS WEEKLY INCREMENTAL SYNC")
    print(f"Started: {start_time.isoformat()} UTC")
    print("=" * 60)

    s3 = get_s3()
    state = load_sync_state(s3)
    print(f"[STATE] Last sync: {state.get('last_sync', 'never')}")
    print(f"[STATE] LinkedIn max datasets known for {len(state['country_max'])} countries")
    print(f"[STATE] Instagram max dataset: {state['instagram_max']}")

    total_new_records = 0
    sync_report = {
        "date": start_time.isoformat(),
        "linkedin_new": 0,
        "instagram_new": 0,
        "tech_changes": 0,
    }

    # Phase 1: LinkedIn
    try:
        li_new = check_linkedin(s3, state)
        if li_new:
            li_records = download_linkedin_new(s3, state, li_new)
            total_new_records += li_records
            sync_report["linkedin_new"] = li_records
            print(f"  [LINKEDIN] Downloaded {li_records:,} new records")
        else:
            print("  [LINKEDIN] No new datasets")
    except Exception as e:
        print(f"  [LINKEDIN ERROR] {e}")
        traceback.print_exc()

    # Phase 2: Instagram
    try:
        ig_new = check_instagram(s3, state)
        if ig_new:
            ig_records = download_instagram_new(s3, state, ig_new)
            total_new_records += ig_records
            sync_report["instagram_new"] = ig_records
            print(f"  [INSTAGRAM] Downloaded {ig_records:,} new records")
        else:
            print("  [INSTAGRAM] No new datasets")
    except Exception as e:
        print(f"  [INSTAGRAM ERROR] {e}")
        traceback.print_exc()

    # Phase 3: Technology (probe only)
    try:
        check_technology(s3, state)
    except Exception as e:
        print(f"  [TECH ERROR] {e}")

    # Save state
    state["last_sync"] = start_time.isoformat()
    state["total_new_records"] += total_new_records
    state["sync_history"].append(sync_report)
    state["sync_history"] = state["sync_history"][-52:]
    save_sync_state(s3, state)

    # Summary
    end_time = datetime.utcnow()
    duration = (end_time - start_time).total_seconds()
    print("\n" + "=" * 60)
    print("SYNC COMPLETE")
    print(f"Duration: {duration:.0f}s")
    print(f"New LinkedIn records: {sync_report['linkedin_new']:,}")
    print(f"New Instagram records: {sync_report['instagram_new']:,}")
    print(f"Total new records this run: {total_new_records:,}")
    print(f"Cumulative new records (all syncs): {state['total_new_records']:,}")
    print("=" * 60)


if __name__ == "__main__":
    main()
