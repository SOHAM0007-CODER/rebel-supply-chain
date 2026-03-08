// ============================================================
// API Route: POST /api/simulate
// Disruption Simulation — takes node(s) offline and recomputes
// the entire network's risk profile.
//
// Body: { disabledNodeIds: string[] }
// Returns: { before, after, impact }
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { suppliers, edges, SupplierNode, SupplyEdge } from "@/lib/mockData";
import {
    calculateCascadingRisk,
    efficiencyRatio,
    detectSPOF,
    calculateConnectivity,
    buildDownstreamGraph,
} from "@/lib/algorithms";

function networkStats(nodes: SupplierNode[], edgeList: SupplyEdge[]) {
    const spofs = detectSPOF(nodes, edgeList);
    const connectivity = calculateConnectivity(edgeList);
    const avgRisk = nodes.reduce((s, n) => s + n.risk_score, 0) / (nodes.length || 1);
    const highRisk = nodes.filter((n) => n.risk_score > 70).length;

    const cascadingScores = nodes.map(
        (n) => calculateCascadingRisk(n.id, nodes, edgeList).cascading_risk_score
    );
    const avgCascading =
        cascadingScores.reduce((a, b) => a + b, 0) / (cascadingScores.length || 1);

    return {
        node_count: nodes.length,
        edge_count: edgeList.length,
        spof_count: spofs.length,
        spof_ids: spofs,
        high_risk_count: highRisk,
        avg_risk: Math.round(avgRisk * 10) / 10,
        avg_cascading_risk: Math.round(avgCascading * 10) / 10,
        max_risk: nodes.length ? Math.max(...nodes.map((n) => n.risk_score)) : 0,
    };
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { disabledNodeIds } = body as { disabledNodeIds?: string[] };

    if (!disabledNodeIds || disabledNodeIds.length === 0) {
        return NextResponse.json(
            { error: "Provide disabledNodeIds array" },
            { status: 400 }
        );
    }

    const disabledSet = new Set(disabledNodeIds);

    // Before state
    const before = networkStats(suppliers, edges);

    // After state — remove disabled nodes and their edges
    const afterNodes = suppliers.filter((n) => !disabledSet.has(n.id));
    const afterEdges = edges.filter(
        (e) => !disabledSet.has(e.source) && !disabledSet.has(e.target)
    );
    const after = networkStats(afterNodes, afterEdges);

    // Find directly impacted nodes (downstream of disabled)
    const downstream = buildDownstreamGraph(edges);
    const impactedNodeIds = new Set<string>();
    for (const id of disabledNodeIds) {
        const targets = downstream.get(id) ?? [];
        for (const t of targets) impactedNodeIds.add(t);
    }

    // Find orphaned nodes (no upstream after removal)
    const orphaned = afterNodes.filter((n) => {
        const hasUpstream = afterEdges.some((e) => e.target === n.id);
        const hadUpstream = edges.some((e) => e.target === n.id);
        return hadUpstream && !hasUpstream;
    });

    return NextResponse.json({
        disabled_nodes: disabledNodeIds,
        before,
        after,
        impact: {
            edges_lost: before.edge_count - after.edge_count,
            directly_impacted_nodes: Array.from(impactedNodeIds),
            directly_impacted_count: impactedNodeIds.size,
            orphaned_nodes: orphaned.map((n) => ({ id: n.id, name: n.name })),
            orphaned_count: orphaned.length,
            risk_delta: Math.round((after.avg_risk - before.avg_risk) * 10) / 10,
            cascading_risk_delta:
                Math.round(
                    (after.avg_cascading_risk - before.avg_cascading_risk) * 10
                ) / 10,
            new_spofs: after.spof_ids.filter((id) => !before.spof_ids.includes(id)),
        },
    });
}
