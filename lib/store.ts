// ============================================================
// Zustand Store — Production-grade state management
// Handles: selection, search/filter, disruption simulation,
// analytics, and all derived computations.
// ============================================================

import { create } from "zustand";
import {
    SupplierNode,
    SupplyEdge,
    suppliers as allSuppliers,
    edges as allEdges,
    TIER_LABELS,
} from "./mockData";
import {
    generateMitigations,
    Mitigation,
    calculateCascadingRisk,
    CascadingRiskResult,
    efficiencyRatio,
    detectSPOF,
    calculateConnectivity,
    buildDownstreamGraph,
    buildUpstreamGraph,
} from "./algorithms";
import { calculateDistance } from "./distance";
import {
    applyDynamicRiskToNodes,
    calculateGeographicConcentrationRisk,
    applyGeographicConcentrationRiskToNodes,
    getConcentrationWarning,
    ConcentrationRiskResult,
} from "./riskEngine";
import { findAllAlternatives, AlternativeResult } from "./alternativeFinder";

// ── Simulation impact result ───────────────────────────────
export interface SimulationResult {
    disabledIds: string[];
    edgesLost: number;
    impactedNodes: string[];
    orphanedNodes: { id: string; name: string }[];
    riskDelta: number;
    cascadingRiskDelta: number;
    beforeAvgRisk: number;
    afterAvgRisk: number;
    beforeSpofCount: number;
    afterSpofCount: number;
    alternatives: AlternativeResult[];
}

// ── Node analysis row (used on analytics & table pages) ────
export interface NodeAnalysis {
    id: string;
    name: string;
    tier: number;
    products: string;
    risk_score: number;
    cost_score: number;
    cascading_risk: number;
    efficiency_ratio: number;
    connectivity: number;
    is_spof: boolean;
    mitigation_count: number;
}

interface SupplyChainState {
    // ── Core data ─────────────────────────────────────────
    nodes: SupplierNode[];
    edges: SupplyEdge[];

    // ── Selection ─────────────────────────────────────────
    selectedNodeId: string | null;
    selectedNode: SupplierNode | null;

    // ── Derived analysis for selected node ────────────────
    mitigations: Mitigation[];
    cascadingRisk: CascadingRiskResult | null;
    selectedEfficiencyRatio: number | null;
    selectedConnectivity: number;
    selectedUpstream: string[];
    selectedDownstream: string[];
    selectedDependencies: { name: string; weight: number; risk: number }[];

    // ── Search & filter ───────────────────────────────────
    searchQuery: string;
    tierFilter: number | null; // null = all
    riskFilter: [number, number]; // [min, max]
    selectedRegion: string; // "All" | region name
    selectedManufacturerId: string | null; // for radius search
    radiusKm: number;
    filteredNodes: SupplierNode[];

    // ── Disruption simulation ─────────────────────────────
    disabledNodeIds: Set<string>;
    simulationResult: SimulationResult | null;
    isSimulating: boolean;

    // ── Network-level analytics (computed) ────────────────
    networkAnalytics: {
        totalNodes: number;
        totalEdges: number;
        avgRisk: number;
        avgCost: number;
        maxRisk: number;
        spofCount: number;
        spofIds: string[];
        highRiskCount: number;
        dangerousDepCount: number;
        tierBreakdown: { tier: number; label: string; count: number; avgRisk: number }[];
        nodeAnalyses: NodeAnalysis[];
        concentrationRisk?: ConcentrationRiskResult;
        concentrationWarning?: string;
    };

    // ── Actions ───────────────────────────────────────────
    selectNode: (id: string | null) => void;
    setSearchQuery: (q: string) => void;
    setTierFilter: (tier: number | null) => void;
    setRiskFilter: (range: [number, number]) => void;
    setRegionFilter: (region: string) => void;
    setSelectedManufacturer: (id: string | null) => void;
    setRadiusKm: (km: number) => void;
    toggleDisabledNode: (id: string) => void;
    clearDisabledNodes: () => void;
    runSimulation: () => void;
    recomputeAnalytics: () => void;
    addNodeWithEdges: (node: SupplierNode, edgeTargets: string[]) => void;
}

// ── Helper: compute filtered nodes ────────────────────────
function applyFilters(
    nodes: SupplierNode[],
    search: string,
    tier: number | null,
    risk: [number, number],
    region: string,
    manufacturerId: string | null,
    radiusKm: number
): SupplierNode[] {
    let result = nodes;

    // Text search
    if (search) {
        const q = search.toLowerCase();
        result = result.filter(
            (n) =>
                n.name.toLowerCase().includes(q) ||
                n.products.toLowerCase().includes(q) ||
                n.id.toLowerCase().includes(q)
        );
    }

    // Tier filter
    if (tier !== null) {
        result = result.filter((n) => n.tier === tier);
    }

    // Risk filter
    result = result.filter(
        (n) => n.risk_score >= risk[0] && n.risk_score <= risk[1]
    );

    // Region filter
    if (region !== "All") {
        result = result.filter((n) => n.region === region);
    }

    // Radius filter (only apply if manufacturer selected)
    if (manufacturerId !== null && radiusKm > 0) {
        const manufacturer = nodes.find((n) => n.id === manufacturerId);
        if (manufacturer) {
            const manufacturerLat = manufacturer.lat;
            const manufacturerLon = manufacturer.lon;
            result = result.filter((node) => {
                const distKm = calculateDistance(
                    manufacturerLat,
                    manufacturerLon,
                    node.lat,
                    node.lon
                );
                return distKm <= radiusKm;
            });
        }
    }

    return result;
}

// ── Helper: compute full network analytics ────────────────
function computeAnalytics(nodes: SupplierNode[], edgeList: SupplyEdge[]) {
    const spofs = detectSPOF(nodes, edgeList);
    const connectivity = calculateConnectivity(edgeList);
    const avgRisk = nodes.reduce((s, n) => s + n.risk_score, 0) / (nodes.length || 1);
    const avgCost = nodes.reduce((s, n) => s + n.cost_score, 0) / (nodes.length || 1);
    const highRisk = nodes.filter((n) => n.risk_score > 55);
    const dangerousDeps = nodes.filter(
        (n) => efficiencyRatio(n) < 1 && n.risk_score > 35
    );

    // Tier breakdown
    const tiers = [4, 3, 2, 1, 0];
    const tierBreakdown = tiers.map((t) => {
        const tierNodes = nodes.filter((n) => n.tier === t);
        return {
            tier: t,
            label: TIER_LABELS[t] ?? `Tier ${t}`,
            count: tierNodes.length,
            avgRisk: tierNodes.length
                ? Math.round(tierNodes.reduce((s, n) => s + n.risk_score, 0) / tierNodes.length)
                : 0,
        };
    });

    const nodeAnalyses: NodeAnalysis[] = nodes.map((n) => {
        const cascading = calculateCascadingRisk(n.id, nodes, edgeList);
        const ratio = efficiencyRatio(n);
        const mits = generateMitigations(n.id, nodes, edgeList);
        return {
            id: n.id,
            name: n.name,
            tier: n.tier,
            products: n.products,
            risk_score: n.risk_score,
            cost_score: n.cost_score,
            cascading_risk: cascading.cascading_risk_score,
            efficiency_ratio: ratio,
            connectivity: connectivity.get(n.id) ?? 0,
            is_spof: spofs.includes(n.id),
            mitigation_count: mits.length,
        };
    });

    return {
        totalNodes: nodes.length,
        totalEdges: edgeList.length,
        avgRisk: Math.round(avgRisk * 10) / 10,
        avgCost: Math.round(avgCost * 10) / 10,
        maxRisk: nodes.length ? Math.max(...nodes.map((n) => n.risk_score)) : 0,
        spofCount: spofs.length,
        spofIds: spofs,
        highRiskCount: highRisk.length,
        dangerousDepCount: dangerousDeps.length,
        tierBreakdown,
        nodeAnalyses,
        // Calculate concentration risk
        concentrationRisk: calculateGeographicConcentrationRisk(nodes),
        concentrationWarning: getConcentrationWarning(calculateGeographicConcentrationRisk(nodes)),
    };
}

export const useSupplyChainStore = create<SupplyChainState>((set, get) => {
    // Apply dynamic risk engine to all suppliers based on region
    const suppliersWithDynamicRisk = applyDynamicRiskToNodes(allSuppliers);
    // Apply geographic concentration risk on top of dynamic risk
    const suppliersWithConcentrationRisk = applyGeographicConcentrationRiskToNodes(suppliersWithDynamicRisk);
    const initialAnalytics = computeAnalytics(suppliersWithConcentrationRisk, allEdges);

    return {
        // Core data
        nodes: suppliersWithConcentrationRisk,
        edges: allEdges,

        // Selection
        selectedNodeId: null,
        selectedNode: null,
        mitigations: [],
        cascadingRisk: null,
        selectedEfficiencyRatio: null,
        selectedConnectivity: 0,
        selectedUpstream: [],
        selectedDownstream: [],
        selectedDependencies: [],

        // Search & filter
        searchQuery: "",
        tierFilter: null,
        riskFilter: [0, 100],
        selectedRegion: "All",
        selectedManufacturerId: null,
        radiusKm: 0,
        filteredNodes: suppliersWithConcentrationRisk,

        // Disruption
        disabledNodeIds: new Set<string>(),
        simulationResult: null,
        isSimulating: false,

        // Analytics
        networkAnalytics: initialAnalytics,

        // ── Actions ─────────────────────────────────────────

        selectNode: (id) => {
            const { nodes, edges } = get();
            if (!id) {
                set({
                    selectedNodeId: null,
                    selectedNode: null,
                    mitigations: [],
                    cascadingRisk: null,
                    selectedEfficiencyRatio: null,
                    selectedConnectivity: 0,
                    selectedUpstream: [],
                    selectedDownstream: [],
                    selectedDependencies: [],
                });
                return;
            }

            const node = nodes.find((n) => n.id === id) ?? null;
            const mits = generateMitigations(id, nodes, edges);
            const cascading = calculateCascadingRisk(id, nodes, edges);
            const ratio = node ? efficiencyRatio(node) : null;
            const connectivity = calculateConnectivity(edges);
            const downstream = buildDownstreamGraph(edges);
            const upstream = buildUpstreamGraph(edges);

            // Fetch specific dependency weight info for the selected node (incoming edges)
            const dependencies = edges
                .filter(e => e.target === id)
                .map(e => {
                    const srcNode = nodes.find(n => n.id === e.source);
                    return {
                        name: srcNode?.name ?? e.source,
                        weight: e.dependency_weight,
                        risk: srcNode?.risk_score ?? 0
                    };
                })
                .sort((a, b) => b.weight - a.weight);

            set({
                selectedNodeId: id,
                selectedNode: node,
                mitigations: mits,
                cascadingRisk: cascading,
                selectedEfficiencyRatio: ratio,
                selectedConnectivity: connectivity.get(id) ?? 0,
                selectedUpstream: upstream.get(id) ?? [],
                selectedDownstream: downstream.get(id) ?? [],
                selectedDependencies: dependencies,
            });
        },

        setSearchQuery: (q) => {
            const { nodes, tierFilter, riskFilter, selectedRegion, selectedManufacturerId, radiusKm } = get();
            set({
                searchQuery: q,
                filteredNodes: applyFilters(nodes, q, tierFilter, riskFilter, selectedRegion, selectedManufacturerId, radiusKm),
            });
        },

        setTierFilter: (tier) => {
            const { nodes, searchQuery, riskFilter, selectedRegion, selectedManufacturerId, radiusKm } = get();
            set({
                tierFilter: tier,
                filteredNodes: applyFilters(nodes, searchQuery, tier, riskFilter, selectedRegion, selectedManufacturerId, radiusKm),
            });
        },

        setRiskFilter: (range) => {
            const { nodes, searchQuery, tierFilter, selectedRegion, selectedManufacturerId, radiusKm } = get();
            set({
                riskFilter: range,
                filteredNodes: applyFilters(nodes, searchQuery, tierFilter, range, selectedRegion, selectedManufacturerId, radiusKm),
            });
        },

        setRegionFilter: (region) => {
            const { nodes, searchQuery, tierFilter, riskFilter, selectedManufacturerId, radiusKm } = get();
            set({
                selectedRegion: region,
                filteredNodes: applyFilters(nodes, searchQuery, tierFilter, riskFilter, region, selectedManufacturerId, radiusKm),
            });
        },

        setSelectedManufacturer: (id) => {
            const { nodes, searchQuery, tierFilter, riskFilter, selectedRegion, radiusKm } = get();
            set({
                selectedManufacturerId: id,
                filteredNodes: applyFilters(nodes, searchQuery, tierFilter, riskFilter, selectedRegion, id, radiusKm),
            });
        },

        setRadiusKm: (km) => {
            const { nodes, searchQuery, tierFilter, riskFilter, selectedRegion, selectedManufacturerId } = get();
            set({
                radiusKm: km,
                filteredNodes: applyFilters(nodes, searchQuery, tierFilter, riskFilter, selectedRegion, selectedManufacturerId, km),
            });
        },

        toggleDisabledNode: (id) => {
            const { disabledNodeIds } = get();
            const next = new Set(disabledNodeIds);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            set({ disabledNodeIds: next, simulationResult: null });
        },

        clearDisabledNodes: () => {
            set({ disabledNodeIds: new Set(), simulationResult: null });
        },

        runSimulation: () => {
            const { disabledNodeIds, nodes, edges } = get();
            if (disabledNodeIds.size === 0) return;
            set({ isSimulating: true });

            const disabledSet = disabledNodeIds;
            const afterNodes = nodes.filter((n) => !disabledSet.has(n.id));
            const afterEdges = edges.filter(
                (e) => !disabledSet.has(e.source) && !disabledSet.has(e.target)
            );

            const beforeSpofs = detectSPOF(nodes, edges);
            const afterSpofs = detectSPOF(afterNodes, afterEdges);

            const beforeAvgRisk =
                nodes.reduce((s, n) => s + n.risk_score, 0) / (nodes.length || 1);
            const afterAvgRisk =
                afterNodes.reduce((s, n) => s + n.risk_score, 0) / (afterNodes.length || 1);

            const beforeCascading = nodes.map(
                (n) => calculateCascadingRisk(n.id, nodes, edges).cascading_risk_score
            );
            const afterCascading = afterNodes.map(
                (n) => calculateCascadingRisk(n.id, afterNodes, afterEdges).cascading_risk_score
            );
            const beforeAvgCasc =
                beforeCascading.reduce((a, b) => a + b, 0) / (beforeCascading.length || 1);
            const afterAvgCasc =
                afterCascading.reduce((a, b) => a + b, 0) / (afterCascading.length || 1);

            const downstream = buildDownstreamGraph(edges);
            const impacted = new Set<string>();
            for (const id of disabledSet) {
                for (const t of downstream.get(id) ?? []) impacted.add(t);
            }

            const orphaned = afterNodes.filter((n) => {
                const had = edges.some((e) => e.target === n.id);
                const has = afterEdges.some((e) => e.target === n.id);
                return had && !has;
            });

            // Find alternative replacements for each disabled node
            const alternatives = findAllAlternatives(disabledSet, nodes, edges);

            set({
                isSimulating: false,
                simulationResult: {
                    disabledIds: Array.from(disabledSet),
                    edgesLost: edges.length - afterEdges.length,
                    impactedNodes: Array.from(impacted),
                    orphanedNodes: orphaned.map((n) => ({ id: n.id, name: n.name })),
                    riskDelta: Math.round((afterAvgRisk - beforeAvgRisk) * 10) / 10,
                    cascadingRiskDelta: Math.round((afterAvgCasc - beforeAvgCasc) * 10) / 10,
                    beforeAvgRisk: Math.round(beforeAvgRisk * 10) / 10,
                    afterAvgRisk: Math.round(afterAvgRisk * 10) / 10,
                    beforeSpofCount: beforeSpofs.length,
                    afterSpofCount: afterSpofs.length,
                    alternatives,
                },
            });
        },

        recomputeAnalytics: () => {
            const { nodes, edges } = get();
            set({ networkAnalytics: computeAnalytics(nodes, edges) });
        },

        addNodeWithEdges: (newNode, edgeTargets) => {
            const { nodes, edges } = get();

            // Safety check for duplicate IDs
            if (nodes.some(n => n.id === newNode.id)) return;

            // Add the new node
            const updatedNodes = [...nodes, newNode];

            // Decision: Should newNode be source or target?
            // Hierarchy: Tier 4 (Raw) -> Tier 3 (Comp) -> Tier 2 (Mfg) -> Tier 1 (Distr) -> Tier 0 (Retail)
            // Lower Tier number = more downstream.
            // Direction: Higher Tier -> Lower Tier (e.g. 4 -> 3)

            const newEdges = edgeTargets.map((targetId) => {
                const targetNode = nodes.find(n => n.id === targetId);

                // If existing node (targetId) is more downstream (lower tier), 
                // then NewNode is Source.
                // If existing node is more upstream (higher tier), 
                // then ExistingNode is Source.
                const isNewNodeSource = targetNode ? newNode.tier > targetNode.tier : true;

                return {
                    id: `edge-${newNode.id}-${targetId}-${Date.now()}`,
                    source: isNewNodeSource ? newNode.id : targetId,
                    target: isNewNodeSource ? targetId : newNode.id,
                    relationship: "supplies_to" as const,
                    dependency_weight: 0.5,
                };
            });

            const updatedEdges = [...edges, ...newEdges];

            // Update state and recompute analytics
            set({
                nodes: updatedNodes,
                edges: updatedEdges,
                networkAnalytics: computeAnalytics(updatedNodes, updatedEdges),
            });
        },
    };
});
