"use client";

// ============================================================
// Concentration Warning Banner
// Displays geographic concentration risk alert on dashboard
// ============================================================

import React from "react";
import { AlertTriangle, AlertCircle, TrendingDown } from "lucide-react";
import { useSupplyChainStore } from "@/lib/store";

export default function ConcentrationWarningBanner() {
    const { networkAnalytics } = useSupplyChainStore();
    const concentrationResult = networkAnalytics.concentrationRisk;
    const warningMessage = networkAnalytics.concentrationWarning;

    if (!concentrationResult || !concentrationResult.mostConcentratedRegion) {
        return null; // Don't show if no concentration risk
    }

    const { region, percentage, nodeCount, risk } = concentrationResult.mostConcentratedRegion;
    const warningLevel = concentrationResult.warningLevel;

    // Color based on warning level
    const colorMap = {
        low: { bg: "#e0f7fa", border: "#01579b", text: "#01579b", icon: AlertCircle },
        medium: { bg: "#fff3e0", border: "#e65100", text: "#e65100", icon: AlertTriangle },
        high: { bg: "#ffe0b2", border: "#d84315", text: "#d84315", icon: AlertTriangle },
        critical: { bg: "#ffebee", border: "#c62828", text: "#c62828", icon: AlertTriangle },
    };

    const colors = colorMap[warningLevel];
    const Icon = colors.icon;

    return (
        <div
            style={{
                background: colors.bg,
                border: `2px solid ${colors.border}`,
                borderRadius: "8px",
                padding: "12px 14px",
                marginBottom: "12px",
                color: colors.text,
                fontWeight: 500,
            }}
        >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <Icon size={18} style={{ marginTop: "2px", flexShrink: 0 }} />
                <div style={{ flexGrow: 1 }}>
                    <div
                        style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "4px",
                        }}
                    >
                        {warningLevel === "critical"
                            ? "🚨 CRITICAL CONCENTRATION RISK"
                            : warningLevel === "high"
                            ? "⚠️ HIGH CONCENTRATION RISK"
                            : warningLevel === "medium"
                            ? "⚡ MODERATE CONCENTRATION RISK"
                            : "ℹ️ LOW CONCENTRATION RISK"}
                    </div>
                    <div style={{ fontSize: "12px", lineHeight: 1.5 }}>
                        <strong>{nodeCount}</strong> of <strong>{networkAnalytics.totalNodes}</strong> suppliers are concentrated in{" "}
                        <strong>{region}</strong> (<strong>{percentage}%</strong>). Concentration Risk Score:{" "}
                        <strong>{risk}/100</strong>
                    </div>
                    <div style={{ fontSize: "11px", marginTop: "6px", opacity: 0.8, fontStyle: "italic" }}>
                        Consider diversifying suppliers in this region to reduce supply chain fragility.
                    </div>
                </div>
            </div>
        </div>
    );
}
