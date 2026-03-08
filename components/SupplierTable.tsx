"use client";

// ============================================================
// SupplierTable — Full data table with search, filter, sort
// columns: Name, Tier, Industry, Risk, Cost, Efficiency, Cascading, SPOF
// ============================================================

import React, { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, Filter, X } from "lucide-react";
import { useSupplyChainStore, NodeAnalysis } from "@/lib/store";
import { TIER_LABELS, TIER_COLORS } from "@/lib/mockData";

type SortKey = keyof NodeAnalysis;

export default function SupplierTable() {
    const { networkAnalytics, selectNode, selectedNodeId } = useSupplyChainStore();
    const { nodeAnalyses } = networkAnalytics;

    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("risk_score");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [tierFilter, setTierFilter] = useState<number | null>(null);

    const filtered = useMemo(() => {
        let result = [...nodeAnalyses];

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (n) =>
                    n.name.toLowerCase().includes(q) ||
                    n.products.toLowerCase().includes(q)
            );
        }

        if (tierFilter !== null) {
            result = result.filter((n) => n.tier === tierFilter);
        }

        result.sort((a, b) => {
            const av = a[sortKey];
            const bv = b[sortKey];
            if (typeof av === "number" && typeof bv === "number") {
                return sortDir === "asc" ? av - bv : bv - av;
            }
            if (typeof av === "boolean" && typeof bv === "boolean") {
                return sortDir === "asc"
                    ? (av ? 1 : 0) - (bv ? 1 : 0)
                    : (bv ? 1 : 0) - (av ? 1 : 0);
            }
            return (
                String(av).localeCompare(String(bv)) * (sortDir === "asc" ? 1 : -1)
            );
        });

        return result;
    }, [nodeAnalyses, search, sortKey, sortDir, tierFilter]);

    function handleSort(key: SortKey) {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
    }

    function SortIcon({ col }: { col: SortKey }) {
        if (sortKey !== col) return null;
        return sortDir === "asc" ? (
            <ChevronUp size={12} strokeWidth={3} />
        ) : (
            <ChevronDown size={12} strokeWidth={3} />
        );
    }

    const headerStyle: React.CSSProperties = {
        fontSize: 10,
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        cursor: "pointer",
        padding: "8px 10px",
        borderBottom: "3px solid #000",
        background: "#FFDF00",
        whiteSpace: "nowrap",
        userSelect: "none",
    };

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Search + filter bar */}
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    padding: "12px 16px",
                    borderBottom: "3px solid #000",
                    background: "#FFF",
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        border: "3px solid #000",
                        background: "#FFF",
                        padding: "4px 10px",
                        flex: 1,
                        minWidth: 200,
                    }}
                >
                    <Search size={14} strokeWidth={3} />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            border: "none",
                            outline: "none",
                            fontFamily: "Roboto Mono, monospace",
                            fontSize: 12,
                            fontWeight: 600,
                            flex: 1,
                            marginLeft: 8,
                            background: "transparent",
                        }}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            style={{ cursor: "pointer", background: "none", border: "none" }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <Filter size={14} strokeWidth={3} />
                    <button
                        onClick={() => setTierFilter(null)}
                        className="brutal-btn"
                        style={{
                            fontSize: 9,
                            padding: "3px 8px",
                            background: tierFilter === null ? "#000" : "#FFF",
                            color: tierFilter === null ? "#FFF" : "#000",
                        }}
                    >
                        All
                    </button>
                    {[4, 3, 2, 1, 0].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTierFilter(tierFilter === t ? null : t)}
                            className="brutal-btn"
                            style={{
                                fontSize: 9,
                                padding: "3px 8px",
                                background: tierFilter === t ? TIER_COLORS[t] : "#FFF",
                                color: tierFilter === t && t !== 0 ? "#000" : "#000",
                            }}
                        >
                            {TIER_LABELS[t]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflow: "auto" }} className="brutal-scrollbar">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={headerStyle} onClick={() => handleSort("name")}>
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    Supplier <SortIcon col="name" />
                                </span>
                            </th>
                            <th style={headerStyle} onClick={() => handleSort("tier")}>
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    Tier <SortIcon col="tier" />
                                </span>
                            </th>
                            <th style={headerStyle} onClick={() => handleSort("risk_score")}>
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    Risk <SortIcon col="risk_score" />
                                </span>
                            </th>
                            <th style={headerStyle} onClick={() => handleSort("cost_score")}>
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    Cost <SortIcon col="cost_score" />
                                </span>
                            </th>
                            <th
                                style={headerStyle}
                                onClick={() => handleSort("cascading_risk")}
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    Cascading <SortIcon col="cascading_risk" />
                                </span>
                            </th>
                            <th
                                style={headerStyle}
                                onClick={() => handleSort("efficiency_ratio")}
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    Efficiency <SortIcon col="efficiency_ratio" />
                                </span>
                            </th>
                            <th
                                style={headerStyle}
                                onClick={() => handleSort("connectivity")}
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    Connections <SortIcon col="connectivity" />
                                </span>
                            </th>
                            <th style={headerStyle} onClick={() => handleSort("is_spof")}>
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    SPOF <SortIcon col="is_spof" />
                                </span>
                            </th>
                            <th
                                style={headerStyle}
                                onClick={() => handleSort("mitigation_count")}
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    Issues <SortIcon col="mitigation_count" />
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((node) => {
                            const isSelected = selectedNodeId === node.id;
                            return (
                                <tr
                                    key={node.id}
                                    onClick={() => selectNode(node.id)}
                                    style={{
                                        cursor: "pointer",
                                        background: isSelected
                                            ? "#FF2E88"
                                            : node.risk_score > 55
                                                ? "rgba(255,51,51,0.1)"
                                                : "#FFF",
                                        color: isSelected ? "#FFF" : "#000",
                                        borderBottom: "2px solid #000",
                                        transition: "background 0.1s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected)
                                            e.currentTarget.style.background = "rgba(255,223,0,0.2)";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.background =
                                                node.risk_score > 55
                                                    ? "rgba(255,51,51,0.1)"
                                                    : "#FFF";
                                        }
                                    }}
                                >
                                    <td
                                        style={{
                                            padding: "8px 10px",
                                            fontWeight: 800,
                                            fontSize: 12,
                                        }}
                                    >
                                        {node.name}
                                    </td>
                                    <td style={{ padding: "8px 10px" }}>
                                        <span
                                            style={{
                                                fontSize: 9,
                                                fontWeight: 700,
                                                padding: "2px 6px",
                                                background: isSelected
                                                    ? "#000"
                                                    : (TIER_COLORS[node.tier] ?? "#FFF"),
                                                color: isSelected ? "#FFF" : "#000",
                                                border: "2px solid #000",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {TIER_LABELS[node.tier]}
                                        </span>
                                    </td>
                                    <td
                                        style={{
                                            padding: "8px 10px",
                                            fontFamily: "Roboto Mono",
                                            fontWeight: 700,
                                            fontSize: 12,
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <div
                                                style={{
                                                    width: 40,
                                                    height: 8,
                                                    background: "rgba(0,0,0,0.1)",
                                                    border: "1px solid rgba(0,0,0,0.2)",
                                                    position: "relative",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${node.risk_score}%`,
                                                        height: "100%",
                                                        background:
                                                            node.risk_score > 55
                                                                ? "#FF3333"
                                                                : node.risk_score > 50
                                                                    ? "#FFDF00"
                                                                    : "#9BFF00",
                                                    }}
                                                />
                                            </div>
                                            {node.risk_score}
                                        </div>
                                    </td>
                                    <td
                                        style={{
                                            padding: "8px 10px",
                                            fontFamily: "Roboto Mono",
                                            fontWeight: 700,
                                            fontSize: 12,
                                        }}
                                    >
                                        {node.cost_score}
                                    </td>
                                    <td
                                        style={{
                                            padding: "8px 10px",
                                            fontFamily: "Roboto Mono",
                                            fontWeight: 700,
                                            fontSize: 12,
                                            color: isSelected
                                                ? "#FFF"
                                                : node.cascading_risk > 55
                                                    ? "#FF3333"
                                                    : "#000",
                                        }}
                                    >
                                        {node.cascading_risk}
                                    </td>
                                    <td
                                        style={{
                                            padding: "8px 10px",
                                            fontFamily: "Roboto Mono",
                                            fontWeight: 700,
                                            fontSize: 12,
                                            color: isSelected
                                                ? "#FFF"
                                                : node.efficiency_ratio < 1
                                                    ? "#FF3333"
                                                    : "#000",
                                        }}
                                    >
                                        {node.efficiency_ratio}
                                    </td>
                                    <td
                                        style={{
                                            padding: "8px 10px",
                                            fontFamily: "Roboto Mono",
                                            fontWeight: 700,
                                            fontSize: 12,
                                        }}
                                    >
                                        {node.connectivity}
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "center" }}>
                                        {node.is_spof && (
                                            <span
                                                style={{
                                                    background: "#FF3333",
                                                    color: "#FFF",
                                                    fontWeight: 900,
                                                    fontSize: 9,
                                                    padding: "2px 6px",
                                                    border: "2px solid #000",
                                                    textTransform: "uppercase",
                                                }}
                                            >
                                                SPOF
                                            </span>
                                        )}
                                    </td>
                                    <td
                                        style={{
                                            padding: "8px 10px",
                                            textAlign: "center",
                                            fontFamily: "Roboto Mono",
                                            fontWeight: 700,
                                            fontSize: 12,
                                        }}
                                    >
                                        {node.mitigation_count > 0 && (
                                            <span
                                                style={{
                                                    background: isSelected ? "#000" : "#FF2E88",
                                                    color: "#FFF",
                                                    fontWeight: 900,
                                                    fontSize: 11,
                                                    padding: "2px 8px",
                                                    border: "2px solid #000",
                                                }}
                                            >
                                                {node.mitigation_count}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div
                style={{
                    padding: "6px 16px",
                    borderTop: "3px solid #000",
                    background: "#F5F5F0",
                    fontSize: 11,
                    fontFamily: "Roboto Mono, monospace",
                    fontWeight: 600,
                }}
            >
                Showing {filtered.length} of {nodeAnalyses.length} suppliers
            </div>
        </div>
    );
}
