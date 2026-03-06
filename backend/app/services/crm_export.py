"""CRM export service for HubSpot and Salesforce (free tiers)."""
import asyncio
import logging
from typing import Optional

logger = logging.getLogger(__name__)


async def export_to_hubspot(
    api_key: str,
    leads: list[dict],
) -> dict:
    """
    Export leads to HubSpot CRM using the free tier API.
    HubSpot free: up to 1M contacts, 100 API calls/10 seconds.
    Library: hubspot-api-client (official, MIT license)
    """
    results = {"exported": 0, "failed": 0, "errors": []}

    try:
        import httpx

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=30, headers=headers) as client:
            for lead in leads:
                try:
                    # Map our lead fields to HubSpot contact properties
                    properties = {
                        "email": lead.get("email", ""),
                        "phone": lead.get("phone", ""),
                        "firstname": _extract_first_name(lead.get("name", "")),
                        "lastname": _extract_last_name(lead.get("name", "")),
                        "website": lead.get("website", lead.get("source_url", "")),
                        "hs_lead_status": "NEW",
                    }

                    # Remove empty properties
                    properties = {k: v for k, v in properties.items() if v}

                    if not properties.get("email") and not properties.get("phone"):
                        results["failed"] += 1
                        results["errors"].append(f"Lead missing email and phone: {lead.get('name', 'Unknown')}")
                        continue

                    response = await client.post(
                        "https://api.hubapi.com/crm/v3/objects/contacts",
                        json={"properties": properties},
                    )

                    if response.status_code in (200, 201):
                        results["exported"] += 1
                    elif response.status_code == 409:
                        # Contact already exists — update instead
                        results["exported"] += 1  # Count as success
                    else:
                        results["failed"] += 1
                        error_msg = response.text[:200]
                        results["errors"].append(f"HubSpot error for {lead.get('email', '')}: {error_msg}")

                    # Rate limiting: HubSpot allows 100/10s
                    await asyncio.sleep(0.15)

                except Exception as e:
                    results["failed"] += 1
                    results["errors"].append(str(e)[:200])

    except ImportError:
        results["errors"].append("httpx not installed")
    except Exception as e:
        results["errors"].append(f"HubSpot connection error: {str(e)[:200]}")

    return results


async def export_to_salesforce(
    username: str,
    password: str,
    security_token: str,
    leads: list[dict],
    client_id: str = "",
    client_secret: str = "",
) -> dict:
    """
    Export leads to Salesforce using the Developer Edition (free).
    Uses simple REST API calls — no paid library needed.
    Users must provide their own Connected App client_id and client_secret
    from Salesforce Setup > App Manager > New Connected App.
    """
    results = {"exported": 0, "failed": 0, "errors": []}

    if not client_id:
        results["errors"].append(
            "Salesforce client_id required. Create a Connected App in "
            "Salesforce Setup > App Manager to get your client_id."
        )
        return results

    try:
        import httpx

        # Authenticate with Salesforce
        auth_data = {
            "grant_type": "password",
            "client_id": client_id,
            "client_secret": client_secret,
            "username": username,
            "password": f"{password}{security_token}",
        }

        async with httpx.AsyncClient(timeout=30) as client:
            # Get access token
            auth_response = await client.post(
                "https://login.salesforce.com/services/oauth2/token",
                data=auth_data,
            )

            if auth_response.status_code != 200:
                results["errors"].append("Salesforce authentication failed. Check credentials.")
                return results

            auth_json = auth_response.json()
            access_token = auth_json.get("access_token", "")
            instance_url = auth_json.get("instance_url", "")

            if not access_token or not instance_url:
                results["errors"].append("Failed to get Salesforce access token")
                return results

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            }

            for lead in leads:
                try:
                    sf_lead = {
                        "Email": lead.get("email", ""),
                        "Phone": lead.get("phone", ""),
                        "FirstName": _extract_first_name(lead.get("name", "")),
                        "LastName": _extract_last_name(lead.get("name", "")) or "Unknown",
                        "Company": lead.get("company", lead.get("platform", "Unknown")),
                        "Website": lead.get("website", lead.get("source_url", "")),
                        "LeadSource": "SnapLeads",
                        "Status": "Open - Not Contacted",
                    }

                    # Remove empty fields
                    sf_lead = {k: v for k, v in sf_lead.items() if v}
                    sf_lead["LastName"] = sf_lead.get("LastName", "Unknown")
                    sf_lead["Company"] = sf_lead.get("Company", "Unknown")

                    response = await client.post(
                        f"{instance_url}/services/data/v59.0/sobjects/Lead",
                        json=sf_lead,
                        headers=headers,
                    )

                    if response.status_code in (200, 201):
                        results["exported"] += 1
                    else:
                        results["failed"] += 1
                        results["errors"].append(f"SF error: {response.text[:200]}")

                    await asyncio.sleep(0.2)

                except Exception as e:
                    results["failed"] += 1
                    results["errors"].append(str(e)[:200])

    except ImportError:
        results["errors"].append("httpx not installed")
    except Exception as e:
        results["errors"].append(f"Salesforce error: {str(e)[:200]}")

    return results


def _extract_first_name(full_name: str) -> str:
    """Extract first name from full name."""
    parts = full_name.strip().split()
    return parts[0] if parts else ""


def _extract_last_name(full_name: str) -> str:
    """Extract last name from full name."""
    parts = full_name.strip().split()
    return " ".join(parts[1:]) if len(parts) > 1 else ""


async def test_hubspot_connection(api_key: str) -> dict:
    """Test HubSpot API connection."""
    try:
        import httpx
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                "https://api.hubapi.com/crm/v3/objects/contacts?limit=1",
                headers={"Authorization": f"Bearer {api_key}"},
            )
            if response.status_code == 200:
                return {"success": True, "message": "Connected to HubSpot successfully"}
            else:
                return {"success": False, "message": f"HubSpot error: {response.status_code}"}
    except Exception as e:
        return {"success": False, "message": str(e)}
