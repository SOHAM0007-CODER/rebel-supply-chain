"use client";

import { useState } from "react";
import { useSupplyChainStore } from "@/lib/store";

const REGIONS = [
    "All",
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Africa",
    "Middle East",
    "Oceania",
    "Central America",
];

export function FilterControls() {
    const [isOpen, setIsOpen] = useState(false);
    const {
        nodes,
        selectedRegion,
        selectedManufacturerId,
        radiusKm,
        setRegionFilter,
        setSelectedManufacturer,
        setRadiusKm,
    } = useSupplyChainStore();

    const manufacturers = nodes.filter((n) => n.tier === 2);

    return (
        <div className="rounded-lg border border-gray-300 bg-white">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                aria-expanded={isOpen}
            >
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Geographic Filters</h3>
                    <p className="mt-1 text-xs text-gray-500">
                        Region: {selectedRegion}
                        {selectedManufacturerId ? " • Radius search active" : ""}
                    </p>
                </div>
                <span
                    className={`text-lg leading-none text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                >
                    ▼
                </span>
            </button>

            {isOpen && (
                <div className="space-y-4 border-t border-gray-200 p-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                            Region
                        </label>
                        <select
                            value={selectedRegion}
                            onChange={(e) => setRegionFilter(e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {REGIONS.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                            Manufacturer for Radius Search
                        </label>
                        <select
                            value={selectedManufacturerId || ""}
                            onChange={(e) =>
                                setSelectedManufacturer(e.target.value === "" ? null : e.target.value)
                            }
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">None</option>
                            {manufacturers.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} ({m.country})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedManufacturerId && (
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700">
                                Radius: {radiusKm} km
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="5000"
                                step="100"
                                value={radiusKm}
                                onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
                                className="w-full"
                            />
                            <div className="mt-1 text-xs text-gray-500">0 - 5000 km</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
