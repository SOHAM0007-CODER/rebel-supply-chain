// ============================================================
// Alternative Supplier Finder
// Finds alternative suppliers for disrupted supply chains
// ============================================================

import { SupplierNode, SupplyEdge } from "./mockData";

export interface AlternativeResult {
    disabledNode: SupplierNode;
    alternatives: {
        node: SupplierNode;
        tier: number;
        distance: number;
        risk: number;
        rankScore: number;
        score: number;
        regionDiversified: boolean;
        riskReduction: number;
        costDelta: number;
    }[];
}

/**
 * Finds alternative suppliers for nodes that have been disabled/disrupted
 * Returns a list of potential replacements with their characteristics
 */
export function findAllAlternatives(
    disabledSet: Set<string>,
    nodes: SupplierNode[],
    edges: SupplyEdge[]
): AlternativeResult[] {
    const results: AlternativeResult[] = [];

    // For each disabled node, find potential alternatives
    for (const disabledId of disabledSet) {
        const disabledNode = nodes.find((n) => n.id === disabledId);
        if (!disabledNode) continue;

        // Find alternative suppliers with similar capabilities (same tier recommendation)
        const alternatives = nodes
            .filter(
                (n) =>
                    n.id !== disabledId &&
                    !disabledSet.has(n.id) &&
                    n.tier <= disabledNode.tier + 1 // Allow slightly lower tier as alternative
            )
            .map((n) => ({
                node: n,
                tier: n.tier,
                distance: Math.random() * 100, // Placeholder for actual distance calculation
                risk: n.risk_score || 0,
                rankScore: (n.risk_score || 0) * 0.6 + Math.random() * 0.4, // Weighted score for ranking
                score: Math.round(100 - (n.risk_score || 0) * 0.6 - (n.cost_score || 0) * 0.4),
                regionDiversified: n.region !== disabledNode.region,
                riskReduction: Math.round((disabledNode.risk_score || 0) - (n.risk_score || 0)),
                costDelta: Math.round((n.cost_score || 0) - (disabledNode.cost_score || 0)),
            }))
            .sort((a, b) => a.rankScore - b.rankScore) // Sort by ranking
            .slice(0, 5); // Return top 5 alternatives

        results.push({
            disabledNode,
            alternatives,
        });
    }

    return results;
}
