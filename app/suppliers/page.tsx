"use client";

// ============================================================
// Suppliers Page — Full data table with search/filter/sort
// plus detail sidebar
// ============================================================

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import AddSupplierModal from "@/components/AddSupplierModal";

const SupplierTable = dynamic(() => import("@/components/SupplierTable"), {
    ssr: false,
});
const MitigationPanel = dynamic(
    () => import("@/components/MitigationPanel"),
    { ssr: false }
);

import { useSupplyChainStore } from "@/lib/store";
import { ShieldCheck, Plus } from "lucide-react";

export default function SuppliersPage() {
    const { selectedNodeId } = useSupplyChainStore();
    const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);

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

            {/* Page title */}
            <div
                style={{
                    borderBottom: "3px solid #000",
                    background: "#FFF",
                    padding: "12px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: 20,
                            fontWeight: 900,
                            letterSpacing: "-0.02em",
                            margin: 0,
                        }}
                    >
                        Supplier Database
                    </h1>
                    <p
                        style={{
                            fontSize: 11,
                            fontFamily: "Roboto Mono, monospace",
                            opacity: 0.6,
                            marginTop: 2,
                        }}
                    >
                        Search, filter, and analyze all suppliers. Click a row to view
                        mitigation details.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddSupplierModalOpen(true)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        background: "#9BFF00",
                        border: "3px solid #000",
                        fontWeight: 900,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                    }}
                >
                    <Plus size={14} strokeWidth={3} />
                    Add Supplier
                </button>
            </div>

            <main
                style={{
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: selectedNodeId ? "1fr 380px" : "1fr",
                    overflow: "hidden",
                    transition: "grid-template-columns 0.2s ease",
                }}
            >
                {/* Table */}
                <div
                    style={{
                        overflow: "hidden",
                        borderRight: selectedNodeId ? "3px solid #000" : "none",
                    }}
                >
                    <SupplierTable />
                </div>

                {/* Detail sidebar (only shows when a node is selected) */}
                {selectedNodeId && (
                    <aside
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            background: "#FFF",
                        }}
                    >
                        <div
                            style={{
                                borderBottom: "3px solid #000",
                                padding: "8px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                background: "#9BFF00",
                            }}
                        >
                            <ShieldCheck size={14} strokeWidth={3} />
                            <span
                                style={{
                                    fontSize: 10,
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                }}
                            >
                                Node Analysis
                            </span>
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                            <MitigationPanel />
                        </div>
                    </aside>
                )}
            </main>

            {/* Add Supplier Modal */}
            <AddSupplierModal
                isOpen={isAddSupplierModalOpen}
                onClose={() => setIsAddSupplierModalOpen(false)}
            />
        </div>
    );
}
