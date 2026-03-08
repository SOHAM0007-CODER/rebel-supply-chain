"use client";

// ============================================================
// NetworkGraph — Enhanced DAG visualization
// Features:
//   - Path highlighting on node selection
//   - Animated edges for selected paths
//   - Disabled node overlay for disruption simulation
//   - Auto-layout by tier (left → right)
// ============================================================

import React, { useCallback, useMemo, useEffect, useState } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    NodeProps,
    EdgeProps,
    Handle,
    Position,
    useNodesState,
    useEdgesState,
    MarkerType,
    getSmoothStepPath,
    EdgeLabelRenderer,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useSupplyChainStore } from "@/lib/store";
import { TIER_COLORS, TIER_LABELS } from "@/lib/mockData";
import { calculateDetailedSupplierRisk } from "@/lib/riskEngine";
import { findCriticalComponents } from "@/utils/criticalComponents";

function edgeWeightToGray(weight: number): string {
    const numericWeight = Number(weight);
    if (!Number.isFinite(numericWeight)) return "#9ca3af";
    const clamped = Math.max(0, Math.min(1, numericWeight));
    const channel = Math.round(220 - clamped * 190);
    const hex = channel.toString(16).padStart(2, "0");
    return `#${hex}${hex}${hex}`;
}

// ── Custom Edge Component with Tooltip ──────────────────────
function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
    animated,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

    const weight = (data?.dependency_weight as number) || 0;
    const supplierName = (data?.sourceName as string) || "Unknown";
    const targetName = (data?.targetName as string) || "Unknown";

    const { selectedNodeId, selectedUpstream, selectedDownstream } = useSupplyChainStore();

    // Determine if this specific edge is part of the highlighted path
    const isPathActive = selectedNodeId !== null;
    const isEdgeInSelectedPath = isPathActive && (
        (data?.sourceId === selectedNodeId && selectedDownstream.includes(data?.targetId as string)) ||
        (data?.targetId === selectedNodeId && selectedUpstream.includes(data?.sourceId as string)) ||
        (selectedUpstream.includes(data?.sourceId as string) && selectedUpstream.includes(data?.targetId as string)) ||
        (selectedDownstream.includes(data?.sourceId as string) && selectedDownstream.includes(data?.targetId as string))
    );

    const onMouseMove = (event: React.MouseEvent) => {
        // Get mouse position relative to the SVG container
        const svg = (event.currentTarget as HTMLElement).closest('svg');
        if (svg) {
            const pt = svg.createSVGPoint();
            pt.x = event.clientX;
            pt.y = event.clientY;
            const ctm = svg.getScreenCTM();
            if (ctm) {
                const localPt = pt.matrixTransform(ctm.inverse());
                setHoverPos({ x: localPt.x, y: localPt.y });
            }
        }
    };

    const edgeColorFromWeight = edgeWeightToGray(weight);
    const baseStroke =
        (typeof style.stroke === "string" && style.stroke.length > 0)
            ? style.stroke
            : edgeColorFromWeight;

    const finalStroke = (hoverPos || isEdgeInSelectedPath) ? "#FF2E88" : baseStroke;
    const edgeStyle = {
        stroke: finalStroke,
        strokeWidth: 3.5,
        strokeDasharray: style.strokeDasharray,
        opacity: style.opacity,
        transition: "stroke 0.2s",
        fill: "none",
    };

    return (
        <>
            <path
                id={id}
                style={edgeStyle}
                className={`react-flow__edge-path ${animated ? 'animated' : ''}`}
                d={edgePath}
                markerEnd={markerEnd ? {
                    ...markerEnd as any,
                    color: finalStroke
                } : undefined}
            />
            {/* Invisible wider path for easier hovering */}
            <path
                d={edgePath}
                fill="none"
                stroke="transparent"
                strokeWidth={30}
                onMouseMove={onMouseMove}
                onMouseEnter={onMouseMove}
                onMouseLeave={() => setHoverPos(null)}
                style={{ cursor: 'pointer' }}
            />
            {hoverPos && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -120%) translate(${hoverPos.x}px,${hoverPos.y}px)`,
                            background: "#000",
                            color: "#FFF",
                            padding: "6px 10px",
                            border: "2px solid #FFDF00",
                            zIndex: 1000,
                            pointerEvents: "none",
                            fontSize: "10px",
                            fontFamily: "Roboto Mono, monospace",
                            boxShadow: "4px 4px 0px 0px rgba(255,46,136,0.6)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <div style={{ fontWeight: 900, marginBottom: "2px" }}>
                            {supplierName} → {targetName}
                        </div>
                        <div style={{ color: "#FFDF00", fontWeight: 800 }}>
                            Dependency: {(weight * 100).toFixed(0)}%
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

// ── Custom Node Component ──────────────────────────────────
function SupplierNodeComponent({ data, id }: NodeProps) {
    const { selectedNodeId, selectNode, disabledNodeIds, selectedUpstream, selectedDownstream, filteredNodes } =
        useSupplyChainStore();
    const isSelected = selectedNodeId === id;
    const isDisabled = disabledNodeIds.has(id);
    const isInPath =
        selectedNodeId !== null &&
        (selectedUpstream.includes(id) || selectedDownstream.includes(id));

    const isVisible = filteredNodes.some((n) => n.id === id);
    const nodeOpacity = isVisible ? 1 : 0.2;

    const riskScore = data.risk_score as number;
    const tier = data.tier as number;
    const name = data.label as string;
    const costScore = data.cost_score as number;
    const region = data.region as string;
    const baseRisk = data.baseRisk as number;

    // Memoize risk calculation details for tooltip
    const riskDetails = useMemo(() => {
        return calculateDetailedSupplierRisk(region, baseRisk);
    }, [region, baseRisk]);

    const isHighRisk = riskScore > 70;

    // Detect if this supplier provides any critical component
    const criticalComponents = useMemo(() => findCriticalComponents(filteredNodes), [filteredNodes]);
    const nodeProducts = data.products ? (data.products as string).split(/, | & /) : [];
    const isCriticalSupplier = nodeProducts.some(p => criticalComponents.includes(p.trim()));

    const bgColor = isDisabled
        ? "#999"
        : isHighRisk
            ? "#FF3333"
            : (TIER_COLORS[tier] ?? "#FFFFFF");
    const textColor = isDisabled ? "#666" : isHighRisk ? "#FFFFFF" : "#000000";

    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                selectNode(isSelected ? null : id);
            }}
            style={{
                background: bgColor,
                color: textColor,
                border: isSelected
                    ? "4px solid #FF2E88"
                    : isInPath
                        ? "4px solid #FFDF00"
                        : isCriticalSupplier
                            ? "4px solid #FF3333"
                            : "3px solid #000000",
                boxShadow: isSelected
                    ? "6px 6px 0px 0px rgba(255,46,136,0.6)"
                    : isInPath
                        ? "5px 5px 0px 0px rgba(255,223,0,0.5)"
                        : isCriticalSupplier
                            ? "5px 5px 0px 0px rgba(255,51,51,0.5)"
                            : "4px 4px 0px 0px rgba(0,0,0,1)",
                padding: "10px 14px",
                minWidth: 190,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                opacity: nodeOpacity,
                position: "relative",
            }}
            onMouseEnter={(e) => {
                setShowTooltip(true);
                if (!isDisabled) {
                    e.currentTarget.style.transform = "translate(-2px, -2px)";
                }
            }}
            onMouseLeave={(e) => {
                setShowTooltip(false);
                e.currentTarget.style.transform = "translate(0, 0)";
            }}
        >
            <Handle
                type="target"
                position={Position.Left}
                style={{
                    background: "#000",
                    width: 8,
                    height: 8,
                    border: "2px solid #000",
                }}
            />

            {/* Disabled overlay */}
            {isDisabled && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.3)",
                        zIndex: 10,
                    }}
                >
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#FF3333" }}>
                        ✕ OFFLINE
                    </span>
                </div>
            )}

            <div
                style={{
                    fontWeight: 900,
                    fontSize: 12,
                    marginBottom: 4,
                    lineHeight: 1.2,
                }}
            >
                {name}
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                }}
            >
                <span
                    style={{
                        fontSize: 9,
                        fontWeight: 700,
                        background: "#000",
                        color: "#FFF",
                        padding: "1px 5px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                    }}
                >
                    {TIER_LABELS[tier] ?? `Tier ${tier}`}
                </span>
                <span
                    style={{
                        fontSize: 11,
                        fontWeight: 800,
                        fontFamily: "Roboto Mono, monospace",
                        color: textColor,
                    }}
                >
                    R:{riskScore}
                </span>
            </div>
            {/* Cost bar */}
            <div style={{ position: "relative", height: 6, background: "rgba(0,0,0,0.15)", border: "1px solid rgba(0,0,0,0.3)" }}>
                <div
                    style={{
                        height: "100%",
                        width: `${costScore}%`,
                        background: isDisabled ? "#666" : "#000",
                    }}
                />
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 9,
                    fontFamily: "Roboto Mono, monospace",
                    fontWeight: 600,
                    marginTop: 2,
                    opacity: 0.6,
                }}
            >
                <span>Cost: {costScore}</span>
            </div>

            {/* Dynamic Risk Tooltip */}
            {showTooltip && region && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "-75px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#000",
                        color: "#FFF",
                        padding: "6px 8px",
                        borderRadius: "4px",
                        fontSize: 8,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        zIndex: 20,
                        border: "1px solid #FFF",
                        fontFamily: "Roboto Mono, monospace",
                        lineHeight: 1.3,
                    }}
                >
                    <div>ðŸ“ Region: {region}</div>
                    <div>ðŸŽ¯ Dynamic Risk: {riskScore}</div>
                    <div style={{ fontSize: 7, opacity: 0.8, marginTop: 2 }}>
                        Regional: {riskDetails.regionalRiskComponent}
                    </div>
                </div>
            )}

            <Handle
                type="source"
                position={Position.Right}
                style={{
                    background: "#000",
                    width: 8,
                    height: 8,
                    border: "2px solid #000",
                }}
            />
        </div>
    );
}

const nodeTypes = { supplier: SupplierNodeComponent };
const edgeTypes = { custom: CustomEdge };

// ── Layout constants — 5 tiers, left → right ──────────────
const TIER_X: Record<number, number> = { 4: 0, 3: 320, 2: 640, 1: 960, 0: 1280 };

export default function NetworkGraph() {
    const {
        nodes: supplierNodes,
        edges: supplyEdges,
        selectNode,
        selectedNodeId,
        selectedUpstream,
        selectedDownstream,
        disabledNodeIds,
        filteredNodes,
        simulationResult,
    } = useSupplyChainStore();

    const [isMinimapOpen, setIsMinimapOpen] = useState(true);

    // Create a map of visible node IDs for quick lookup
    const visibleNodeIds = useMemo(() => {
        return new Set(filteredNodes.map((n) => n.id));
    }, [filteredNodes]);

    // Build React Flow nodes
    const initialNodes: Node[] = useMemo(() => {
        const tierCounts: Record<number, number> = {};
        const tierIndices: Record<number, number> = {};
        for (const n of supplierNodes) {
            tierCounts[n.tier] = (tierCounts[n.tier] ?? 0) + 1;
            tierIndices[n.tier] = 0;
        }

        return supplierNodes.map((supplier) => {
            const idx = tierIndices[supplier.tier]!;
            tierIndices[supplier.tier] = idx + 1;
            const count = tierCounts[supplier.tier]!;
            const ySpacing = 150;
            const yOffset = ((count - 1) * ySpacing) / 2;

            return {
                id: supplier.id,
                type: "supplier",
                position: {
                    x: TIER_X[supplier.tier] ?? 0,
                    y: idx * ySpacing - yOffset + 350,
                },
                data: {
                    label: supplier.name,
                    tier: supplier.tier,
                    risk_score: supplier.risk_score,
                    cost_score: supplier.cost_score,
                    region: supplier.region,
                    baseRisk: supplier.geopolitical_risk ?? 35,
                    products: supplier.products,
                },
            };
        });
    }, [supplierNodes]);

    // Build React Flow edges with path highlighting
    const flowEdges: Edge[] = useMemo(() => {
        const highlightedPairs = new Set<string>();
        if (selectedNodeId) {
            // Build full path: find edges connecting upstream & downstream to selected
            for (const e of supplyEdges) {
                const srcInPath =
                    e.source === selectedNodeId || selectedUpstream.includes(e.source);
                const tgtInPath =
                    e.target === selectedNodeId || selectedDownstream.includes(e.target);
                const srcIsUpstream = selectedUpstream.includes(e.source);
                const tgtIsSelected = e.target === selectedNodeId;
                const srcIsSelected = e.source === selectedNodeId;
                const tgtIsDownstream = selectedDownstream.includes(e.target);

                if (
                    (srcIsUpstream && tgtIsSelected) ||
                    (srcIsUpstream && selectedUpstream.includes(e.target)) ||
                    (srcIsSelected && tgtIsDownstream) ||
                    (selectedDownstream.includes(e.source) && tgtIsDownstream)
                ) {
                    highlightedPairs.add(`${e.source}-${e.target}`);
                }
            }
        }

        const baseEdges: Edge[] = supplyEdges.map((e, i) => {
            const key = `${e.source}-${e.target}`;
            const isHighlighted = highlightedPairs.has(key);
            const isDisabled =
                disabledNodeIds.has(e.source) || disabledNodeIds.has(e.target);
            const isFiltered = !visibleNodeIds.has(e.source) || !visibleNodeIds.has(e.target);

            const sourceNode = supplierNodes.find((n) => n.id === e.source);
            const targetNode = supplierNodes.find((n) => n.id === e.target);

            const edgeColor = edgeWeightToGray(e.dependency_weight);

            return {
                id: `e-${i}`,
                source: e.source,
                target: e.target,
                animated: isHighlighted,
                data: {
                    dependency_weight: e.dependency_weight,
                    sourceName: sourceNode?.name,
                    targetName: targetNode?.name,
                    sourceId: e.source,
                    targetId: e.target,
                },
                style: {
                    stroke: isDisabled
                        ? "#eee"
                        : isHighlighted
                            ? "#FF2E88"
                            : edgeColor,
                    strokeWidth: isHighlighted ? 6 : 4, // Thicker baseline for better color visibility
                    strokeDasharray: isDisabled ? "8 4" : undefined,
                    opacity: isFiltered ? 0.2 : isDisabled ? 0.3 : 1,
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: isDisabled ? "#eee" : isHighlighted ? "#FF2E88" : edgeColor,
                },
                type: "custom",
            };
        });

        // Add simulated "alternative" edges connecting candidates to the lost downstream nodes
        const altEdges: Edge[] = [];
        if (simulationResult?.alternatives) {
            simulationResult.alternatives.forEach((alt) => {
                // Find downstream nodes of the disabled node
                const originalEdges = supplyEdges.filter((e) => e.source === alt.disabledNode.id);

                alt.alternatives.forEach((candidate, idx) => {
                    // Color gradient: best is Green, then Yellow, then Red
                    const altColor = idx === 0 ? "#9BFF00" : idx === 1 ? "#FFDF00" : "#FF3333";

                    originalEdges.forEach((origEdge, edgeIdx) => {
                        altEdges.push({
                            id: `alt-${candidate.node.id}-${origEdge.target}-${edgeIdx}`,
                            source: candidate.node.id,
                            target: origEdge.target,
                            animated: true,
                            data: {
                                dependency_weight: origEdge.dependency_weight,
                                sourceName: candidate.node.name,
                                targetName: supplierNodes.find((n) => n.id === origEdge.target)?.name,
                                sourceId: candidate.node.id,
                                targetId: origEdge.target,
                            },
                            style: {
                                stroke: altColor,
                                strokeWidth: 4,
                                strokeDasharray: "5 5",
                            },
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: altColor,
                            },
                            type: "custom",
                        });
                    });
                });
            });
        }

        return [...baseEdges, ...altEdges];
    }, [supplyEdges, selectedNodeId, selectedUpstream, selectedDownstream, disabledNodeIds, visibleNodeIds, simulationResult, supplierNodes]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edgesState, setEdges, onEdgesChange] = useEdgesState(flowEdges);

    // Sync edges when selection or disabled state changes
    useEffect(() => {
        setEdges(flowEdges);
    }, [flowEdges, setEdges]);

    useEffect(() => {
        setNodes(initialNodes);
    }, [initialNodes, setNodes]);

    const onPaneClick = useCallback(() => {
        selectNode(null);
    }, [selectNode]);

    return (
        <div className="w-full h-full" style={{ minHeight: "100%" }}>
            <ReactFlow
                nodes={nodes}
                edges={edgesState}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onPaneClick={onPaneClick}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                minZoom={0.15}
                maxZoom={2.5}
                proOptions={{ hideAttribution: true }}
            >
                <Background gap={20} size={1} color="#ddd" />
                <Controls />
                {isMinimapOpen && (
                    <MiniMap
                        nodeColor={(n) => {
                            const risk = n.data?.risk_score as number | undefined;
                            const tier = n.data?.tier as number | undefined;
                            if (disabledNodeIds.has(n.id)) return "#999";
                            if (risk && risk > 70) return "#FF3333";
                            return TIER_COLORS[tier ?? 0] ?? "#FFF";
                        }}
                        style={{
                            border: "3px solid #000",
                            boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                            bottom: 40,
                        }}
                        pannable
                        zoomable
                    />
                )}
                {/* Minimap Toggle Switch */}
                <button
                    onClick={() => setIsMinimapOpen(!isMinimapOpen)}
                    style={{
                        position: "absolute",
                        bottom: 12,
                        right: 12,
                        zIndex: 10,
                        background: "#000",
                        color: "#FFF",
                        border: "2px solid #000",
                        padding: "6px 12px",
                        fontSize: "10px",
                        fontWeight: 900,
                        fontFamily: "Roboto Mono, monospace",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        boxShadow: "2px 2px 0px rgba(0,0,0,0.5)",
                    }}
                >
                    {isMinimapOpen ? "Minimize Map" : "Maximize Map"}
                </button>
            </ReactFlow>
        </div>
    );
}
