"use client";

// ============================================================
// Navigation — Shared top nav bar for multi-page app
// ============================================================

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Network, BarChart3, Table2, FlaskConical } from "lucide-react";

const NAV_ITEMS = [
    { href: "/", label: "Dashboard", icon: Network },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/suppliers", label: "Suppliers", icon: Table2 },
    { href: "/simulate", label: "Simulate", icon: FlaskConical },
];

export default function Navigation() {
    const pathname = usePathname();

    return (
        <nav
            style={{
                display: "flex",
                alignItems: "center",
                borderBottom: "3px solid #000",
                background: "#000",
                padding: "0 16px",
                height: 48,
                gap: 0,
            }}
        >
            {/* Logo */}
            <Link
                href="/"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginRight: 20,
                    textDecoration: "none",
                    color: "#FFF",
                }}
            >
                <div
                    style={{
                        background: "#FFDF00",
                        padding: "4px 6px",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <Zap size={18} strokeWidth={3} color="#000" />
                </div>
                <span
                    style={{
                        fontWeight: 900,
                        fontSize: 14,
                        letterSpacing: "-0.02em",
                        color: "#FFF",
                    }}
                >
                    SUPPLY CHAIN RISK
                </span>
            </Link>

            {/* Nav items */}
            <div style={{ display: "flex", height: "100%", gap: 0 }}>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "0 16px",
                                fontWeight: 800,
                                fontSize: 12,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                textDecoration: "none",
                                color: isActive ? "#000" : "#FFF",
                                background: isActive ? "#FFDF00" : "transparent",
                                borderLeft: "2px solid rgba(255,255,255,0.1)",
                                transition: "background 0.15s ease, color 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = "transparent";
                                }
                            }}
                        >
                            <Icon size={14} strokeWidth={3} />
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
