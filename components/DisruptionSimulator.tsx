"use client";

// ============================================================
// DisruptionSimulator — What-if analysis panel
// Toggle suppliers offline and see the cascading impact
// ============================================================

import React from "react";
import {
    Power,
    PowerOff,
    Play,
    RotateCcw,
    TrendingDown,
    TrendingUp,
    AlertTriangle,
    Unplug,
    Zap,
} from "lucide-react";
import { useSupplyChainStore } from "@/lib/store";
import { TIER_LABELS, TIER_COLORS } from "@/lib/mockData";

export default function DisruptionSimulator() {
    const {
        nodes,
        disabledNodeIds,
        toggleDisabledNode,
        clearDisabledNodes,
        runSimulation,
        simulationResult,
        isSimulating,
    } = useSupplyChainStore();

    return (
        <div className="brutal-scrollbar overflow-y-auto h-full" style={{ padding: 14 }}>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                }}
            >
                <h3
                    style={{
                        fontSize: 13,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        margin: 0,
                    }}
                >
                    Disruption Simulator
                </h3>
                <div style={{ display: "flex", gap: 6 }}>
                    <button
                        onClick={runSimulation}
                        disabled={disabledNodeIds.size === 0 || isSimulating}
                        className="brutal-btn"
                        style={{
                            background: disabledNodeIds.size > 0 ? "#FF2E88" : "#ccc",
                            color: "#FFF",
                            fontSize: 10,
                            padding: "4px 10px",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        <Play size={12} /> Simulate
                    </button>
                    <button
                        onClick={clearDisabledNodes}
                        className="brutal-btn"
                        style={{
                            background: "#FFF",
                            fontSize: 10,
                            padding: "4px 10px",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
            </div>

            {/* Instruction */}
            <p
                style={{
                    fontSize: 11,
                    fontFamily: "Roboto Mono, monospace",
                    opacity: 0.6,
                    marginBottom: 10,
                    lineHeight: 1.4,
                }}
            >
                Toggle suppliers offline to simulate disruptions. Hit &quot;Simulate&quot; to see
                the cascading impact on your supply chain.
            </p>

            {/* Node toggle list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
                {nodes.map((node) => {
                    const isOff = disabledNodeIds.has(node.id);
                    return (
                        <button
                            key={node.id}
                            onClick={() => toggleDisabledNode(node.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "6px 10px",
                                border: "2px solid #000",
                                background: isOff ? "#FF3333" : "#FFF",
                                color: isOff ? "#FFF" : "#000",
                                cursor: "pointer",
                                boxShadow: isOff
                                    ? "3px 3px 0px 0px rgba(255,51,51,0.3)"
                                    : "2px 2px 0px 0px rgba(0,0,0,1)",
                                transition: "all 0.15s ease",
                                textAlign: "left",
                            }}
                        >
                            {isOff ? <PowerOff size={14} /> : <Power size={14} />}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 800, lineHeight: 1.2 }}>
                                    {node.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: 9,
                                        fontFamily: "Roboto Mono, monospace",
                                        opacity: 0.7,
                                    }}
                                >
                                    {TIER_LABELS[node.tier]} · Risk: {node.risk_score}
                                </div>
                            </div>
                            <div
                                style={{
                                    width: 10,
                                    height: 10,
                                    background: TIER_COLORS[node.tier] ?? "#ccc",
                                    border: "2px solid #000",
                                    flexShrink: 0,
                                }}
                            />
                        </button>
                    );
                })}
            </div>

            {/* Simulation Results */}
            {simulationResult && (
                <div>
                    <h4
                        style={{
                            fontSize: 12,
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: "3px solid #000",
                            paddingBottom: 6,
                            marginBottom: 10,
                        }}
                    >
                        Impact Analysis
                    </h4>

                    {/* Impact grid */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 8,
                            marginBottom: 12,
                        }}
                    >
                        <div className="brutal-card" style={{ padding: 10 }}>
                            <div
                                style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    opacity: 0.5,
                                }}
                            >
                                Edges Lost
                            </div>
                            <div
                                style={{
                                    fontWeight: 900,
                                    fontSize: 20,
                                    fontFamily: "Roboto Mono",
                                    color: "#FF3333",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                <Unplug size={16} /> {simulationResult.edgesLost}
                            </div>
                        </div>

                        <div className="brutal-card" style={{ padding: 10 }}>
                            <div
                                style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    opacity: 0.5,
                                }}
                            >
                                Nodes Impacted
                            </div>
                            <div
                                style={{
                                    fontWeight: 900,
                                    fontSize: 20,
                                    fontFamily: "Roboto Mono",
                                    color: "#FF2E88",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                <Zap size={16} /> {simulationResult.impactedNodes.length}
                            </div>
                        </div>

                        <div className="brutal-card" style={{ padding: 10 }}>
                            <div
                                style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    opacity: 0.5,
                                }}
                            >
                                Risk Delta
                            </div>
                            <div
                                style={{
                                    fontWeight: 900,
                                    fontSize: 18,
                                    fontFamily: "Roboto Mono",
                                    color: simulationResult.riskDelta < 0 ? "#9BFF00" : "#FF3333",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                {simulationResult.riskDelta < 0 ? (
                                    <TrendingDown size={16} />
                                ) : (
                                    <TrendingUp size={16} />
                                )}
                                {simulationResult.riskDelta > 0 ? "+" : ""}
                                {simulationResult.riskDelta}
                            </div>
                        </div>

                        <div className="brutal-card" style={{ padding: 10 }}>
                            <div
                                style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    opacity: 0.5,
                                }}
                            >
                                SPOFs
                            </div>
                            <div
                                style={{
                                    fontWeight: 900,
                                    fontSize: 18,
                                    fontFamily: "Roboto Mono",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                <AlertTriangle size={16} />
                                {simulationResult.beforeSpofCount} → {simulationResult.afterSpofCount}
                            </div>
                        </div>
                    </div>

                    {/* Orphaned nodes */}
                    {simulationResult.orphanedNodes.length > 0 && (
                        <div className="brutal-card" style={{ padding: 10, background: "#FFDF00" }}>
                            <div
                                style={{
                                    fontSize: 10,
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    marginBottom: 6,
                                }}
                            >
                                ⚠ Orphaned Nodes (lost all upstream supply)
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {simulationResult.orphanedNodes.map((n) => (
                                    <span
                                        key={n.id}
                                        style={{
                                            fontSize: 10,
                                            fontFamily: "Roboto Mono, monospace",
                                            fontWeight: 700,
                                            padding: "2px 6px",
                                            background: "#000",
                                            color: "#FFF",
                                            border: "2px solid #000",
                                        }}
                                    >
                                        {n.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Recommended Alternatives ──────────────────── */}
                    {simulationResult.alternatives.length > 0 && (
                        <div style={{ marginTop: 14 }}>
                            <h4
                                style={{
                                    fontSize: 12,
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    borderBottom: "3px solid #000",
                                    paddingBottom: 6,
                                    marginBottom: 10,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <Zap size={14} /> Recommended Alternatives
                            </h4>

                            {simulationResult.alternatives.map((alt) => (
                                <div
                                    key={alt.disabledNode.id}
                                    style={{ marginBottom: 14 }}
                                >
                                    {/* Disabled node header */}
                                    <div
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 900,
                                            textTransform: "uppercase",
                                            color: "#FF3333",
                                            marginBottom: 6,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4,
                                        }}
                                    >
                                        <PowerOff size={12} />
                                        Replacing: {alt.disabledNode.name}
                                        <span
                                            style={{
                                                fontSize: 9,
                                                fontFamily: "Roboto Mono",
                                                fontWeight: 600,
                                                opacity: 0.7,
                                            }}
                                        >
                                            ({TIER_LABELS[alt.disabledNode.tier]})
                                        </span>
                                    </div>

                                    {/* Alternative cards */}
                                    {alt.alternatives.map((candidate, idx) => (
                                        <div
                                            key={candidate.node.id}
                                            className="brutal-card"
                                            style={{
                                                padding: "8px 10px",
                                                marginBottom: 6,
                                                borderLeftWidth: 5,
                                                borderLeftColor:
                                                    idx === 0
                                                        ? "#9BFF00"
                                                        : idx === 1
                                                            ? "#FFDF00"
                                                            : "#ddd",
                                                position: "relative",
                                            }}
                                        >
                                            {/* Best Pick badge */}
                                            {idx === 0 && (
                                                <span
                                                    style={{
                                                        position: "absolute",
                                                        top: -6,
                                                        right: 8,
                                                        background: "#9BFF00",
                                                        color: "#000",
                                                        fontSize: 8,
                                                        fontWeight: 900,
                                                        padding: "2px 6px",
                                                        border: "2px solid #000",
                                                        textTransform: "uppercase",
                                                    }}
                                                >
                                                    ★ Best Pick
                                                </span>
                                            )}

                                            {/* Node info */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    marginBottom: 4,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 11,
                                                        fontWeight: 800,
                                                    }}
                                                >
                                                    {candidate.node.name}
                                                </span>
                                                <span
                                                    className="brutal-badge"
                                                    style={{
                                                        fontSize: 10,
                                                        fontWeight: 900,
                                                        fontFamily: "Roboto Mono",
                                                        background: "#000",
                                                        color: "#9BFF00",
                                                    }}
                                                >
                                                    Score: {candidate.score}
                                                </span>
                                            </div>

                                            {/* Region & country */}
                                            <div
                                                style={{
                                                    fontSize: 9,
                                                    fontFamily: "Roboto Mono",
                                                    opacity: 0.6,
                                                    marginBottom: 6,
                                                }}
                                            >
                                                {candidate.node.country} ·{" "}
                                                {candidate.node.region}
                                                {candidate.regionDiversified && (
                                                    <span
                                                        style={{
                                                            color: "#9BFF00",
                                                            fontWeight: 800,
                                                            marginLeft: 4,
                                                            background: "#000",
                                                            padding: "0 3px",
                                                        }}
                                                    >
                                                        +DIV
                                                    </span>
                                                )}
                                            </div>

                                            {/* Cost-Benefit Grid */}
                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "1fr 1fr",
                                                    gap: 4,
                                                    fontSize: 9,
                                                    fontFamily: "Roboto Mono",
                                                }}
                                            >
                                                <div>
                                                    <span style={{ opacity: 0.5 }}>
                                                        Risk Δ:{" "}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontWeight: 800,
                                                            color:
                                                                candidate.riskReduction > 0
                                                                    ? "#9BFF00"
                                                                    : "#FF3333",
                                                        }}
                                                    >
                                                        {candidate.riskReduction > 0
                                                            ? `-${candidate.riskReduction}`
                                                            : `+${Math.abs(
                                                                candidate.riskReduction
                                                            )}`}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span style={{ opacity: 0.5 }}>
                                                        Cost Δ:{" "}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontWeight: 800,
                                                            color:
                                                                candidate.costDelta >= 0
                                                                    ? "#000"
                                                                    : "#FF3333",
                                                        }}
                                                    >
                                                        {candidate.costDelta >= 0
                                                            ? `+${candidate.costDelta}`
                                                            : `${candidate.costDelta}`}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span style={{ opacity: 0.5 }}>
                                                        Stability:{" "}
                                                    </span>
                                                    <span style={{ fontWeight: 800 }}>
                                                        {candidate.node.financial_stability}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span style={{ opacity: 0.5 }}>
                                                        Risk:{" "}
                                                    </span>
                                                    <span style={{ fontWeight: 800 }}>
                                                        {candidate.node.risk_score}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {alt.alternatives.length === 0 && (
                                        <div
                                            style={{
                                                fontSize: 10,
                                                fontFamily: "Roboto Mono",
                                                opacity: 0.5,
                                                padding: 8,
                                            }}
                                        >
                                            No alternatives found in the same tier.
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
