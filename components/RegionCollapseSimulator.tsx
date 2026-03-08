"use client";

import React, { useState } from "react";
import { Globe, Play, AlertOctagon, TrendingDown, Factory, Package, ShieldAlert } from "lucide-react";
import { useSupplyChainStore } from "@/lib/store";
import { simulateRegionCollapse, RegionCollapseResult } from "@/lib/algorithms";

export default function RegionCollapseSimulator() {
    const { nodes, edges } = useSupplyChainStore();
    const [selectedRegion, setSelectedRegion] = useState("Asia");
    const [result, setResult] = useState<RegionCollapseResult | null>(null);

    const regions = Array.from(new Set(nodes.map((n) => n.region))).sort();

    const handleRunSimulation = () => {
        const simulationResult = simulateRegionCollapse(selectedRegion, nodes, edges);
        setResult(simulationResult);
    };

    return (
        <div className="brutal-card" style={{ padding: 14, background: "#FFF", marginBottom: 20 }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                    borderBottom: "3px solid #000",
                    paddingBottom: 8,
                }}
            >
                <div
                    style={{
                        background: "#FFDF00",
                        padding: "4px",
                        display: "inline-flex",
                        border: "2px solid #000",
                    }}
                >
                    <Globe size={18} strokeWidth={3} />
                </div>
                <h3
                    style={{
                        fontSize: 13,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        margin: 0,
                    }}
                >
                    Region Collapse Simulation
                </h3>
            </div>

            <div style={{ marginBottom: 12 }}>
                <label
                    style={{
                        display: "block",
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        marginBottom: 4,
                        opacity: 0.6,
                    }}
                >
                    Select Region:
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                    <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        style={{
                            flex: 1,
                            padding: "8px",
                            border: "3px solid #000",
                            fontWeight: 900,
                            fontSize: 12,
                            background: "#FFF",
                            outline: "none",
                            cursor: "pointer",
                        }}
                    >
                        {regions.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleRunSimulation}
                        className="brutal-btn"
                        style={{
                            background: "#9BFF00",
                            padding: "0 14px",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 11,
                            fontWeight: 900,
                        }}
                    >
                        <Play size={14} fill="currentColor" /> Run Simulation
                    </button>
                </div>
            </div>

            {result && (
                <div style={{ marginTop: 20 }}>
                    <h4
                        style={{
                            fontSize: 12,
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: "3px solid #000",
                            paddingBottom: 6,
                            marginBottom: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <AlertOctagon size={14} color="#FF3333" />
                        Region Collapse Impact
                    </h4>

                    <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 12 }}>
                        Region: <span style={{ color: "#FF2E88" }}>{selectedRegion}</span>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 10,
                            marginBottom: 14,
                        }}
                    >
                        <div>
                            <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.5, textTransform: "uppercase" }}>
                                Suppliers disrupted
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 900 }}>{result.disruptedSuppliers}</div>
                        </div>

                        <div>
                            <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.5, textTransform: "uppercase" }}>
                                Manufacturers halted
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 900 }}>{result.affectedManufacturers}</div>
                        </div>

                        <div style={{ gridColumn: "span 2" }}>
                            <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.5, textTransform: "uppercase" }}>
                                Products affected
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 800, marginTop: 2 }}>
                                {result.affectedProducts.join(", ")}
                            </div>
                        </div>

                        <div style={{ gridColumn: "span 2" }}>
                            <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.5, textTransform: "uppercase" }}>
                                Production capacity lost
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 900, display: "flex", alignItems: "center", gap: 6 }}>
                                <TrendingDown size={18} color="#FF3333" />
                                {result.productionLoss.toLocaleString()} units
                            </div>
                        </div>
                    </div>

                    <div
                        className="brutal-card"
                        style={{
                            padding: 12,
                            background: "#9BFF00",
                            border: "3px solid #000",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 10,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginBottom: 4,
                            }}
                        >
                            <ShieldAlert size={14} />
                            Suggested mitigation:
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 800, lineHeight: 1.3 }}>
                            {result.suggestedMitigation}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
