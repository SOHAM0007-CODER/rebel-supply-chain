"use client";

// ============================================================
// RiskCostMatrix — Enhanced scatter plot with quadrant labels
// ============================================================

import React from "react";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Cell,
    Label,
    ReferenceArea,
} from "recharts";
import { useSupplyChainStore } from "@/lib/store";
import { TIER_COLORS } from "@/lib/mockData";

interface PayloadItem {
    payload: {
        name: string;
        cost_score: number;
        risk_score: number;
        tier: number;
        id: string;
    };
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
    const ratio = d.risk_score > 0 ? (d.cost_score / d.risk_score).toFixed(2) : "∞";
    return (
        <div
            style={{
                background: "#FFFFFF",
                border: "3px solid #000",
                boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                padding: "10px 14px",
                fontFamily: "Inter, sans-serif",
            }}
        >
            <p style={{ fontWeight: 900, marginBottom: 4, fontSize: 13 }}>{d.name}</p>
            <p
                style={{
                    fontFamily: "Roboto Mono, monospace",
                    fontSize: 11,
                    margin: 0,
                    lineHeight: 1.6,
                }}
            >
                Cost: {d.cost_score} · Risk: {d.risk_score}
                <br />
                Efficiency: {ratio}
            </p>
        </div>
    );
}

export default function RiskCostMatrix() {
    const { nodes, selectNode, selectedNodeId } = useSupplyChainStore();

    const data = nodes.map((n) => ({
        id: n.id,
        name: n.name,
        cost_score: n.cost_score,
        risk_score: n.risk_score,
        tier: n.tier,
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 10 }}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#000"
                    strokeOpacity={0.15}
                />

                {/* Quadrant shading */}
                <ReferenceArea
                    x1={0} x2={50} y1={50} y2={100}
                    fill="#FF3333" fillOpacity={0.06}
                    label={{ value: "⚠ DANGEROUS", position: "insideTopLeft", style: { fontSize: 10, fontWeight: 900, fill: "#FF3333" } }}
                />
                <ReferenceArea
                    x1={50} x2={100} y1={50} y2={100}
                    fill="#FF2E88" fillOpacity={0.06}
                    label={{ value: "✕ WORST", position: "insideTopRight", style: { fontSize: 10, fontWeight: 900, fill: "#FF2E88" } }}
                />
                <ReferenceArea
                    x1={0} x2={50} y1={0} y2={50}
                    fill="#9BFF00" fillOpacity={0.08}
                    label={{ value: "✓ IDEAL", position: "insideBottomLeft", style: { fontSize: 10, fontWeight: 900, fill: "#2a8c00" } }}
                />
                <ReferenceArea
                    x1={50} x2={100} y1={0} y2={50}
                    fill="#FFDF00" fillOpacity={0.06}
                    label={{ value: "$ EXPENSIVE", position: "insideBottomRight", style: { fontSize: 10, fontWeight: 900, fill: "#b8a000" } }}
                />

                <XAxis
                    type="number"
                    dataKey="cost_score"
                    domain={[0, 100]}
                    tick={{ fontFamily: "Roboto Mono", fontSize: 11, fontWeight: 700 }}
                    stroke="#000"
                    strokeWidth={2}
                >
                    <Label
                        value="Cost Score →"
                        position="insideBottom"
                        offset={-15}
                        style={{ fontWeight: 900, fontFamily: "Inter", fontSize: 12 }}
                    />
                </XAxis>

                <YAxis
                    type="number"
                    dataKey="risk_score"
                    domain={[0, 100]}
                    tick={{ fontFamily: "Roboto Mono", fontSize: 11, fontWeight: 700 }}
                    stroke="#000"
                    strokeWidth={2}
                >
                    <Label
                        value="Risk Score →"
                        angle={-90}
                        position="insideLeft"
                        offset={5}
                        style={{ fontWeight: 900, fontFamily: "Inter", fontSize: 12 }}
                    />
                </YAxis>

                <ReferenceLine
                    x={50}
                    stroke="#000"
                    strokeDasharray="6 4"
                    strokeWidth={2}
                />
                <ReferenceLine
                    y={50}
                    stroke="#000"
                    strokeDasharray="6 4"
                    strokeWidth={2}
                />

                <Tooltip content={<CustomTooltip />} />

                <Scatter
                    data={data}
                    onClick={(point: unknown) => {
                        const p = point as { id?: string } | null;
                        if (p?.id) selectNode(p.id);
                    }}
                    cursor="pointer"
                >
                    {data.map((entry) => {
                        const isSelected = selectedNodeId === entry.id;
                        const isHighRisk = entry.risk_score > 70;
                        const fill = isHighRisk
                            ? "#FF3333"
                            : (TIER_COLORS[entry.tier] ?? "#FFDF00");
                        return (
                            <Cell
                                key={entry.id}
                                fill={fill}
                                stroke="#000"
                                strokeWidth={isSelected ? 4 : 2}
                                r={isSelected ? 10 : 7}
                            />
                        );
                    })}
                </Scatter>
            </ScatterChart>
        </ResponsiveContainer>
    );
}
