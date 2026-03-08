// ============================================================
// TypeScript Types for Supply Chain Risk Analyzer
// ============================================================

export interface SupplierType {
    id: string;
    name: string;
    country: string;
    region: string;
    latitude: number;
    longitude: number;
    capacity: number;
    riskScore: number;
    costScore: number;
    createdByUserId: string;
    createdAt: Date;
}

export interface CreateSupplierInput {
    name: string;
    country: string;
    region: string;
    latitude: number;
    longitude: number;
    capacity: number;
    riskScore: number;
    costScore: number;
    createdByUserId: string;
}

export interface UpdateSupplierInput {
    name?: string;
    country?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    riskScore?: number;
    costScore?: number;
}

export interface NodeType {
    id: string;
    name: string;
    type: string;
    tier: number;
    supplierId: string | null;
    lat: number;
    lon: number;
}

export interface CreateNodeInput {
    id: string;
    name: string;
    type: string;
    tier: number;
    supplierId?: string;
    lat: number;
    lon: number;
}

export interface EdgeType {
    id: string;
    source: string;
    target: string;
}

export interface CreateEdgeInput {
    source: string;
    target: string;
}

export interface ProductType {
    id: string;
    name: string;
}

export interface CreateProductInput {
    name: string;
    supplierIds?: string[];
}

export interface DisruptionType {
    id: string;
    supplierId: string;
    createdAt: Date;
}

export interface CreateDisruptionInput {
    supplierId: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}
