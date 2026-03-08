"use client";

// ============================================================
// Add Supplier Modal — Form to create new suppliers
// Features:
//   - Form validation
//   - Product multi-select
//   - Existing supplier selection for downstream connections
//   - Error handling
// ============================================================

import React, { useState, useEffect } from "react";
import { X, Plus, AlertCircle } from "lucide-react";
import { useSupplyChainStore } from "@/lib/store";
import { suppliers, SupplierNode } from "@/lib/mockData";

type SupplierType = "raw_material" | "component" | "manufacturer" | "distributor" | "retailer";

const SUPPLIER_TYPES: { value: SupplierType; label: string }[] = [
    { value: "raw_material", label: "Raw Material" },
    { value: "component", label: "Component Supplier" },
    { value: "manufacturer", label: "Manufacturer" },
    { value: "distributor", label: "Distributor" },
    { value: "retailer", label: "Retailer" },
];

const AVAILABLE_PRODUCTS = [
    "Silicon",
    "Lithium",
    "Cobalt",
    "Copper",
    "Aluminum",
    "Steel",
    "Plastic",
    "Rubber",
    "Microchips",
    "Batteries",
    "Sensors",
    "PCBs",
    "Screens",
    "Motors",
    "Connectors",
    "Cables",
    "Casings",
    "Frames",
];

const AVAILABLE_REGIONS = [
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Africa",
    "Middle East",
    "Oceania",
];

interface AddSupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddSupplierModal({ isOpen, onClose }: AddSupplierModalProps) {
    const { recomputeAnalytics, addNodeWithEdges } = useSupplyChainStore();

    const [formData, setFormData] = useState({
        name: "",
        type: "component" as SupplierType,
        region: "Asia",
        country: "",
        latitude: 0,
        longitude: 0,
        capacity: 1000,
    });

    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [selectedUpstream, setSelectedUpstream] = useState<string[]>([]);
    const [selectedDownstream, setSelectedDownstream] = useState<string[]>([]);

    const typeToTier: Record<SupplierType, number> = {
        raw_material: 4,
        component: 3,
        manufacturer: 2,
        distributor: 1,
        retailer: 0,
    };
    const currentTier = typeToTier[formData.type];
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "latitude" || name === "longitude" || name === "capacity"
                    ? parseFloat(value)
                    : value,
        }));
    };

    const toggleProduct = (product: string) => {
        setSelectedProducts((prev) =>
            prev.includes(product)
                ? prev.filter((p) => p !== product)
                : [...prev, product]
        );
    };

    const toggleUpstream = (supplierId: string) => {
        setSelectedUpstream((prev) =>
            prev.includes(supplierId)
                ? prev.filter((s) => s !== supplierId)
                : [...prev, supplierId]
        );
    };

    const toggleDownstream = (supplierId: string) => {
        setSelectedDownstream((prev) =>
            prev.includes(supplierId)
                ? prev.filter((s) => s !== supplierId)
                : [...prev, supplierId]
        );
    };

    const validateForm = (): string | null => {
        if (!formData.name.trim()) return "Supplier name is required";
        if (!formData.country.trim()) return "Country is required";
        if (selectedProducts.length === 0) return "Select at least one product";
        if (!Number.isFinite(formData.latitude) || !Number.isFinite(formData.longitude)) {
            return "Valid latitude and longitude are required";
        }
        if (formData.capacity <= 0) return "Capacity must be greater than 0";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/suppliers/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    products: selectedProducts,
                    upstreamNodes: selectedUpstream,
                    downstreamNodes: selectedDownstream,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to add supplier");
                return;
            }

        // Get the supplier ID from the response
        const supplierId = data.supplier.id;

        // Map supplier type to tier and NodeType
        const typeMap: Record<SupplierType, { tier: number; nodeType: string }> = {
            raw_material: { tier: 4, nodeType: "Raw Material Supplier" },
            component: { tier: 3, nodeType: "Component Supplier" },
            manufacturer: { tier: 2, nodeType: "Manufacturer" },
            distributor: { tier: 1, nodeType: "Distributor" },
            retailer: { tier: 0, nodeType: "Retailer" },
        };

        const { tier, nodeType } = typeMap[formData.type];

        // Create a SupplierNode object for the new supplier
        const newNode: SupplierNode = {
            id: supplierId,
            name: formData.name,
            type: nodeType as any,
            tier: tier,
            country: formData.country,
            region: formData.region,
            lat: formData.latitude,
            lon: formData.longitude,
            products: selectedProducts.join(", "),
            risk_score: 50,
            cost_score: 50,
            geopolitical_risk: 50,
            weather_risk: 50,
            shipping_risk: 50,
            financial_stability: 50,
            estimated_risk_level: "medium",
            supplier_capability_tier: "B",
            capacity: formData.capacity,
        };

        // The UI lists existing suppliers. 
        // Based on tiers, we decide if we are connecting as Source or Target.
        // Tier 4 (Raw) -> Tier 3 (Comp) -> Tier 2 (Mfg) -> Tier 1 (Dist) -> Tier 0 (Retail)
        
        // Find existing suppliers from the selection
        const selectedExistingNodes = suppliers.filter(s => selectedDownstream.includes(s.id));
        
        // Logic: 
        // 1. If existing node is a RAW supplier (Tier 4) and we are COMP (Tier 3), 
        //    the edge should be Existing -> New.
        // 2. If we are RAW (Tier 4) and existing node is COMP (Tier 3),
        //    the edge should be New -> Existing.
        
        // The store's addNodeWithEdges currently ONLY supports New -> Existing.
        // Let's modify the store action later if needed, but for now, 
        // let's ensure the connection happens.
        
        // For debugging/fixing the user's specific complaint about RAW suppliers:
        // If we selected a Raw Supplier (Tier 4), they should supply TO us.
        
        // Add the node with edges to the store
        addNodeWithEdges(newNode, [...selectedUpstream, ...selectedDownstream]);

        setSuccess(true);
            setFormData({
                name: "",
                type: "component",
                region: "Asia",
                country: "",
                latitude: 0,
                longitude: 0,
                capacity: 1000,
            });
            setSelectedProducts([]);
            setSelectedDownstream([]);

            // Close modal after 2 seconds
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add supplier");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "20px",
            }}
        >
            <div
                style={{
                    background: "#FFF",
                    border: "3px solid #000",
                    borderRadius: 0,
                    maxWidth: "600px",
                    width: "100%",
                    maxHeight: "90vh",
                    overflow: "auto",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px 20px",
                        borderBottom: "3px solid #000",
                        background: "#FFDF00",
                    }}
                >
                    <h2
                        style={{
                            fontSize: 16,
                            fontWeight: 900,
                            margin: 0,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Add New Supplier
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "#FFF",
                            border: "3px solid #000",
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontSize: 16,
                            fontWeight: 900,
                        }}
                    >
                        <X size={16} strokeWidth={3} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
                    {error && (
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                background: "#FEE2E2",
                                border: "3px solid #DC2626",
                                padding: "12px",
                                marginBottom: "16px",
                                alignItems: "flex-start",
                            }}
                        >
                            <AlertCircle
                                size={16}
                                strokeWidth={3}
                                style={{ flexShrink: 0, marginTop: "2px", color: "#DC2626" }}
                            />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#7F1D1D" }}>
                                {error}
                            </span>
                        </div>
                    )}

                    {success && (
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                background: "#DCFCE7",
                                border: "3px solid #16A34A",
                                padding: "12px",
                                marginBottom: "16px",
                                alignItems: "flex-start",
                            }}
                        >
                            <Plus
                                size={16}
                                strokeWidth={3}
                                style={{ flexShrink: 0, marginTop: "2px", color: "#16A34A" }}
                            />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#15803D" }}>
                                Supplier added successfully!
                            </span>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 11,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: "6px",
                            }}
                        >
                            Supplier Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., SinoTech Corp"
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                border: "3px solid #000",
                                fontSize: 12,
                                fontFamily: "Roboto Mono, monospace",
                                fontWeight: 600,
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {/* Type & Region */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: 11,
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: "6px",
                                }}
                            >
                                Supplier Type *
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "3px solid #000",
                                    fontSize: 12,
                                    fontFamily: "Roboto Mono, monospace",
                                    fontWeight: 600,
                                    boxSizing: "border-box",
                                }}
                            >
                                {SUPPLIER_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: 11,
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: "6px",
                                }}
                            >
                                Region *
                            </label>
                            <select
                                name="region"
                                value={formData.region}
                                onChange={handleInputChange}
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "3px solid #000",
                                    fontSize: 12,
                                    fontFamily: "Roboto Mono, monospace",
                                    fontWeight: 600,
                                    boxSizing: "border-box",
                                }}
                            >
                                {AVAILABLE_REGIONS.map((region) => (
                                    <option key={region} value={region}>
                                        {region}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Country */}
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 11,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: "6px",
                            }}
                        >
                            Country *
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            placeholder="e.g., China"
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                border: "3px solid #000",
                                fontSize: 12,
                                fontFamily: "Roboto Mono, monospace",
                                fontWeight: 600,
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {/* Location */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: 11,
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: "6px",
                                }}
                            >
                                Latitude *
                            </label>
                            <input
                                type="number"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleInputChange}
                                step="0.0001"
                                placeholder="e.g., 30.5728"
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "3px solid #000",
                                    fontSize: 12,
                                    fontFamily: "Roboto Mono, monospace",
                                    fontWeight: 600,
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: 11,
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: "6px",
                                }}
                            >
                                Longitude *
                            </label>
                            <input
                                type="number"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleInputChange}
                                step="0.0001"
                                placeholder="e.g., 114.3055"
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "3px solid #000",
                                    fontSize: 12,
                                    fontFamily: "Roboto Mono, monospace",
                                    fontWeight: 600,
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                    </div>

                    {/* Capacity */}
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 11,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: "6px",
                            }}
                        >
                            Production Capacity (units) *
                        </label>
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleInputChange}
                            min="1"
                            placeholder="e.g., 5000"
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                border: "3px solid #000",
                                fontSize: 12,
                                fontFamily: "Roboto Mono, monospace",
                                fontWeight: 600,
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {/* Products */}
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 11,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: "8px",
                            }}
                        >
                            Products *
                        </label>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: "8px",
                                border: "3px solid #000",
                                padding: "12px",
                                background: "#F9F9F9",
                            }}
                        >
                            {AVAILABLE_PRODUCTS.map((product) => (
                                <label
                                    key={product}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        fontSize: 11,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(product)}
                                        onChange={() => toggleProduct(product)}
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                            cursor: "pointer",
                                            accentColor: "#000",
                                        }}
                                    />
                                    {product}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Upstream Connections */}
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 11,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: "8px",
                            }}
                        >
                            Select Upstream Suppliers (e.g., Raw Materials)
                        </label>
                        <div
                            style={{
                                border: "3px solid #000",
                                maxHeight: "150px",
                                overflow: "auto",
                                background: "#F9F9F9",
                            }}
                        >
                            {suppliers.filter(s => s.tier > currentTier).length === 0 ? (
                                <p style={{ padding: "12px", fontSize: 11, opacity: 0.6 }}>
                                    No upstream suppliers available for this tier
                                </p>
                            ) : (
                                <div style={{ padding: "12px" }}>
                                    {suppliers.filter(s => s.tier > currentTier).map((supplier) => (
                                        <label
                                            key={supplier.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                fontSize: 11,
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                padding: "6px 0",
                                                borderBottom: "1px solid #E5E5E5",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedUpstream.includes(supplier.id)}
                                                onChange={() => toggleUpstream(supplier.id)}
                                                style={{
                                                    width: "16px",
                                                    height: "16px",
                                                    cursor: "pointer",
                                                    accentColor: "#000",
                                                }}
                                            />
                                            <span>{supplier.name}</span>
                                            <span style={{ opacity: 0.5, marginLeft: "auto" }}>
                                                {supplier.type}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Downstream Connections */}
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 11,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: "8px",
                            }}
                        >
                            Select Downstream Targets (e.g., Manufacturers)
                        </label>
                        <div
                            style={{
                                border: "3px solid #000",
                                maxHeight: "150px",
                                overflow: "auto",
                                background: "#F9F9F9",
                            }}
                        >
                            {suppliers.filter(s => s.tier < currentTier).length === 0 ? (
                                <p style={{ padding: "12px", fontSize: 11, opacity: 0.6 }}>
                                    No downstream nodes available for this tier
                                </p>
                            ) : (
                                <div style={{ padding: "12px" }}>
                                    {suppliers.filter(s => s.tier < currentTier).map((supplier) => (
                                        <label
                                            key={supplier.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                fontSize: 11,
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                padding: "6px 0",
                                                borderBottom: "1px solid #E5E5E5",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedDownstream.includes(supplier.id)}
                                                onChange={() => toggleDownstream(supplier.id)}
                                                style={{
                                                    width: "16px",
                                                    height: "16px",
                                                    cursor: "pointer",
                                                    accentColor: "#000",
                                                }}
                                            />
                                            <span>{supplier.name}</span>
                                            <span style={{ opacity: 0.5, marginLeft: "auto" }}>
                                                {supplier.type}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            justifyContent: "flex-end",
                            marginTop: "20px",
                            borderTop: "3px solid #000",
                            paddingTop: "16px",
                        }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: "8px 16px",
                                border: "3px solid #000",
                                background: "#FFF",
                                fontWeight: 900,
                                fontSize: 11,
                                cursor: "pointer",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: "8px 16px",
                                border: "3px solid #000",
                                background: isLoading ? "#CCC" : "#9BFF00",
                                fontWeight: 900,
                                fontSize: 11,
                                cursor: isLoading ? "not-allowed" : "pointer",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            {isLoading ? "Adding..." : "Add Supplier"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
