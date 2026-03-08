"use client";

// ============================================================
// Analytics Page — Network-wide analysis dashboard
// Shows: tier breakdown, risk distribution, top risky suppliers,
// SPOF summary, and full network statistics.
// ============================================================

import React from "react";
import dynamic from "next/dynamic";
import {
    AlertTriangle,
    Activity,
    Layers,
    ShieldCheck,
    TrendingDown,
    BarChart3,
    Target,
    Zap,
    ArrowRight,
    Maximize2,
    X,
} from "lucide-react";
import { useSupplyChainStore } from "@/lib/store";
import { TIER_LABELS, TIER_COLORS } from "@/lib/mockData";
import Navigation from "@/components/Navigation";

const TierBreakdownChart = dynamic(
    () => import("@/components/TierBreakdownChart"),
    { ssr: false }
);
const RiskCostMatrix = dynamic(
    () => import("@/components/RiskCostMatrix"),
    { ssr: false }
);

function BigStat({
    icon,
    label,
    value,
    bg,
    textColor = "#000",
    subtext,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    bg: string;
    textColor?: string;
    subtext?: string;
}) {
    return (
        <div
            className="brutal-card"
            style={{ padding: "16px 20px", background: bg, color: textColor }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {icon}
                <span
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        opacity: 0.6,
                    }}
                >
                    {label}
                </span>
            </div>
            <div
                style={{
                    fontWeight: 900,
                    fontSize: 32,
                    fontFamily: "Roboto Mono, monospace",
                    lineHeight: 1,
                }}
            >
                {value}
            </div>
            {subtext && (
                <div
                    style={{
                        fontSize: 10,
                        fontFamily: "Roboto Mono, monospace",
                        opacity: 0.6,
                        marginTop: 4,
                    }}
                >
                    {subtext}
                </div>
            )}
        </div>
    );
}

function MaximizeButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
            <Maximize2 size={14} strokeWidth={3} />
        </button>
    );
}

export default function AnalyticsPage() {
    const { networkAnalytics, selectNode } = useSupplyChainStore();
    const [maximizedSection, setMaximizedSection] = React.useState<string | null>(null);

    const {
        totalNodes,
        totalEdges,
        avgRisk,
        avgCost,
        maxRisk,
        spofCount,
        spofIds,
        highRiskCount,
        dangerousDepCount,
        tierBreakdown,
        nodeAnalyses,
    } = networkAnalytics;

    // Top 5 riskiest suppliers
    const topRisky = [...nodeAnalyses]
        .sort((a, b) => b.cascading_risk - a.cascading_risk)
        .slice(0, 5);

    // Most connected
    const mostConnected = [...nodeAnalyses]
        .sort((a, b) => b.connectivity - a.connectivity)
        .slice(0, 5);

    const renderSection = (id: string, isMaximized = false) => {
        const headerStyle: React.CSSProperties = {
            fontSize: isMaximized ? 18 : 12,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 12,
            margin: 0,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        };

        switch (id) {
            case "risk-tier":
                return (
                    <>
                        <h3 style={headerStyle}>
                            <span>
                                <BarChart3
                                    size={isMaximized ? 20 : 14}
                                    strokeWidth={3}
                                    style={{ display: "inline", marginRight: 6 }}
                                />
                                Risk by Tier
                            </span>
                            {!isMaximized && <MaximizeButton onClick={() => setMaximizedSection("risk-tier")} />}
                        </h3>
                        <div style={{ height: isMaximized ? "70vh" : 250, marginTop: 10 }}>
                            <TierBreakdownChart />
                        </div>
                    </>
                );
            case "risk-cost":
                return (
                    <>
                        <h3 style={headerStyle}>
                            <span>
                                <Target
                                    size={isMaximized ? 20 : 14}
                                    strokeWidth={3}
                                    style={{ display: "inline", marginRight: 6 }}
                                />
                                Risk vs Cost Matrix
                            </span>
                            {!isMaximized && <MaximizeButton onClick={() => setMaximizedSection("risk-cost")} />}
                        </h3>
                        <div style={{ height: isMaximized ? "70vh" : 250, marginTop: 10 }}>
                            <RiskCostMatrix />
                        </div>
                    </>
                );
            case "top-risky":
                return (
                    <>
                        <h3 style={{ ...headerStyle, borderBottom: isMaximized ? "4px solid #000" : "3px solid #000", paddingBottom: 6 }}>
                            <span>🔴 Top 5 Riskiest (Cascading)</span>
                            {!isMaximized && <MaximizeButton onClick={() => setMaximizedSection("top-risky")} />}
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: isMaximized ? 12 : 6, marginTop: isMaximized ? 20 : 10 }}>
                            {topRisky.map((n, i) => (
                                <div
                                    key={n.id}
                                    onClick={() => {
                                        if (isMaximized) setMaximizedSection(null);
                                        selectNode(n.id);
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        padding: isMaximized ? "16px 20px" : "6px 8px",
                                        border: isMaximized ? "3px solid #000" : "2px solid #000",
                                        cursor: "pointer",
                                        background: n.cascading_risk > 55 ? "rgba(255,51,51,0.1)" : "#FFF",
                                        transition: "all 0.1s",
                                        boxShadow: isMaximized ? "6px 6px 0px 0px rgba(0,0,0,1)" : "none",
                                    }}
                                    className={isMaximized ? "brutal-btn" : ""}
                                >
                                    <span
                                        style={{
                                            fontWeight: 900,
                                            fontSize: isMaximized ? 24 : 14,
                                            fontFamily: "Roboto Mono",
                                            width: isMaximized ? 40 : 20,
                                            color: "#FF3333",
                                        }}
                                    >
                                        {i + 1}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: isMaximized ? 16 : 11, lineHeight: 1.2 }}>
                                            {n.name}
                                        </div>
                                        <div style={{ fontSize: isMaximized ? 12 : 9, fontFamily: "Roboto Mono", opacity: 0.6 }}>
                                            {TIER_LABELS[n.tier]}
                                        </div>
                                    </div>
                                    <span
                                        style={{
                                            fontWeight: 900,
                                            fontSize: isMaximized ? 24 : 14,
                                            fontFamily: "Roboto Mono",
                                            color: n.cascading_risk > 55 ? "#FF3333" : "#000",
                                        }}
                                    >
                                        {n.cascading_risk}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case "most-connected":
                return (
                    <>
                        <h3 style={{ ...headerStyle, borderBottom: isMaximized ? "4px solid #000" : "3px solid #000", paddingBottom: 6 }}>
                            <span>🔗 Most Connected Nodes</span>
                            {!isMaximized && <MaximizeButton onClick={() => setMaximizedSection("most-connected")} />}
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: isMaximized ? 12 : 6, marginTop: isMaximized ? 20 : 10 }}>
                            {mostConnected.map((n, i) => (
                                <div
                                    key={n.id}
                                    onClick={() => {
                                        if (isMaximized) setMaximizedSection(null);
                                        selectNode(n.id);
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        padding: isMaximized ? "16px 20px" : "6px 8px",
                                        border: isMaximized ? "3px solid #000" : "2px solid #000",
                                        cursor: "pointer",
                                        background: "#FFF",
                                        transition: "all 0.1s",
                                        boxShadow: isMaximized ? "6px 6px 0px 0px rgba(0,0,0,1)" : "none",
                                    }}
                                    className={isMaximized ? "brutal-btn" : ""}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: isMaximized ? 16 : 11, lineHeight: 1.2 }}>
                                            {n.name}
                                        </div>
                                        <div style={{ fontSize: isMaximized ? 12 : 9, fontFamily: "Roboto Mono", opacity: 0.6 }}>
                                            {n.is_spof && (
                                                <span
                                                    style={{
                                                        background: "#FF3333",
                                                        color: "#FFF",
                                                        padding: "0 6px",
                                                        marginRight: 6,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    SPOF
                                                </span>
                                            )}
                                            {TIER_LABELS[n.tier]}
                                        </div>
                                    </div>
                                    <span
                                        style={{
                                            fontWeight: 900,
                                            fontSize: isMaximized ? 24 : 14,
                                            fontFamily: "Roboto Mono",
                                            background: "#000",
                                            color: "#FFF",
                                            padding: isMaximized ? "4px 16px" : "2px 8px",
                                            border: "3px solid #000",
                                        }}
                                    >
                                        {n.connectivity}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                overflow: "hidden",
                background: "#F5F5F0",
            }}
        >
            <Navigation />

            <div
                className="brutal-scrollbar"
                style={{ flex: 1, overflow: "auto", padding: 20 }}
            >
                {/* ── Page title ──────────────────────────────────── */}
                <div style={{ marginBottom: 20 }}>
                    <h1
                        style={{
                            fontSize: 24,
                            fontWeight: 900,
                            letterSpacing: "-0.02em",
                            margin: 0,
                        }}
                    >
                        Network Analytics
                    </h1>
                    <p
                        style={{
                            fontSize: 11,
                            fontFamily: "Roboto Mono, monospace",
                            opacity: 0.6,
                            marginTop: 4,
                        }}
                    >
                        Comprehensive risk analysis across your entire supply chain network
                    </p>
                </div>

                {/* ── KPI Cards ───────────────────────────────────── */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 12,
                        marginBottom: 20,
                    }}
                >
                    <BigStat
                        icon={<Layers size={16} strokeWidth={3} />}
                        label="Total Suppliers"
                        value={totalNodes}
                        bg="#FFF"
                        subtext={`${totalEdges} connections`}
                    />
                    <BigStat
                        icon={<Activity size={16} strokeWidth={3} />}
                        label="Avg Risk Score"
                        value={avgRisk}
                        bg="#FFDF00"
                        subtext={`Max: ${maxRisk}`}
                    />
                    <BigStat
                        icon={<AlertTriangle size={16} strokeWidth={3} />}
                        label="High Risk Nodes"
                        value={highRiskCount}
                        bg="#FF3333"
                        textColor="#FFF"
                        subtext="Score > 55"
                    />
                    <BigStat
                        icon={<ShieldCheck size={16} strokeWidth={3} />}
                        label="Single Points of Failure"
                        value={spofCount}
                        bg="#FF2E88"
                        textColor="#FFF"
                    />
                    <BigStat
                        icon={<TrendingDown size={16} strokeWidth={3} />}
                        label="Dangerous Dependencies"
                        value={dangerousDepCount}
                        bg="#9BFF00"
                        subtext="Efficiency < 1.0"
                    />
                    <BigStat
                        icon={<Target size={16} strokeWidth={3} />}
                        label="Avg Cost Score"
                        value={avgCost}
                        bg="#FFF"
                    />
                </div>

                {/* ── Charts row ──────────────────────────────────── */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                        marginBottom: 20,
                    }}
                >
                    <div className="brutal-card" style={{ padding: 16 }}>
                        {renderSection("risk-tier")}
                    </div>
                    <div className="brutal-card" style={{ padding: 16 }}>
                        {renderSection("risk-cost")}
                    </div>
                </div>

                {/* ── Data tables row ─────────────────────────────── */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 12,
                        marginBottom: 20,
                    }}
                >
                    <div className="brutal-card" style={{ padding: 14 }}>
                        {renderSection("top-risky")}
                    </div>

                    {/* Dangerous Dependencies (No maximize requested for this one specifically, but keeping it as is) */}
                    <div className="brutal-card" style={{ padding: 14 }}>
                        <h3
                            style={{
                                fontSize: 11,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: 10,
                                borderBottom: "3px solid #000",
                                paddingBottom: 6,
                            }}
                        >
                            ⚠ Dangerous Dependencies
                        </h3>
                        {nodeAnalyses.filter(n => n.efficiency_ratio < 1 && n.risk_score > 35).length === 0 ? (
                            <div
                                style={{
                                    padding: 12,
                                    textAlign: "center",
                                    background: "#9BFF00",
                                    border: "2px solid #000",
                                }}
                            >
                                <p style={{ fontWeight: 900, fontSize: 12, margin: 0 }}>
                                    ✓ None detected
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {nodeAnalyses.filter(n => n.efficiency_ratio < 1 && n.risk_score > 35).map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => selectNode(n.id)}
                                        style={{
                                            padding: "6px 8px",
                                            border: "2px solid #000",
                                            cursor: "pointer",
                                            background: "rgba(255,46,136,0.1)",
                                            transition: "background 0.1s",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(255,223,0,0.2)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "rgba(255,46,136,0.1)";
                                        }}
                                    >
                                        <div style={{ fontWeight: 800, fontSize: 11 }}>{n.name}</div>
                                        <div
                                            style={{
                                                fontSize: 9,
                                                fontFamily: "Roboto Mono",
                                                display: "flex",
                                                gap: 8,
                                            }}
                                        >
                                            <span>Risk: {n.risk_score}</span>
                                            <span>Cost: {n.cost_score}</span>
                                            <span style={{ color: "#FF3333", fontWeight: 700 }}>
                                                Eff: {n.efficiency_ratio}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="brutal-card" style={{ padding: 14 }}>
                        {renderSection("most-connected")}
                    </div>
                </div>

                {/* ── Tier summary cards ──────────────────────────── */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 12,
                        marginBottom: 20,
                    }}
                >
                    {tierBreakdown.map((t) => (
                        <div
                            key={t.tier}
                            className="brutal-card"
                            style={{
                                padding: 14,
                                background: TIER_COLORS[t.tier] ?? "#FFF",
                                borderLeftWidth: 6,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 10,
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: 8,
                                }}
                            >
                                Tier {t.tier}: {t.label}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontFamily: "Roboto Mono",
                                    fontSize: 12,
                                    fontWeight: 700,
                                }}
                            >
                                <span>{t.count} suppliers</span>
                                <span>Avg Risk: {t.avgRisk}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Maximized Overlay ───────────────────────────── */}
            {maximizedSection && (
                <div className="maximize-overlay" onClick={() => setMaximizedSection(null)}>
                    <div
                        className="maximized-content brutal-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                        style={{ padding: 30, overflowY: "auto" }}
                    >
                        <button
                            onClick={() => setMaximizedSection(null)}
                            style={{
                                position: "absolute",
                                top: 20,
                                right: 20,
                                background: "#000",
                                color: "#FFF",
                                border: "none",
                                cursor: "pointer",
                                padding: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 10,
                            }}
                        >
                            <X size={20} />
                        </button>
                        {renderSection(maximizedSection, true)}
                    </div>
                </div>
            )}
        </div>
    );
}

