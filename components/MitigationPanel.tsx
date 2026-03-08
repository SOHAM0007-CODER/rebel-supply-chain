"use client";

// ============================================================
// MitigationPanel — Displays recommendations that update
// dynamically when a node is selected in the graph or scatter.
// ============================================================

import React from "react";
import {
    AlertTriangle,
    ShieldAlert,
    Link2,
    TrendingDown,
    Info,
    ChevronRight,
    Zap,
} from "lucide-react";
import { useSupplyChainStore } from "@/lib/store";
import { TIER_LABELS } from "@/lib/mockData";
import type { Mitigation } from "@/lib/algorithms";
import { findAllAlternatives } from "@/lib/alternativeFinder";

// ── Severity badge colors ──────────────────────────────────
const SEVERITY_STYLES: Record<string, { bg: string; text: string }> = {
    critical: { bg: "#FF3333", text: "#FFFFFF" },
    high: { bg: "#FF2E88", text: "#FFFFFF" },
    medium: { bg: "#FFDF00", text: "#000000" },
};

// ── Icons per mitigation type ─────────────────────────────
const TYPE_ICONS: Record<string, React.ReactNode> = {
    spof: <ShieldAlert size={20} />,
    high_risk: <AlertTriangle size={20} />,
    dangerous_dependency: <TrendingDown size={20} />,
    critical_node: <Link2 size={20} />,
};

function MitigationCard({ m }: { m: Mitigation }) {
    const sev = SEVERITY_STYLES[m.severity] ?? SEVERITY_STYLES.medium;

    return (
        <div
            className="brutal-card"
            style={{
                padding: "14px 16px",
                marginBottom: 12,
                borderLeftWidth: 6,
                borderLeftColor: sev.bg,
            }}
        >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ color: sev.bg }}>{TYPE_ICONS[m.type]}</span>
                <span style={{ fontWeight: 900, fontSize: 13, flex: 1 }}>{m.title}</span>
                <span
                    className="brutal-badge"
                    style={{ background: sev.bg, color: sev.text, fontSize: 10 }}
                >
                    {m.severity}
                </span>
            </div>

            {/* Description */}
            <p
                style={{
                    fontSize: 12,
                    lineHeight: 1.5,
                    margin: "0 0 12px 0",
                    fontFamily: "Roboto Mono, monospace",
                }}
            >
                {m.description}
            </p>

            {/* Short Recommendations */}
            {m.alternatives && m.alternatives.length > 0 && (
                <div style={{ marginTop: 12, borderTop: "2px solid rgba(0,0,0,0.1)", paddingTop: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 4, opacity: 0.7 }}>
                        <Zap size={10} /> Recommended Alternatives:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {m.alternatives.map((alt) => (
                            <div
                                key={alt.id}
                                className="brutal-badge"
                                style={{
                                    background: alt.risk_score < 30 ? "#9BFF00" : "#FFDF00",
                                    color: "#000",
                                    fontSize: 9,
                                    padding: "2px 6px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4
                                }}
                                title={`${alt.country} | Risk: ${alt.risk_score} | Cost: ${alt.cost_score}`}
                            >
                                <span style={{ fontWeight: 900 }}>{alt.name}</span>
                                <span style={{ opacity: 0.6, fontSize: 8 }}>({alt.risk_score})</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MitigationPanel() {
    const {
        nodes,
        edges,
        selectedNode,
        mitigations,
        cascadingRisk,
        selectedEfficiencyRatio,
        selectedDependencies,
    } = useSupplyChainStore();

    const recommendedAlternatives = React.useMemo(() => {
        if (!selectedNode || selectedNode.risk_score <= 30) return [];
        const result = findAllAlternatives(new Set([selectedNode.id]), nodes, edges);
        if (result.length > 0) return result[0].alternatives;
        return [];
    }, [selectedNode, nodes, edges]);

    // ── Empty state ──────────────────────────────────────────
    if (!selectedNode) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Info size={48} strokeWidth={3} className="mb-4" />
                <p style={{ fontWeight: 900, fontSize: 16 }}>
                    Select a Supplier Node
                </p>
                <p
                    style={{
                        fontWeight: 500,
                        fontSize: 12,
                        fontFamily: "Roboto Mono, monospace",
                        marginTop: 4,
                        opacity: 0.6,
                    }}
                >
                    Click a node in the network graph or scatter plot to view risk
                    analysis and mitigation recommendations.
                </p>
            </div>
        );
    }

    return (
        <div className="brutal-scrollbar overflow-y-auto h-full" style={{ padding: 16 }}>
            {/* ── Selected Node Header ──────────────────────────── */}
            <div
                style={{
                    background: "#000",
                    color: "#FFF",
                    padding: "14px 16px",
                    marginBottom: 16,
                    border: "3px solid #000",
                    boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.3)",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Zap size={18} />
                    <span style={{ fontWeight: 900, fontSize: 15 }}>
                        {selectedNode.name}
                    </span>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        fontFamily: "Roboto Mono, monospace",
                        fontSize: 11,
                    }}
                >
                    <span
                        className="brutal-badge"
                        style={{ background: "#9BFF00", color: "#000" }}
                    >
                        {TIER_LABELS[selectedNode.tier] ?? `Tier ${selectedNode.tier}`}
                    </span>
                    <span className="brutal-badge" style={{ background: "#FFDF00", color: "#000" }}>
                        Risk: {selectedNode.risk_score}
                    </span>
                    <span className="brutal-badge" style={{ background: "#FF2E88", color: "#FFF" }}>
                        Cost: {selectedNode.cost_score}
                    </span>
                </div>
            </div>

            {/* ── Metrics Strip ─────────────────────────────────── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginBottom: 16,
                }}
            >
                <div className="brutal-card" style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", opacity: 0.5, marginBottom: 2 }}>
                        Cascading Risk
                    </div>
                    <div
                        style={{
                            fontWeight: 900,
                            fontSize: 22,
                            fontFamily: "Roboto Mono, monospace",
                            color:
                                cascadingRisk && cascadingRisk.cascading_risk_score > 70
                                    ? "#FF3333"
                                    : "#000",
                        }}
                    >
                        {cascadingRisk?.cascading_risk_score ?? "—"}
                    </div>
                </div>
                <div className="brutal-card" style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", opacity: 0.5, marginBottom: 2 }}>
                        Efficiency Ratio
                    </div>
                    <div
                        style={{
                            fontWeight: 900,
                            fontSize: 22,
                            fontFamily: "Roboto Mono, monospace",
                            color:
                                selectedEfficiencyRatio !== null && selectedEfficiencyRatio < 1
                                    ? "#FF3333"
                                    : "#000",
                        }}
                    >
                        {selectedEfficiencyRatio ?? "—"}
                    </div>
                </div>
            </div>

            {/* ── Risk Path ─────────────────────────────────────── */}
            {cascadingRisk && cascadingRisk.risk_path.length > 1 && (
                <div className="brutal-card" style={{ padding: "10px 14px", marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", opacity: 0.5, marginBottom: 6 }}>
                        Risk Propagation Path
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
                        {cascadingRisk.risk_path.map((id, i) => {
                            const supplier = useSupplyChainStore.getState().nodes.find((n) => n.id === id);
                            return (
                                <React.Fragment key={id}>
                                    <span
                                        style={{
                                            fontFamily: "Roboto Mono, monospace",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            background: supplier && supplier.risk_score > 70 ? "#FF3333" : "#FFDF00",
                                            color: supplier && supplier.risk_score > 70 ? "#FFF" : "#000",
                                            padding: "2px 6px",
                                            border: "2px solid #000",
                                        }}
                                    >
                                        {supplier?.name ?? id}
                                    </span>
                                    {i < cascadingRisk.risk_path.length - 1 && (
                                        <ChevronRight size={14} strokeWidth={3} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Dependencies Section ────────────────────────── */}
            {selectedDependencies.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <h3
                        style={{
                            fontSize: 13,
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: 10,
                            borderBottom: "3px solid #000",
                            paddingBottom: 6,
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                        }}
                    >
                        <Link2 size={16} /> Incoming Dependencies
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {selectedDependencies.map((dep, i) => (
                            <div
                                key={i}
                                className="brutal-card"
                                style={{
                                    padding: "8px 12px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    background: dep.risk > 70 ? "rgba(255,51,51,0.1)" : "#FFF",
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: 12 }}>{dep.name}</div>
                                    <div style={{ fontSize: 9, fontFamily: "Roboto Mono", opacity: 0.6 }}>
                                        Supplier Risk: {dep.risk}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontWeight: 900, fontSize: 16, fontFamily: "Roboto Mono" }}>
                                        {(dep.weight * 100).toFixed(0)}%
                                    </div>
                                    <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", opacity: 0.5 }}>
                                        Weight
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Rich Alternative Recommendations ──────────────── */}
            {recommendedAlternatives.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <h3
                        style={{
                            fontSize: 13,
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: 10,
                            borderBottom: "3px solid #000",
                            paddingBottom: 6,
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                        }}
                    >
                        <Zap size={16} /> Replacement Recommendations
                    </h3>

                    {recommendedAlternatives.map((candidate, idx) => (
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
                                {candidate.node.country} · {candidate.node.region}
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
                                    <span style={{ opacity: 0.5 }}>Risk Δ: </span>
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
                                            : `+${Math.abs(candidate.riskReduction)}`}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ opacity: 0.5 }}>Cost Δ: </span>
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
                                    <span style={{ opacity: 0.5 }}>Stability: </span>
                                    <span style={{ fontWeight: 800 }}>
                                        {candidate.node.financial_stability}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ opacity: 0.5 }}>Risk: </span>
                                    <span style={{ fontWeight: 800 }}>
                                        {candidate.node.risk_score}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Recommendations Section ──────────────────────── */}
            <div style={{ marginBottom: 8 }}>
                <h3
                    style={{
                        fontSize: 13,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 10,
                        borderBottom: "3px solid #000",
                        paddingBottom: 6,
                    }}
                >
                    Recommendations ({mitigations.length})
                </h3>

                {mitigations.length === 0 ? (
                    <div
                        className="brutal-card"
                        style={{
                            padding: 16,
                            textAlign: "center",
                            background: "#9BFF00",
                        }}
                    >
                        <p style={{ fontWeight: 900, fontSize: 14, margin: 0 }}>
                            ✓ No critical issues detected
                        </p>
                        <p
                            style={{
                                fontFamily: "Roboto Mono, monospace",
                                fontSize: 11,
                                marginTop: 4,
                                opacity: 0.7,
                            }}
                        >
                            This supplier has acceptable risk levels.
                        </p>
                    </div>
                ) : (
                    mitigations.map((m, i) => <MitigationCard key={i} m={m} />)
                )}
            </div>
        </div>
    );
}
