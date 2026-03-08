// ============================================================
// API Route: POST /api/analyze
// Runs full analysis on the supply chain or a specific node.
// Body: { nodeId?: string }
//   - If nodeId: returns analysis for that node
//   - If empty: returns full network analysis
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { suppliers, edges } from "@/lib/mockData";
import {
    calculateCascadingRisk,
    efficiencyRatio,
    detectSPOF,
    calculateConnectivity,
    generateMitigations,
    buildDownstreamGraph,
    buildUpstreamGraph,
} from "@/lib/algorithms";

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { nodeId } = body as { nodeId?: string };

    if (nodeId) {
        // Single-node analysis
        const node = suppliers.find((s) => s.id === nodeId);
        if (!node) {
            return NextResponse.json({ error: "Node not found" }, { status: 404 });
        }

        const cascading = calculateCascadingRisk(nodeId, suppliers, edges);
        const ratio = efficiencyRatio(node);
        const mitigations = generateMitigations(nodeId, suppliers, edges);
        const connectivity = calculateConnectivity(edges);
        const spofs = detectSPOF(suppliers, edges);
        const downstream = buildDownstreamGraph(edges);
        const upstream = buildUpstreamGraph(edges);

        return NextResponse.json({
            node,
            analysis: {
                cascading_risk: cascading,
                efficiency_ratio: ratio,
                connectivity: connectivity.get(nodeId) ?? 0,
                is_spof: spofs.includes(nodeId),
                downstream_count: downstream.get(nodeId)?.length ?? 0,
                upstream_count: upstream.get(nodeId)?.length ?? 0,
                downstream_ids: downstream.get(nodeId) ?? [],
                upstream_ids: upstream.get(nodeId) ?? [],
            },
            mitigations,
        });
    }

    // Full network analysis
    const spofs = detectSPOF(suppliers, edges);
    const connectivity = calculateConnectivity(edges);

    const nodeAnalyses = suppliers.map((node) => {
        const cascading = calculateCascadingRisk(node.id, suppliers, edges);
        const ratio = efficiencyRatio(node);
        const mits = generateMitigations(node.id, suppliers, edges);
        return {
            id: node.id,
            name: node.name,
            tier: node.tier,
            risk_score: node.risk_score,
            cost_score: node.cost_score,
            cascading_risk: cascading.cascading_risk_score,
            efficiency_ratio: ratio,
            connectivity: connectivity.get(node.id) ?? 0,
            is_spof: spofs.includes(node.id),
            mitigation_count: mits.length,
        };
    });

    // Network-level stats
    const avgRisk =
        suppliers.reduce((s, n) => s + n.risk_score, 0) / suppliers.length;
    const avgCost =
        suppliers.reduce((s, n) => s + n.cost_score, 0) / suppliers.length;
    const highRiskNodes = suppliers.filter((s) => s.risk_score > 70);
    const dangerousDeps = suppliers.filter(
        (s) => efficiencyRatio(s) < 1 && s.risk_score > 50
    );

    return NextResponse.json({
        summary: {
            total_nodes: suppliers.length,
            total_edges: edges.length,
            spof_count: spofs.length,
            spof_ids: spofs,
            high_risk_count: highRiskNodes.length,
            dangerous_dependency_count: dangerousDeps.length,
            avg_risk: Math.round(avgRisk * 10) / 10,
            avg_cost: Math.round(avgCost * 10) / 10,
            max_risk: Math.max(...suppliers.map((s) => s.risk_score)),
            max_connectivity: Math.max(...Array.from(connectivity.values())),
        },
        nodes: nodeAnalyses,
    });
}
