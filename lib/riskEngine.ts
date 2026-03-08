/**
 * ============================================================
 * Dynamic Risk Engine
 * 
 * Calculates supplier risk based on:
 * - Regional conditions (geopolitical, weather, logistics)
 * - Supplier base risk
 * - Multi-dimensional risk factors
 * 
 * Formula Weights:
 *   finalRiskScore = 0.4 * regionalRisk +
 *                    0.3 * logisticsRisk +
 *                    0.2 * weatherRisk +
 *                    0.1 * supplierBaseRisk
 * ============================================================
 */

import { getRegionalRiskProfile } from "./regionRisk";

export interface RiskCalculationInput {
  region: string;
  supplierBaseRisk: number;
  geopoliticalRisk?: number;
  weatherRisk?: number;
  shippingRisk?: number;
}

export interface RiskCalculationResult {
  finalRiskScore: number;
  regionalRiskComponent: number;
  logisticsRiskComponent: number;
  weatherRiskComponent: number;
  baseRiskComponent: number;
  breakdown: {
    regional: number;
    logistics: number;
    weather: number;
    base: number;
  };
}

/**
 * Concentration risk result with warning level
 */
export interface ConcentrationRiskResult {
  regionalConcentrationMap: Map<string, number>;
  nodeConcentrationRisks: Map<string, number>; // Maps nodeId -> concentration risk
  warningLevel: "low" | "medium" | "high" | "critical";
  mostConcentratedRegion: {
    region: string;
    percentage: number;
    nodeCount: number;
    risk: number;
  } | null;
}

/**
 * Calculate supplier risk based on region and supplier characteristics
 * 
 * @param region - Geographic region of supplier
 * @param supplierBaseRisk - Inherent supplier risk (0-100)
 * @returns Normalized risk score (0-100)
 */
export function calculateSupplierRisk(
  region: string,
  supplierBaseRisk: number
): number {
  const result = calculateDetailedSupplierRisk(region, supplierBaseRisk);
  return result.finalRiskScore;
}

/**
 * Calculate supplier risk with detailed breakdown
 * Useful for analytics and debugging
 */
export function calculateDetailedSupplierRisk(
  region: string,
  supplierBaseRisk: number,
  geopoliticalRisk?: number,
  weatherRisk?: number,
  shippingRisk?: number
): RiskCalculationResult {
  const regionalProfile = getRegionalRiskProfile(region);

  // Use supplied risk components or fall back to regional profile
  const actualWeatherRisk = weatherRisk ?? regionalProfile.weather;
  const actualShippingRisk = shippingRisk ?? regionalProfile.logistics;
  const actualGeopoliticalRisk = geopoliticalRisk ?? regionalProfile.geopolitical;

  // Average regional factors as the regional risk component
  const avgRegionalRisk = (actualGeopoliticalRisk + actualWeatherRisk + actualShippingRisk) / 3;

  // Component weights
  const regionalComponent = 0.4 * avgRegionalRisk;
  const logisticsComponent = 0.3 * actualShippingRisk;
  const weatherComponent = 0.2 * actualWeatherRisk;
  const baseComponent = 0.1 * supplierBaseRisk;

  // Calculate weighted final risk
  let finalRiskScore = 
    regionalComponent + 
    logisticsComponent + 
    weatherComponent + 
    baseComponent;

  // Clamp to 0-100 range
  finalRiskScore = Math.max(0, Math.min(100, finalRiskScore));

  return {
    finalRiskScore: Math.round(finalRiskScore),
    regionalRiskComponent: Math.round(avgRegionalRisk),
    logisticsRiskComponent: Math.round(actualShippingRisk),
    weatherRiskComponent: Math.round(actualWeatherRisk),
    baseRiskComponent: supplierBaseRisk,
    breakdown: {
      regional: Math.round(regionalComponent),
      logistics: Math.round(logisticsComponent),
      weather: Math.round(weatherComponent),
      base: Math.round(baseComponent),
    },
  };
}

/**
 * Apply dynamic risk calculations to a list of suppliers
 * Returns new nodes with updated risk scores
 * Uses supplier's existing risk components when available
 */
export function applyDynamicRiskToNodes<
  T extends { 
    id: string
    risk_score: number
    region: string
    geopolitical_risk?: number
    weather_risk?: number
    shipping_risk?: number
  }
>(nodes: T[]): T[] {
  return nodes.map((node) => {
    const detailedRisk = calculateDetailedSupplierRisk(
      node.region,
      node.risk_score,
      node.geopolitical_risk,
      node.weather_risk,
      node.shipping_risk
    );
    
    return {
      ...node,
      risk_score: detailedRisk.finalRiskScore,
    };
  });
}

/**
 * Recalculate average risk across nodes
 * Updated to reflect dynamic risk scores
 */
export function calculateAverageRisk(nodes: { risk_score: number }[]): number {
  if (nodes.length === 0) return 0;
  const total = nodes.reduce((sum, node) => sum + node.risk_score, 0);
  return Math.round(total / nodes.length);
}

/**
 * Count high-risk suppliers (risk_score > threshold)
 */
export function countHighRiskSuppliers(
  nodes: { risk_score: number }[],
  threshold: number = 55
): number {
  return nodes.filter((node) => node.risk_score > threshold).length;
}

/**
 * Get risk analysis summary for a node
 * Useful for detailed risk breakdowns in UI
 */
export function getRiskAnalysisSummary(
  nodeName: string,
  region: string,
  currentRiskScore: number,
  riskDetails: RiskCalculationResult
): string {
  return `${nodeName} in ${region} has a dynamic risk score of ${currentRiskScore} (Geopolitical: ${riskDetails.breakdown.regional}, Logistics: ${riskDetails.breakdown.logistics}, Weather: ${riskDetails.breakdown.weather}, Base: ${riskDetails.breakdown.base})`;
}

/**
 * ============================================================
 * GEOGRAPHIC CONCENTRATION RISK
 * Detects supply chain fragility due to regional clustering
 * ============================================================
 */

/**
 * Convert concentration ratio to risk score
 * <10% → 10, 10-20% → 25, 20-30% → 40, 30-40% → 60, >40% → 80
 */
function concentrationRatioToRisk(ratio: number): number {
  if (ratio < 0.1) return 10;   // Very low concentration
  if (ratio < 0.2) return 25;   // Low concentration
  if (ratio < 0.3) return 40;   // Moderate concentration
  if (ratio < 0.4) return 60;   // High concentration
  return 80;                     // Critical concentration
}

/**
 * Calculate geographic concentration risk
 * Returns region-level concentration risk scores and per-node concentration risks
 * 
 * @param nodes - Array of supplier nodes
 * @returns ConcentrationRiskResult with regional risks and per-node impacts
 */
export function calculateGeographicConcentrationRisk(
  nodes: { id: string; region: string }[]
): ConcentrationRiskResult {
  if (nodes.length === 0) {
    return {
      regionalConcentrationMap: new Map(),
      nodeConcentrationRisks: new Map(),
      warningLevel: "low",
      mostConcentratedRegion: null,
    };
  }

  // Count nodes per region
  const regionCounts = new Map<string, number>();
  nodes.forEach((node) => {
    const current = regionCounts.get(node.region) || 0;
    regionCounts.set(node.region, current + 1);
  });

  // Calculate concentration risk per region
  const totalNodes = nodes.length;
  const regionalConcentrationMap = new Map<string, number>();
  let maxRisk = 0;
  let mostConcentratedRegion: { region: string; percentage: number; nodeCount: number; risk: number } | null = null;

  regionCounts.forEach((count, region) => {
    const ratio = count / totalNodes;
    const risk = concentrationRatioToRisk(ratio);
    regionalConcentrationMap.set(region, risk);

    if (risk > maxRisk) {
      maxRisk = risk;
      mostConcentratedRegion = {
        region,
        percentage: Math.round(ratio * 100),
        nodeCount: count,
        risk,
      };
    }
  });

  // Map concentration risk to each node
  const nodeConcentrationRisks = new Map<string, number>();
  nodes.forEach((node) => {
    const concentrationRisk = regionalConcentrationMap.get(node.region) || 0;
    nodeConcentrationRisks.set(node.id, concentrationRisk);
  });

  // Determine warning level based on max concentration
  let warningLevel: "low" | "medium" | "high" | "critical" = "low";
  if (maxRisk >= 60) warningLevel = "critical";
  else if (maxRisk >= 40) warningLevel = "high";
  else if (maxRisk >= 25) warningLevel = "medium";

  return {
    regionalConcentrationMap,
    nodeConcentrationRisks,
    warningLevel,
    mostConcentratedRegion,
  };
}

/**
 * Apply geographic concentration risk to existing risk scores
 * Integrates concentration risk with a 15% weight without breaking existing formula
 * 
 * Formula: FinalRisk = ExistingRisk + (0.15 × GeographicConcentrationRisk)
 * Clamped to [0, 100]
 * 
 * @param nodes - Array of supplier nodes with existing risk_score
 * @returns New nodes with updated risk scores incorporating concentration risk
 */
export function applyGeographicConcentrationRiskToNodes<
  T extends { 
    id: string
    risk_score: number
    region: string
    concentration_risk?: number
  }
>(nodes: T[]): T[] {
  const concentrationResult = calculateGeographicConcentrationRisk(nodes);

  return nodes.map((node) => {
    const concentrationRisk = concentrationResult.nodeConcentrationRisks.get(node.id) || 0;
    
    // Apply concentration risk with 15% weight
    const concentrationComponent = 0.15 * concentrationRisk;
    const updatedRiskScore = node.risk_score + concentrationComponent;
    
    // Clamp to [0, 100]
    const clampedRiskScore = Math.max(0, Math.min(100, Math.round(updatedRiskScore)));

    return {
      ...node,
      risk_score: clampedRiskScore,
      concentration_risk: concentrationRisk,
    };
  });
}

/**
 * Get a human-readable warning message for geographic concentration
 * @param concentrationResult - Result from calculateGeographicConcentrationRisk
 * @returns Warning message string
 */
export function getConcentrationWarning(result: ConcentrationRiskResult): string {
  if (!result.mostConcentratedRegion) {
    return "No geographic concentration detected.";
  }

  const { region, percentage, risk } = result.mostConcentratedRegion;
  const riskLevel = result.warningLevel.toUpperCase();
  
  return `[${riskLevel}] High geographic concentration detected in ${region} (${percentage}% of supply chain). Concentration Risk: ${risk}/100`;
}
