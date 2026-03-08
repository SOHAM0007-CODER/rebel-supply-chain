"use client";

// ============================================================
// TierBreakdownChart — Bar chart showing avg risk by tier
// ============================================================

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Label,
} from "recharts";
import { useSupplyChainStore } from "@/lib/store";
import { TIER_COLORS } from "@/lib/mockData";

interface PayloadItem {
    payload: { label: string; count: number; avgRisk: number; tier: number };
}

function CustomTooltip({
    active,
    payload,
}: {
    active?: boolean;
    payload?: PayloadItem[];
}) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div
            style={{
                background: "#FFF",
                border: "3px solid #000",
                boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                padding: "8px 12px",
                fontFamily: "Inter, sans-serif",
            }}
        >
            <p style={{ fontWeight: 900, marginBottom: 2, fontSize: 12 }}>{d.label}</p>
            <p
                style={{
                    fontFamily: "Roboto Mono, monospace",
                    fontSize: 11,
                    margin: 0,
                }}
            >
                Suppliers: {d.count} · Avg Risk: {d.avgRisk}
            </p>
        </div>
    );
}

export default function TierBreakdownChart() {
    const { networkAnalytics } = useSupplyChainStore();
    const { tierBreakdown } = networkAnalytics;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={tierBreakdown}
                margin={{ top: 10, right: 20, bottom: 25, left: 5 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#000"
                    strokeOpacity={0.1}
                />
                <XAxis
                    dataKey="label"
                    tick={{ fontFamily: "Roboto Mono", fontSize: 10, fontWeight: 700 }}
                    stroke="#000"
                    strokeWidth={2}
                />
                <YAxis
                    tick={{ fontFamily: "Roboto Mono", fontSize: 10, fontWeight: 700 }}
                    stroke="#000"
                    strokeWidth={2}
                >
                    <Label
                        value="Avg Risk"
                        angle={-90}
                        position="insideLeft"
                        offset={10}
                        style={{
                            fontWeight: 900,
                            fontFamily: "Inter",
                            fontSize: 11,
                        }}
                    />
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgRisk" stroke="#000" strokeWidth={2}>
                    {tierBreakdown.map((entry) => (
                        <Cell
                            key={entry.tier}
                            fill={TIER_COLORS[entry.tier] ?? "#FFDF00"}
                            stroke="#000"
                            strokeWidth={2}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
