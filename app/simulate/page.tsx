"use client";

// ============================================================
// Simulate Page — Disruption simulation with network graph
// ============================================================

import React from "react";
import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import { FlaskConical } from "lucide-react";

const NetworkGraph = dynamic(() => import("@/components/NetworkGraph"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full">
            <div style={{ fontWeight: 900 }}>Loading graph…</div>
        </div>
    ),
});
const DisruptionSimulator = dynamic(
    () => import("@/components/DisruptionSimulator"),
    { ssr: false }
);

export default function SimulatePage() {
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
                }}
            >
                <h1
                    style={{
                        fontSize: 20,
                        fontWeight: 900,
                        letterSpacing: "-0.02em",
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            background: "#FF2E88",
                            padding: "4px 6px",
                            display: "inline-flex",
                        }}
                    >
                        <FlaskConical size={18} strokeWidth={3} color="#FFF" />
                    </div>
                    Disruption Simulator
                </h1>
                <p
                    style={{
                        fontSize: 11,
                        fontFamily: "Roboto Mono, monospace",
                        opacity: 0.6,
                        marginTop: 4,
                    }}
                >
                    Toggle suppliers offline to simulate disruptions. See which downstream nodes are impacted, how
                    risk metrics change, and which nodes become orphaned.
                </p>
            </div>

            <main
                style={{
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: "1fr 380px",
                    overflow: "hidden",
                }}
            >
                {/* Network graph with disabled overlays */}
                <div style={{ borderRight: "3px solid #000" }}>
                    <NetworkGraph />
                </div>

                {/* Simulator panel */}
                <aside
                    className="brutal-scrollbar"
                    style={{
                        overflowY: "auto",
                        background: "#FFF",
                        padding: "0 4px",
                    }}
                >
                    <DisruptionSimulator />
                </aside>
            </main>
        </div>
    );
}
