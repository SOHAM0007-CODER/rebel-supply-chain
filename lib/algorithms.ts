// ============================================================
// Core Supply-Chain Risk Algorithms
// Updated for 50-node dataset with multi-dimensional risk
// ============================================================

import { SupplierNode, SupplyEdge } from "./mockData";

// ────────────────────────────────────────────────────────────
// 1. Build adjacency list (upstream: target → sources)
// ────────────────────────────────────────────────────────────
export function buildUpstreamGraph(
    edges: SupplyEdge[]
): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    for (const edge of edges) {
        if (!graph.has(edge.target)) graph.set(edge.target, []);
        graph.get(edge.target)!.push(edge.source);
    }
    return graph;
}

// Build downstream adjacency (source → targets)
export function buildDownstreamGraph(
    edges: SupplyEdge[]
): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    for (const edge of edges) {
        if (!graph.has(edge.source)) graph.set(edge.source, []);
        graph.get(edge.source)!.push(edge.target);
    }
    return graph;
}

// ────────────────────────────────────────────────────────────
// 2. Cascading Risk Algorithm (DFS)
//
// Traverses all upstream suppliers and returns the maximum
// risk_score encountered on any path. A node is only as safe
// as its riskiest upstream dependency.
// ────────────────────────────────────────────────────────────
export interface CascadingRiskResult {
    node_id: string;
    cascading_risk_score: number;
    risk_path: string[]; // root-risk-source → this node
}

export function calculateCascadingRisk(
    nodeId: string,
    nodes: SupplierNode[],
    edges: SupplyEdge[]
): CascadingRiskResult {
    const upstream = buildUpstreamGraph(edges);
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    let maxRisk = nodeMap.get(nodeId)?.risk_score ?? 0;
    let maxPath: string[] = [nodeId];

    function dfs(current: string, visited: Set<string>, path: string[], currentWeight: number = 1.0) {
        const currentNode = nodeMap.get(current);
        const weightedRisk = (currentNode?.risk_score ?? 0) * currentWeight;
        
        if (weightedRisk > maxRisk) {
            maxRisk = weightedRisk;
            maxPath = [...path];
        }

        const parents = upstream.get(current) ?? [];
        for (const parent of parents) {
            if (!visited.has(parent)) {
                // Find the edge between parent and current to get dependency_weight
                const edge = edges.find(e => e.source === parent && e.target === current);
                const weight = edge?.dependency_weight ?? 1.0;
                
                visited.add(parent);
                dfs(parent, visited, [...path, parent], weight);
                visited.delete(parent);
            }
        }
    }

    const visited = new Set<string>([nodeId]);
    dfs(nodeId, visited, [nodeId], 1.0);

    return {
        node_id: nodeId,
        cascading_risk_score: Math.round(maxRisk * 100) / 100,
        risk_path: maxPath.reverse(),
    };
}

// ────────────────────────────────────────────────────────────
// 3. Efficiency Ratio
//
// efficiency_ratio = cost_score / risk_score
// LOW (<1) = high risk relative to cost = dangerous dependency
// ────────────────────────────────────────────────────────────
export function efficiencyRatio(node: SupplierNode): number {
    if (node.risk_score === 0) return Infinity;
    return parseFloat((node.cost_score / node.risk_score).toFixed(2));
}

// ────────────────────────────────────────────────────────────
// 4. Connectivity Analysis
// ────────────────────────────────────────────────────────────
export function calculateConnectivity(
    edges: SupplyEdge[]
): Map<string, number> {
    const downstream = buildDownstreamGraph(edges);
    const upstream = buildUpstreamGraph(edges);
    const connectivity = new Map<string, number>();

    const allNodeIds = new Set([
        ...edges.map((e) => e.source),
        ...edges.map((e) => e.target),
    ]);

    for (const id of allNodeIds) {
        const out = downstream.get(id)?.length ?? 0;
        const inc = upstream.get(id)?.length ?? 0;
        connectivity.set(id, out + inc);
    }

    return connectivity;
}

// ────────────────────────────────────────────────────────────
// 5. Single-Point-of-Failure Detection
//
// A node is a SPOF if ANY of its downstream targets rely on
// it as their ONLY supplier from that tier.
// This catches cases like N24→N34 and N21→N38 where the
// manufacturer has only a single component supplier.
// ────────────────────────────────────────────────────────────
export function detectSPOF(
    nodes: SupplierNode[],
    edges: SupplyEdge[]
): string[] {
    const downstream = buildDownstreamGraph(edges);
    const upstream = buildUpstreamGraph(edges);
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const spofs: string[] = [];

    for (const node of nodes) {
        const targets = downstream.get(node.id) ?? [];
        if (targets.length === 0) continue;

        // Check if any target relies SOLELY on this node from the same tier
        let isSoleSrc = false;
        for (const t of targets) {
            const sources = upstream.get(t) ?? [];
            const sameTierSources = sources.filter(
                (s) => nodeMap.get(s)?.tier === node.tier
            );
            if (sameTierSources.length === 1 && sameTierSources[0] === node.id) {
                isSoleSrc = true;
                break;
            }
        }

        if (isSoleSrc) spofs.push(node.id);
    }

    return spofs;
}

// ────────────────────────────────────────────────────────────
// 6. Mitigation Engine
//
// Generates concrete recommendations per supplier, including
// multi-dimensional risk analysis.
// ────────────────────────────────────────────────────────────
export type MitigationType =
    | "spof"
    | "high_risk"
    | "dangerous_dependency"
    | "critical_node"
    | "geopolitical"
    | "weather"
    | "shipping"
    | "financial";

export interface AlternativeSupplier {
    id: string;
    name: string;
    country: string;
    risk_score: number;
    cost_score: number;
}

export interface Mitigation {
    type: MitigationType;
    severity: "critical" | "high" | "medium" | "low";
    title: string;
    description: string;
    alternatives?: AlternativeSupplier[];
}

export function generateMitigations(
    nodeId: string,
    nodes: SupplierNode[],
    edges: SupplyEdge[]
): Mitigation[] {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const node = nodeMap.get(nodeId);
    if (!node) return [];

    const mitigations: Mitigation[] = [];
    const spofs = detectSPOF(nodes, edges);
    const connectivity = calculateConnectivity(edges);
    const ratio = efficiencyRatio(node);
    const cascading = calculateCascadingRisk(nodeId, nodes, edges);

    // ── Helper to find alternatives ────────────────────────
    const findAlternatives = (currentNode: SupplierNode): AlternativeSupplier[] => {
        return nodes
            .filter(n => 
                n.id !== currentNode.id && 
                n.products === currentNode.products &&
                n.tier === currentNode.tier
            )
            .sort((a, b) => {
                // Rank by lower risk first, then acceptable cost
                if (a.risk_score !== b.risk_score) return a.risk_score - b.risk_score;
                return a.cost_score - b.cost_score;
            })
            .slice(0, 3)
            .map(n => ({
                id: n.id,
                name: n.name,
                country: n.country,
                risk_score: n.risk_score,
                cost_score: n.cost_score
            }));
    };

    // ── SPOF Check ─────────────────────────────────────────
    if (spofs.includes(nodeId)) {
        mitigations.push({
            type: "spof",
            severity: "critical",
            title: "Single Point of Failure Detected",
            description: `"${node.name}" is the sole supplier for one or more downstream nodes. Qualify an alternative supplier in a different region to eliminate this critical dependency.`,
            alternatives: findAlternatives(node)
        });
    }

    // ── High Cascading Risk ────────────────────────────────
    if (cascading.cascading_risk_score > 55) {
        const pathNames = cascading.risk_path
            .map((id) => nodeMap.get(id)?.name ?? id)
            .join(" → ");
        
        // Find the actual high-risk upstream node that is causing the problem
        const highRiskNodeId = cascading.risk_path[0]; // The root of the risk path
        const highRiskNode = nodeMap.get(highRiskNodeId);

        mitigations.push({
            type: "high_risk",
            severity: cascading.cascading_risk_score > 65 ? "high" : "medium",
            title: "Elevated Cascading Risk Exposure",
            description: `Cascading risk: ${cascading.cascading_risk_score}. Risk propagates via: ${pathNames}. Consider inventory buffers or dual-sourcing the high-risk upstream node.`,
            alternatives: highRiskNode ? findAlternatives(highRiskNode) : []
        });
    }

    // ── High Dependency Check (>70%) ──────────────────────
    const upstream = buildUpstreamGraph(edges);
    const parents = upstream.get(nodeId) ?? [];
    for (const parentId of parents) {
        const edge = edges.find(e => e.source === parentId && e.target === nodeId);
        if (edge && edge.dependency_weight > 0.7) {
            const parentNode = nodeMap.get(parentId);
            if (parentNode) {
                mitigations.push({
                    type: "dangerous_dependency",
                    severity: "high",
                    title: `High Dependency on ${parentNode.name}`,
                    description: `You have a ${(edge.dependency_weight * 100).toFixed(0)}% dependency on this supplier. Excessive reliance on a single source increases disruption impact.`,
                    alternatives: findAlternatives(parentNode)
                });
            }
        }
    }

    // ── Dangerous Dependency (low efficiency ratio) ────────
    if (ratio < 1 && node.risk_score > 35) {
        mitigations.push({
            type: "dangerous_dependency",
            severity: "high",
            title: "Dangerous Dependency — High Risk / Low Cost",
            description: `Efficiency ratio: ${ratio} (cost ${node.cost_score} / risk ${node.risk_score}). Low-cost but high-risk supplier. Diversify sourcing or negotiate improvement agreements.`,
        });
    }

    // ── Geopolitical Risk ──────────────────────────────────
    if (node.geopolitical_risk >= 65) {
        mitigations.push({
            type: "geopolitical",
            severity: node.geopolitical_risk >= 80 ? "high" : "medium",
            title: `High Geopolitical Risk — ${node.country}`,
            description: `Geopolitical risk score: ${node.geopolitical_risk}/100. ${node.country} (${node.region}) presents elevated political instability risk. Establish backup sourcing in a stable region.`,
        });
    }

    // ── Weather / Natural Disaster Risk ────────────────────
    if (node.weather_risk >= 60) {
        mitigations.push({
            type: "weather",
            severity: "medium",
            title: "Weather & Natural Disaster Exposure",
            description: `Weather disruption risk: ${node.weather_risk}/100. Location is prone to natural disasters. Maintain safety stock and establish contingency logistics routes.`,
        });
    }

    // ── Shipping Delay Risk ────────────────────────────────
    if (node.shipping_risk >= 60) {
        mitigations.push({
            type: "shipping",
            severity: "medium",
            title: "Shipping & Logistics Vulnerability",
            description: `Shipping delay risk: ${node.shipping_risk}/100. Consider nearshoring alternatives or maintaining regional warehousing to reduce lead-time exposure.`,
        });
    }

    // ── Financial Instability ──────────────────────────────
    if (node.financial_stability < 50) {
        mitigations.push({
            type: "financial",
            severity: "high",
            title: "Supplier Financial Instability",
            description: `Financial stability score: ${node.financial_stability}/100. This supplier may face bankruptcy or operational disruption. Monitor credit ratings and prepare backup sources.`,
        });
    }

    // ── Critical Connectivity ──────────────────────────────
    const conn = connectivity.get(nodeId) ?? 0;
    if (conn >= 5) {
        mitigations.push({
            type: "critical_node",
            severity: "medium",
            title: "High-Connectivity Critical Node",
            description: `This node has ${conn} supply-chain connections. Disruption cascades widely. Recommend safety-stock policies and contingency routing.`,
        });
    }

    return mitigations;
}

// ────────────────────────────────────────────────────────────
// 7. Region Collapse Simulation
// ────────────────────────────────────────────────────────────
export interface RegionCollapseResult {
    disruptedSuppliers: number;
    affectedManufacturers: number;
    productionLoss: number;
    affectedProducts: string[];
    suggestedMitigation: string;
}

export function simulateRegionCollapse(
    selectedRegion: string,
    nodes: SupplierNode[],
    edges: SupplyEdge[]
): RegionCollapseResult {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const downstream = buildDownstreamGraph(edges);

    // 1. Find all suppliers in the region
    const regionalSuppliers = nodes.filter(
        (n) => n.region === selectedRegion && n.type !== "Manufacturer" && n.type !== "Retailer"
    );

    // 2. Identify all affected nodes (downstream)
    const affectedNodeIds = new Set<string>();
    const queue = regionalSuppliers.map((s) => s.id);
    const visited = new Set<string>(queue);

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        const targets = downstream.get(currentId) ?? [];
        for (const targetId of targets) {
            if (!visited.has(targetId)) {
                visited.add(targetId);
                affectedNodeIds.add(targetId);
                queue.push(targetId);
            }
        }
    }

    // 3. Count manufacturers affected
    const affectedManufacturers = Array.from(affectedNodeIds)
        .map((id) => nodeMap.get(id))
        .filter((n) => n?.type === "Manufacturer") as SupplierNode[];

    // 4. Calculate total lost production capacity
    const productionLoss = regionalSuppliers.reduce((sum, s) => {
        return sum + (s.capacity ?? 0);
    }, 0);

    // 5. Identify affected products
    const affectedProducts = Array.from(
        new Set(affectedManufacturers.map((m) => m.products))
    );

    // 6. Generate suggested mitigation
    const availableAlternativeRegions = Array.from(
        new Set(nodes.map((n) => n.region))
    ).filter((r) => r !== selectedRegion);
    
    // Pick two most stable regions (Europe and North America are usually good)
    const preferredRegions = ["Europe", "North America", "Oceania"].filter(r => availableAlternativeRegions.includes(r)).slice(0, 2);
    
    const suggestedMitigation = preferredRegions.length > 0 
        ? `Diversify suppliers to ${preferredRegions.join(" and ")}`
        : "Establish backup sourcing in other geographic regions";

    return {
        disruptedSuppliers: regionalSuppliers.length,
        affectedManufacturers: affectedManufacturers.length,
        productionLoss,
        affectedProducts,
        suggestedMitigation,
    };
}
