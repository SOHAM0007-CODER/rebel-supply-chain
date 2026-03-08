import React from "react";
import { findCriticalComponents } from "@/utils/criticalComponents";
import { suppliers } from "@/lib/mockData";
import { AlertCircle } from "lucide-react";

export default function CriticalComponentsCard() {
    const criticalComponents = findCriticalComponents(suppliers);
    const count = criticalComponents.length;

    return (
        <div className="critical-components-card">
            <div className="card-header">
                <AlertCircle size={16} strokeWidth={3} />
                <span>Critical Chokepoints</span>
            </div>
            
            <div className="card-stats">
                <span className="count-number">{count}</span>
                <span className="count-label">Detected Chokepoints</span>
            </div>

            <div className="component-list-container">
                <ul className="component-list">
                    {criticalComponents.map((item) => (
                        <li key={item} className="component-item">
                            <span className="dot">•</span>
                            <span className="name">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <style jsx>{`
                .critical-components-card {
                    background: #FFF;
                    border: 3px solid #000;
                    box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
                    padding: 12px;
                    font-family: 'Inter', sans-serif;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #FFDF00;
                    border: 2px solid #000;
                    padding: 6px 10px;
                    margin-bottom: 12px;
                }
                .card-header span {
                    font-size: 11px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .card-stats {
                    margin-bottom: 12px;
                    border-bottom: 2px dashed #DDD;
                    padding-bottom: 8px;
                }
                .count-number {
                    font-size: 24px;
                    font-weight: 900;
                    font-family: 'Roboto Mono', monospace;
                    display: block;
                    line-height: 1;
                }
                .count-label {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #666;
                }
                .component-list-container {
                    flex: 1;
                    overflow-y: auto;
                    max-height: 150px;
                }
                .component-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .component-item {
                    display: flex;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    margin-bottom: 4px;
                }
                .dot {
                    color: #FF3333;
                    font-weight: 900;
                }
                .name {
                    color: #000;
                }
            `}</style>
        </div>
    );
}
