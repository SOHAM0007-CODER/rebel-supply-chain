"use client";

// ============================================================
// Dashboard Page — 3-panel layout:
//   LEFT: Network Graph (full-height)
//   RIGHT-TOP: Risk/Cost Matrix
//   RIGHT-BOTTOM: Mitigation Panel
// ============================================================

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  Activity,
  Layers,
  ShieldCheck,
  TrendingDown,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useSupplyChainStore } from "@/lib/store";
import { TIER_LABELS, TIER_COLORS } from "@/lib/mockData";
import { FilterControls } from "@/components/FilterControls";
import Navigation from "@/components/Navigation";
import ConcentrationWarningBanner from "@/components/ConcentrationWarningBanner";
import GraphLegend from "@/components/GraphLegend";
import CriticalComponentsCard from "@/components/CriticalComponentsCard";
const NetworkGraph = dynamic(() => import("@/components/NetworkGraph"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div style={{ fontWeight: 900 }}>Loading graph…</div>
    </div>
  ),
});
const RiskCostMatrix = dynamic(() => import("@/components/RiskCostMatrix"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div style={{ fontWeight: 900 }}>Loading chart…</div>
    </div>
  ),
});
const MitigationPanel = dynamic(() => import("@/components/MitigationPanel"), {
  ssr: false,
});

function StatCard({
  icon,
  label,
  value,
  bg,
  textColor = "#000",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bg: string;
  textColor?: string;
}) {
  return (
    <div
      className="brutal-card flex items-center gap-3"
      style={{ padding: "8px 14px", background: bg, color: textColor }}
    >
      {icon}
      <div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            opacity: 0.6,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontWeight: 900,
            fontSize: 18,
            fontFamily: "Roboto Mono, monospace",
            lineHeight: 1,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function TierLegend() {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {Object.entries(TIER_LABELS).map(([tier, label]) => (
        <div key={tier} className="flex items-center gap-1">
          <div
            style={{
              width: 12,
              height: 12,
              background: TIER_COLORS[Number(tier)] ?? "#ccc",
              border: "2px solid #000",
            }}
          />
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              fontFamily: "Roboto Mono",
              textTransform: "uppercase",
            }}
          >
            {label}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-1">
        <div
          style={{
            width: 12,
            height: 12,
            background: "#FF3333",
            border: "2px solid #000",
          }}
        />
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            fontFamily: "Roboto Mono",
            textTransform: "uppercase",
          }}
        >
          High Risk
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [isGraphFullscreen, setIsGraphFullscreen] = useState(false);
  const {
    networkAnalytics,
    selectedRegion,
    selectedManufacturerId,
    radiusKm,
    filteredNodes,
  } = useSupplyChainStore();
  const { totalNodes, avgRisk, highRiskCount, spofCount, dangerousDepCount } =
    networkAnalytics;
  const visibleSuppliers = filteredNodes.length;
  const radiusLabel =
    selectedManufacturerId && radiusKm > 0 ? `${radiusKm} km` : "Off";

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
      {!isGraphFullscreen && <Navigation />}

      {/* ── Stats strip ───────────────────────────────────── */}
      <div
        style={{
          borderBottom: isGraphFullscreen ? "none" : "3px solid #000",
          background: "#FFF",
          padding: isGraphFullscreen ? "0" : "10px 16px",
          display: isGraphFullscreen ? "none" : "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div className="flex gap-3 flex-wrap">
          <StatCard
            icon={<Layers size={18} strokeWidth={3} />}
            label="Suppliers"
            value={totalNodes}
            bg="#FFF"
          />
          <StatCard
            icon={<Activity size={18} strokeWidth={3} />}
            label="Avg Risk"
            value={avgRisk}
            bg="#FFDF00"
          />
          <StatCard
            icon={<AlertTriangle size={18} strokeWidth={3} />}
            label="High Risk"
            value={highRiskCount}
            bg="#FF3333"
            textColor="#FFF"
          />
          <StatCard
            icon={<ShieldCheck size={18} strokeWidth={3} />}
            label="SPOFs"
            value={spofCount}
            bg="#FF2E88"
            textColor="#FFF"
          />
          <StatCard
            icon={<TrendingDown size={18} strokeWidth={3} />}
            label="Dangerous Deps"
            value={dangerousDepCount}
            bg="#9BFF00"
          />
        </div>
        <TierLegend />
      </div>

      {/* ── Geographic Concentration Warning ──────────────── */}
      {!isGraphFullscreen && (
        <div
          style={{
            borderBottom: "3px solid #000",
            background: "#F5F5F0",
            padding: "12px 16px",
          }}
        >
          <ConcentrationWarningBanner />
        </div>
      )}

      {/* ── Main content ──────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: isGraphFullscreen ? "1fr 0px" : "1fr 400px",
          overflow: "hidden",
          transition: "grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* LEFT: Network Graph (full height) with filter controls */}
        <div
          style={{
            borderRight: isGraphFullscreen ? "none" : "3px solid #000",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {!isGraphFullscreen && (
            <div style={{ padding: "8px 12px", borderBottom: "2px solid #000", background: "#FFF" }}>
              <FilterControls />
            </div>
          )}
          {!isGraphFullscreen && (
            <div
              style={{
                padding: "8px 12px",
                borderBottom: "2px solid #000",
                background: "#FFF8D6",
              }}
            >
            <div
              style={{
                fontSize: 10,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                opacity: 0.65,
                marginBottom: 4,
              }}
            >
              Filtered Network
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "Roboto Mono, monospace",
              }}
            >
              <span>Region = {selectedRegion}</span>
              <span>Radius = {radiusLabel}</span>
              <span>Visible Suppliers = {visibleSuppliers}</span>
            </div>
          </div>
          )}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 10,
              }}
            >
              <button
                onClick={() => setIsGraphFullscreen(!isGraphFullscreen)}
                className="brutal-card bg-white hover:bg-gray-100"
                style={{
                  padding: 8,
                  border: "2px solid #000",
                  boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={isGraphFullscreen ? "Exit Fullscreen" : "Fullscreen Graph"}
              >
                {isGraphFullscreen ? <Minimize2 size={18} strokeWidth={3} /> : <Maximize2 size={18} strokeWidth={3} />}
              </button>
              <GraphLegend />
            </div>
            <NetworkGraph />
          </div>
        </div>

        {/* RIGHT: Stacked panels */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflowX: "hidden",
            overflowY: "auto",
            background: "#FFF",
          }}
        >
          {/* Risk/Cost chart */}
          <div
            style={{
              borderBottom: "3px solid #000",
              height: "45%",
              minHeight: 260,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 8,
                left: 12,
                zIndex: 10,
                fontSize: 10,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                opacity: 0.4,
              }}
            >
              Risk vs Cost Matrix
            </div>
            <RiskCostMatrix />
          </div>

          {/* Critical Components panel */}
          {!isGraphFullscreen && (
            <div
              style={{
                borderBottom: "3px solid #000",
                height: "25%",
                minHeight: 180,
                position: "relative",
              }}
            >
              <CriticalComponentsCard />
            </div>
          )}

          {/* Mitigation panel */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
                Mitigation Recommendations
              </span>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              <MitigationPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
