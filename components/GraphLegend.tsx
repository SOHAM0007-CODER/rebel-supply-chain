import React, { useState } from "react";
import { TIER_COLORS, TIER_LABELS } from "@/lib/mockData";
import { Info, ChevronUp, ChevronDown } from "lucide-react";

interface LegendItemProps {
    color: string;
    label: string;
}

const LegendItem = ({ color, label }: LegendItemProps) => (
    <div className="legend-item">
        <div 
            className="legend-color" 
            style={{ backgroundColor: color }} 
        />
        <span className="legend-label">{label}</span>
        <style jsx>{`
            .legend-item {
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 4px 0;
            }
            .legend-color {
                width: 12px;
                height: 12px;
                border: 1.5px solid #000;
                box-shadow: 1.5px 1.5px 0px 0px rgba(0,0,0,1);
                flex-shrink: 0;
            }
            .legend-label {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.02em;
                color: #000;
            }
        `}</style>
    </div>
);

export default function GraphLegend() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const tierOrder = [0, 1, 2, 3, 4];

    return (
        <div className={`graph-legend ${isCollapsed ? "collapsed" : ""}`}>
            <div className="legend-header" onClick={() => setIsCollapsed(!isCollapsed)}>
                <div className="header-title">
                    <Info size={14} strokeWidth={3} />
                    <span>Legend</span>
                </div>
                {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>

            {!isCollapsed && (
                <div className="legend-content">
                    <div className="legend-section">
                        <strong>Tiers</strong>
                        {tierOrder.map((tier) => (
                            <LegendItem 
                                key={tier} 
                                color={TIER_COLORS[tier]} 
                                label={TIER_LABELS[tier]} 
                            />
                        ))}
                    </div>

                    <div className="legend-section">
                        <strong>Risk</strong>
                        <LegendItem color="#FF3333" label="High Risk" />
                    </div>
                </div>
            )}

            <style jsx>{`
                .graph-legend {
                    background: #fff;
                    border: 2px solid #000;
                    box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
                    width: 160px;
                    font-family: 'Inter', sans-serif;
                    z-index: 50;
                    overflow: hidden;
                    transition: all 0.2s ease;
                }
                .graph-legend.collapsed {
                    width: 100px;
                }
                .legend-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 6px 10px;
                    background: #eee;
                    border-bottom: ${isCollapsed ? 'none' : '2px solid #000'};
                    cursor: pointer;
                    user-select: none;
                }
                .legend-header:hover {
                    background: #e0e0e0;
                }
                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .header-title span {
                    font-size: 11px;
                    font-weight: 900;
                    text-transform: uppercase;
                }
                .legend-content {
                    padding: 10px;
                }
                .legend-section {
                    margin-bottom: 10px;
                }
                .legend-section:last-child {
                    margin-bottom: 0;
                }
                strong {
                    display: block;
                    font-size: 9px;
                    color: #666;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                    letter-spacing: 0.05em;
                }
            `}</style>
        </div>
    );
}
