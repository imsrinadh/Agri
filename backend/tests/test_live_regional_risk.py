import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import asyncio
from app.services.region_service import region_service
from app.api.regions import get_regions, get_region_detail, get_region_risk, get_regional_risk_summary

def test_live_regional_risk():
    print("--- 1. Testing region_service.get_all_regions ---")
    regions = region_service.get_all_regions(force_refresh=True)
    assert len(regions) >= 20, f"Expected >= 20 regions, got {len(regions)}"
    print(f"PASS: Loaded {len(regions)} agricultural regions.")

    print("\n--- 2. Verifying Andhra Pradesh Live Telemetry ---")
    ap = [r for r in regions if r["state"] == "Andhra Pradesh"][0]
    assert ap["data_status"] == "LIVE", f"Expected data_status == 'LIVE', got {ap['data_status']}"
    assert ap["telemetry"] is not None, "Expected telemetry to be populated"
    assert "temperature" in ap["telemetry"] and ap["telemetry"]["temperature"] is not None
    assert "humidity" in ap["telemetry"] and ap["telemetry"]["humidity"] is not None
    assert "precipitation_mm" in ap["telemetry"]
    assert "wind_speed_kmh" in ap["telemetry"]
    print(f"PASS: Andhra Pradesh Live Telemetry: {ap['telemetry']}")

    print("\n--- 3. Verifying Dynamic Contributing Factors ---")
    assert len(ap["factors"]) > 0, "Expected non-empty dynamic factors"
    for f in ap["factors"]:
        assert "Standard regional risk parameters" not in f
        print(f" - {f}")
    print("PASS: Dynamic contributing factors contain real metrics.")

    print("\n--- 4. Verifying Scientific Agronomic Recommendations ---")
    assert len(ap["recommendations"]) > 0, "Expected non-empty recommendations"
    for a in ap["recommendations"]:
        assert "Follow standard regional cropping advisory" not in a
        print(f" - {a}")
    print("PASS: Agronomic recommendations are specific and actionable.")

    print("\n--- 5. Verifying District Breakdown ---")
    assert len(ap["districts"]) >= 4, f"Expected >= 4 districts in AP, got {len(ap['districts'])}"
    district_names = [d["name"] for d in ap["districts"]]
    print(f"PASS: Districts in AP: {district_names}")
    assert "Guntur" in district_names
    assert "Nellore" in district_names

    print("\n--- 6. Verifying get_region_detail('AP-NLR') for Nellore ---")
    nlr = region_service.get_region_by_id("AP-NLR")
    assert nlr["region_name"] == "Nellore"
    assert nlr["state"] == "Andhra Pradesh"
    assert nlr["data_status"] == "LIVE"
    print(f"PASS: District detail fetched: {nlr['region_name']} in {nlr['state']}")

    print("\n--- 7. Verifying Platform Summary ---")
    summary = region_service.get_risk_summary()
    assert summary["data_status"] == "LIVE"
    assert summary["total_regions"] >= 20
    assert "average_risk_score" in summary
    print(f"PASS: Summary verified: {summary['total_regions']} regions, average risk: {summary['average_risk_score']}")

    print("\n=== ALL REGIONAL RISK AUDIT CHECKS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    test_live_regional_risk()
