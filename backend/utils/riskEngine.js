const CRITICAL_SERVICES = ["mysql", "mssql", "rdp", "telnet", "ftp"];

/**
 * Takes a raw per-host result from the Python engine and returns
 * a normalized risk object. The Python engine already computes a base
 * score from dangerous ports / OS unknowns; here we can layer on
 * organization-specific policy (e.g. asset criticality tags, exposure
 * to internet vs internal network) without touching the scan engine.
 */
export function refineRisk(hostResult, { isInternetFacing = false, criticalityMultiplier = 1 } = {}) {
  let { score, level, reasons } = hostResult.risk;
  reasons = [...reasons];

  if (isInternetFacing) {
    score += 10;
    reasons.push("Asset is internet-facing, increasing exposure");
  }

  score = Math.min(100, Math.round(score * criticalityMultiplier));

  if (score >= 70) level = "Critical";
  else if (score >= 50) level = "High";
  else if (score >= 25) level = "Medium";
  else if (score > 0) level = "Low";
  else level = "Informational";

  return { score, level, reasons };
}

export function summarizeRisk(results) {
  const summary = { Critical: 0, High: 0, Medium: 0, Low: 0, Informational: 0 };
  for (const r of results) {
    summary[r.risk.level] = (summary[r.risk.level] || 0) + 1;
  }
  return summary;
}
