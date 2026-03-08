// ============================================================
// Real Dataset: Global Electronics Supply Chain
// 50 Nodes — 15 Raw Materials, 15 Component Suppliers,
//             10 Manufacturers, 5 Distributors, 5 Retailers
// 57 Edges — supplies_to & distributes_to
// Multi-dimensional risk scoring
// ============================================================

// ── Node Types ────────────────────────────────────────────
export type NodeType =
    | "Raw Material Supplier"
    | "Component Supplier"
    | "Manufacturer"
    | "Distributor"
    | "Retailer";

// ── Supplier Node (expanded model) ────────────────────────
export interface SupplierNode {
    id: string;
    name: string;
    type: NodeType;
    tier: number; // 4=Raw, 3=Components, 2=Mfg, 1=Distributor, 0=Retailer
    country: string;
    region: string;
    lat: number;                   // latitude
    lon: number;                   // longitude
    products: string;
    risk_score: number;            // final_risk_score (0-100)
    cost_score: number;            // derived cost metric (0-100)
    // Multi-dimensional risk breakdown
    geopolitical_risk: number;
    weather_risk: number;
    shipping_risk: number;
    financial_stability: number;
    estimated_risk_level: "low" | "medium" | "high";
    supplier_capability_tier?: "A" | "B" | "C";
    concentration_risk?: number;   // Geographic concentration risk (0-100), optional
    capacity?: number;
}

// ── Edge Types ────────────────────────────────────────────
export type EdgeRelationType = "supplies_to" | "distributes_to";

export interface SupplyEdge {
    id: string;
    source: string;
    target: string;
    relationship: EdgeRelationType;
    dependency_weight: number;
}

// ════════════════════════════════════════════════════════════
//  NODES — 50 nodes across 5 tiers
// ════════════════════════════════════════════════════════════

export const suppliers: SupplierNode[] = [
    // ─── Tier 4: Raw Material Suppliers (15) ─────────────────
    { id: "N01", name: "SinoSilica", type: "Raw Material Supplier", tier: 4, country: "China", region: "Asia", lat: 30.5728, lon: 114.3055, products: "Silicon", risk_score: 46.25, cost_score: 25, geopolitical_risk: 55, weather_risk: 40, shipping_risk: 60, financial_stability: 70, estimated_risk_level: "medium", supplier_capability_tier: "A", capacity: 1000 },
    { id: "N02", name: "AussieLithium", type: "Raw Material Supplier", tier: 4, country: "Australia", region: "Oceania", lat: -33.8688, lon: 151.2093, products: "Lithium", risk_score: 20.00, cost_score: 35, geopolitical_risk: 10, weather_risk: 35, shipping_risk: 20, financial_stability: 85, estimated_risk_level: "low", supplier_capability_tier: "A", capacity: 800 },
    { id: "N03", name: "Kivu Minerals", type: "Raw Material Supplier", tier: 4, country: "DRC", region: "Africa", lat: -1.9536, lon: 29.8739, products: "Cobalt", risk_score: 71.25, cost_score: 15, geopolitical_risk: 90, weather_risk: 40, shipping_risk: 85, financial_stability: 30, estimated_risk_level: "high", supplier_capability_tier: "A", capacity: 500 },
    { id: "N04", name: "Gulf Petrochem", type: "Raw Material Supplier", tier: 4, country: "Saudi Arabia", region: "Middle East", lat: 24.7136, lon: 46.6753, products: "Plastic Resins", risk_score: 60.00, cost_score: 20, geopolitical_risk: 80, weather_risk: 25, shipping_risk: 75, financial_stability: 40, estimated_risk_level: "high", supplier_capability_tier: "B", capacity: 600 },
    { id: "N05", name: "Andes Copper Co", type: "Raw Material Supplier", tier: 4, country: "Chile", region: "South America", lat: -23.6345, lon: -70.3977, products: "Copper", risk_score: 47.50, cost_score: 22, geopolitical_risk: 45, weather_risk: 60, shipping_risk: 50, financial_stability: 65, estimated_risk_level: "medium", supplier_capability_tier: "B", capacity: 700 },
    { id: "N06", name: "EuroAlum", type: "Raw Material Supplier", tier: 4, country: "Germany", region: "Europe", lat: 51.1657, lon: 10.4515, products: "Aluminum", risk_score: 13.75, cost_score: 40, geopolitical_risk: 15, weather_risk: 20, shipping_risk: 10, financial_stability: 90, estimated_risk_level: "low", supplier_capability_tier: "A", capacity: 900 },
    { id: "N07", name: "IndoMica", type: "Raw Material Supplier", tier: 4, country: "India", region: "Asia", lat: 20.5937, lon: 78.9629, products: "Rare Earths", risk_score: 51.25, cost_score: 18, geopolitical_risk: 40, weather_risk: 70, shipping_risk: 55, financial_stability: 60, estimated_risk_level: "medium", supplier_capability_tier: "A", capacity: 400 },
    { id: "N08", name: "CanBauxite", type: "Raw Material Supplier", tier: 4, country: "Canada", region: "North America", lat: 56.1304, lon: -106.3468, products: "Bauxite", risk_score: 21.25, cost_score: 38, geopolitical_risk: 10, weather_risk: 45, shipping_risk: 15, financial_stability: 85, estimated_risk_level: "low", supplier_capability_tier: "B", capacity: 750 },
    { id: "N09", name: "Levant Glassworks", type: "Raw Material Supplier", tier: 4, country: "Lebanon", region: "Middle East", lat: 33.8547, lon: 35.8623, products: "Silica Sand", risk_score: 67.50, cost_score: 12, geopolitical_risk: 85, weather_risk: 30, shipping_risk: 80, financial_stability: 25, estimated_risk_level: "high", supplier_capability_tier: "C", capacity: 300 },
    { id: "N10", name: "Nordic Timber", type: "Raw Material Supplier", tier: 4, country: "Sweden", region: "Europe", lat: 60.1282, lon: 18.6435, products: "Cellulose", risk_score: 21.25, cost_score: 32, geopolitical_risk: 10, weather_risk: 50, shipping_risk: 15, financial_stability: 90, estimated_risk_level: "low", supplier_capability_tier: "B", capacity: 850 },
    { id: "N11", name: "TexChem", type: "Raw Material Supplier", tier: 4, country: "USA", region: "North America", lat: 31.9686, lon: -99.9018, products: "Specialty Chemicals", risk_score: 21.25, cost_score: 45, geopolitical_risk: 15, weather_risk: 35, shipping_risk: 20, financial_stability: 85, estimated_risk_level: "low", supplier_capability_tier: "B", capacity: 650 },
    { id: "N12", name: "Malay Rubber", type: "Raw Material Supplier", tier: 4, country: "Malaysia", region: "Asia", lat: 4.2105, lon: 101.6964, products: "Rubber", risk_score: 41.25, cost_score: 20, geopolitical_risk: 30, weather_risk: 65, shipping_risk: 40, financial_stability: 70, estimated_risk_level: "medium", supplier_capability_tier: "C", capacity: 450 },
    { id: "N13", name: "Nihon Steel", type: "Raw Material Supplier", tier: 4, country: "Japan", region: "Asia", lat: 36.2048, lon: 138.2529, products: "Steel Alloys", risk_score: 27.50, cost_score: 42, geopolitical_risk: 15, weather_risk: 60, shipping_risk: 20, financial_stability: 85, estimated_risk_level: "low", supplier_capability_tier: "A", capacity: 950 },
    { id: "N14", name: "Emirates Alu", type: "Raw Material Supplier", tier: 4, country: "UAE", region: "Middle East", lat: 23.4241, lon: 53.8478, products: "Raw Aluminum", risk_score: 27.50, cost_score: 30, geopolitical_risk: 40, weather_risk: 15, shipping_risk: 35, financial_stability: 80, estimated_risk_level: "medium", supplier_capability_tier: "A", capacity: 850 },
    { id: "N15", name: "Britannia Metals", type: "Raw Material Supplier", tier: 4, country: "UK", region: "Europe", lat: 55.3781, lon: -3.4360, products: "Tin", risk_score: 23.75, cost_score: 38, geopolitical_risk: 20, weather_risk: 30, shipping_risk: 25, financial_stability: 80, estimated_risk_level: "low", supplier_capability_tier: "B", capacity: 550 },

    // ─── Tier 3: Component Suppliers (15) ────────────────────
    { id: "N16", name: "Tai-Chip Foundries", type: "Component Supplier", tier: 3, country: "Taiwan", region: "Asia", lat: 25.0330, lon: 121.5654, products: "Microchips", risk_score: 48.75, cost_score: 70, geopolitical_risk: 65, weather_risk: 75, shipping_risk: 40, financial_stability: 85, estimated_risk_level: "medium", supplier_capability_tier: "A", capacity: 5000 },
    { id: "N17", name: "Seoul Displays", type: "Component Supplier", tier: 3, country: "South Korea", region: "Asia", lat: 37.5665, lon: 126.9780, products: "OLED Screens", risk_score: 30.00, cost_score: 65, geopolitical_risk: 45, weather_risk: 30, shipping_risk: 35, financial_stability: 90, estimated_risk_level: "low", supplier_capability_tier: "A", capacity: 4500 },
    { id: "N18", name: "Shenzhen Batteries", type: "Component Supplier", tier: 3, country: "China", region: "Asia", lat: 22.5431, lon: 114.0579, products: "Lithium-Ion Batteries", risk_score: 47.50, cost_score: 55, geopolitical_risk: 50, weather_risk: 55, shipping_risk: 60, financial_stability: 75, estimated_risk_level: "medium", supplier_capability_tier: "A", capacity: 4000 },
    { id: "N19", name: "Bavarian AutoParts", type: "Component Supplier", tier: 3, country: "Germany", region: "Europe", lat: 48.1351, lon: 11.5820, products: "Sensors", risk_score: 17.50, cost_score: 75, geopolitical_risk: 15, weather_risk: 25, shipping_risk: 15, financial_stability: 85, estimated_risk_level: "low", supplier_capability_tier: "B", capacity: 3500 },
    { id: "N20", name: "Texan Circuits", type: "Component Supplier", tier: 3, country: "USA", region: "North America", lat: 30.2672, lon: -97.7431, products: "PCBs", risk_score: 23.75, cost_score: 68, geopolitical_risk: 15, weather_risk: 40, shipping_risk: 20, financial_stability: 80, estimated_risk_level: "low", supplier_capability_tier: "A", capacity: 3000 },
    { id: "N21", name: "Haifa Vision", type: "Component Supplier", tier: 3, country: "Israel", region: "Middle East", lat: 32.8191, lon: 34.9885, products: "Camera Modules", risk_score: 46.25, cost_score: 60, geopolitical_risk: 75, weather_risk: 15, shipping_risk: 65, financial_stability: 70, estimated_risk_level: "medium", supplier_capability_tier: "B", capacity: 2500 },
    { id: "N22", name: "Osaka Optics", type: "Component Supplier", tier: 3, country: "Japan", region: "Asia", lat: 34.6937, lon: 135.5023, products: "Lenses", risk_score: 26.25, cost_score: 62, geopolitical_risk: 15, weather_risk: 55, shipping_risk: 20, financial_stability: 85, estimated_risk_level: "low", supplier_capability_tier: "B", capacity: 2000 },
    { id: "N23", name: "Swiss Precision", type: "Component Supplier", tier: 3, country: "Switzerland", region: "Europe", lat: 46.8182, lon: 8.2275, products: "Connectors", risk_score: 11.25, cost_score: 85, geopolitical_risk: 10, weather_risk: 20, shipping_risk: 10, financial_stability: 95, estimated_risk_level: "low", supplier_capability_tier: "C", capacity: 1500 },
    { id: "N24", name: "Guadalajara Plastics", type: "Component Supplier", tier: 3, country: "Mexico", region: "North America", lat: 20.6596, lon: -103.3496, products: "Casings", risk_score: 36.25, cost_score: 40, geopolitical_risk: 35, weather_risk: 30, shipping_risk: 45, financial_stability: 65, estimated_risk_level: "medium", supplier_capability_tier: "C", capacity: 2200 },
    { id: "N25", name: "Bangalore Boards", type: "Component Supplier", tier: 3, country: "India", region: "Asia", lat: 12.9716, lon: 77.5946, products: "Motherboards", risk_score: 43.75, cost_score: 50, geopolitical_risk: 35, weather_risk: 60, shipping_risk: 50, financial_stability: 70, estimated_risk_level: "medium", supplier_capability_tier: "B", capacity: 2800 },
    { id: "N26", name: "KL Cables", type: "Component Supplier", tier: 3, country: "Malaysia", region: "Asia", lat: 3.1390, lon: 101.6869, products: "Wiring", risk_score: 40.00, cost_score: 35, geopolitical_risk: 30, weather_risk: 60, shipping_risk: 45, financial_stability: 75, estimated_risk_level: "medium", supplier_capability_tier: "B", capacity: 2400 },
    { id: "N27", name: "Anatolian Casings", type: "Component Supplier", tier: 3, country: "Turkey", region: "Middle East", lat: 39.9334, lon: 32.8597, products: "Metal Frames", risk_score: 57.50, cost_score: 42, geopolitical_risk: 70, weather_risk: 40, shipping_risk: 65, financial_stability: 45, estimated_risk_level: "high", supplier_capability_tier: "C", capacity: 1800 },
    { id: "N28", name: "Warsaw Electrics", type: "Component Supplier", tier: 3, country: "Poland", region: "Europe", lat: 52.2297, lon: 21.0122, products: "Power Supplies", risk_score: 32.50, cost_score: 52, geopolitical_risk: 40, weather_risk: 25, shipping_risk: 35, financial_stability: 70, estimated_risk_level: "medium", supplier_capability_tier: "B", capacity: 2600 },
    { id: "N29", name: "Hanoi Acoustics", type: "Component Supplier", tier: 3, country: "Vietnam", region: "Asia", lat: 21.0285, lon: 105.8542, products: "Speakers & Mics", risk_score: 48.75, cost_score: 30, geopolitical_risk: 35, weather_risk: 70, shipping_risk: 55, financial_stability: 65, estimated_risk_level: "low", supplier_capability_tier: "C", capacity: 1200 },
    { id: "N30", name: "Toronto Tech", type: "Component Supplier", tier: 3, country: "Canada", region: "North America", lat: 43.6532, lon: -79.3832, products: "Cooling Systems", risk_score: 21.25, cost_score: 58, geopolitical_risk: 10, weather_risk: 45, shipping_risk: 15, financial_stability: 85, estimated_risk_level: "low", supplier_capability_tier: "B", capacity: 2100 },

    // ─── Tier 2: Manufacturers (10) ──────────────────────────
    { id: "N31", name: "FoxAssembly Shenzhen", type: "Manufacturer", tier: 2, country: "China", region: "Asia", lat: 22.5431, lon: 114.0579, products: "Smartphones", risk_score: 42.50, cost_score: 80, geopolitical_risk: 50, weather_risk: 45, shipping_risk: 55, financial_stability: 80, estimated_risk_level: "medium", supplier_capability_tier: "A", capacity: 10000 },
    { id: "N32", name: "VietTech Manufacturing", type: "Manufacturer", tier: 2, country: "Vietnam", region: "Asia", lat: 21.0285, lon: 105.8542, products: "Laptops", risk_score: 43.75, cost_score: 65, geopolitical_risk: 35, weather_risk: 65, shipping_risk: 50, financial_stability: 75, estimated_risk_level: "low", supplier_capability_tier: "B", capacity: 8000 },
    { id: "N33", name: "Chennai Electronics", type: "Manufacturer", tier: 2, country: "India", region: "Asia", lat: 13.0827, lon: 80.2707, products: "Tablets", risk_score: 40.00, cost_score: 55, geopolitical_risk: 35, weather_risk: 55, shipping_risk: 45, financial_stability: 75, estimated_risk_level: "medium", supplier_capability_tier: "B", capacity: 7000 },
    { id: "N34", name: "Monterrey Assembly", type: "Manufacturer", tier: 2, country: "Mexico", region: "North America", lat: 25.6866, lon: -100.3161, products: "Smartphones", risk_score: 33.75, cost_score: 60, geopolitical_risk: 30, weather_risk: 35, shipping_risk: 40, financial_stability: 70, estimated_risk_level: "low", supplier_capability_tier: "B", capacity: 6000 },
    { id: "N35", name: "Austin TechWorks", type: "Manufacturer", tier: 2, country: "USA", region: "North America", lat: 30.2672, lon: -97.7431, products: "High-End Desktops", risk_score: 20.00, cost_score: 90, geopolitical_risk: 15, weather_risk: 30, shipping_risk: 20, financial_stability: 85, estimated_risk_level: "low", supplier_capability_tier: "B", capacity: 4000 },
    { id: "N36", name: "Brno Systems", type: "Manufacturer", tier: 2, country: "Czech Republic", region: "Europe", lat: 49.1950, lon: 16.6068, products: "Laptops", risk_score: 22.50, cost_score: 70, geopolitical_risk: 20, weather_risk: 25, shipping_risk: 25, financial_stability: 80, estimated_risk_level: "low", supplier_capability_tier: "B", capacity: 5000 },
    { id: "N37", name: "Sao Paulo Devices", type: "Manufacturer", tier: 2, country: "Brazil", region: "South America", lat: -23.5505, lon: -46.6333, products: "Smartphones", risk_score: 48.75, cost_score: 50, geopolitical_risk: 45, weather_risk: 35, shipping_risk: 50, financial_stability: 65, estimated_risk_level: "medium", supplier_capability_tier: "C", capacity: 4500 },
    { id: "N38", name: "Dubai Tech Hub", type: "Manufacturer", tier: 2, country: "UAE", region: "Middle East", lat: 25.2048, lon: 55.2708, products: "Wearables", risk_score: 27.50, cost_score: 72, geopolitical_risk: 40, weather_risk: 15, shipping_risk: 35, financial_stability: 80, estimated_risk_level: "medium", supplier_capability_tier: "B", capacity: 3500 },
    { id: "N39", name: "Penang Assemblers", type: "Manufacturer", tier: 2, country: "Malaysia", region: "Asia", lat: 5.3520, lon: 100.3331, products: "IoT Devices", risk_score: 38.75, cost_score: 48, geopolitical_risk: 30, weather_risk: 55, shipping_risk: 45, financial_stability: 75, estimated_risk_level: "medium", supplier_capability_tier: "C", capacity: 3000 },
    { id: "N40", name: "Budapest Fab", type: "Manufacturer", tier: 2, country: "Hungary", region: "Europe", lat: 47.4979, lon: 19.0402, products: "Server Racks", risk_score: 25.00, cost_score: 65, geopolitical_risk: 25, weather_risk: 20, shipping_risk: 30, financial_stability: 75, estimated_risk_level: "low", supplier_capability_tier: "B", capacity: 2500 },

    // ─── Tier 1: Distributors (5) ────────────────────────────
    { id: "N41", name: "Global Hub Singapore", type: "Distributor", tier: 1, country: "Singapore", region: "Asia", lat: 1.3521, lon: 103.8198, products: "Electronics", risk_score: 15.00, cost_score: 78, geopolitical_risk: 10, weather_risk: 20, shipping_risk: 10, financial_stability: 90, estimated_risk_level: "low", supplier_capability_tier: "A", capacity: 20000 },
    { id: "N42", name: "EuroLogistics Rotterdam", type: "Distributor", tier: 1, country: "Netherlands", region: "Europe", lat: 51.9225, lon: 4.4792, products: "Electronics", risk_score: 12.50, cost_score: 82, geopolitical_risk: 10, weather_risk: 25, shipping_risk: 10, financial_stability: 95, estimated_risk_level: "low", supplier_capability_tier: "A", capacity: 22000 },
    { id: "N43", name: "AmeriDistribute Memphis", type: "Distributor", tier: 1, country: "USA", region: "North America", lat: 35.1495, lon: -90.0490, products: "Electronics", risk_score: 13.75, cost_score: 80, geopolitical_risk: 10, weather_risk: 30, shipping_risk: 10, financial_stability: 95, estimated_risk_level: "low", supplier_capability_tier: "B", capacity: 18000 },
    { id: "N44", name: "Gulf Transit Dubai", type: "Distributor", tier: 1, country: "UAE", region: "Middle East", lat: 25.2048, lon: 55.2708, products: "Electronics", risk_score: 22.50, cost_score: 70, geopolitical_risk: 35, weather_risk: 10, shipping_risk: 25, financial_stability: 80, estimated_risk_level: "medium", supplier_capability_tier: "B", capacity: 15000 },
    { id: "N45", name: "Panama Gateway", type: "Distributor", tier: 1, country: "Panama", region: "Central America", lat: 8.9824, lon: -79.5199, products: "Electronics", risk_score: 25.00, cost_score: 62, geopolitical_risk: 30, weather_risk: 40, shipping_risk: 20, financial_stability: 75, estimated_risk_level: "medium", supplier_capability_tier: "B", capacity: 12000 },

    // ─── Tier 0: Retailers (5) ──────────────────────────────
    { id: "N46", name: "TechGiant Retail", type: "Retailer", tier: 0, country: "USA", region: "North America", lat: 37.7749, lon: -122.4194, products: "Consumer Tech", risk_score: 10.00, cost_score: 92, geopolitical_risk: 10, weather_risk: 15, shipping_risk: 10, financial_stability: 95, estimated_risk_level: "low", supplier_capability_tier: "A", capacity: 50000 },
    { id: "N47", name: "EuroMart Electronics", type: "Retailer", tier: 0, country: "Germany", region: "Europe", lat: 52.5200, lon: 13.4050, products: "Consumer Tech", risk_score: 10.00, cost_score: 88, geopolitical_risk: 10, weather_risk: 15, shipping_risk: 10, financial_stability: 95, estimated_risk_level: "low", supplier_capability_tier: "B", capacity: 45000 },
    { id: "N48", name: "AsiaTech Plaza", type: "Retailer", tier: 0, country: "Japan", region: "Asia", lat: 35.6762, lon: 139.6503, products: "Consumer Tech", risk_score: 12.50, cost_score: 85, geopolitical_risk: 10, weather_risk: 40, shipping_risk: 10, financial_stability: 90, estimated_risk_level: "low", supplier_capability_tier: "B", capacity: 40000 },
    { id: "N49", name: "Global Online Store", type: "Retailer", tier: 0, country: "Ireland", region: "Europe", lat: 53.3498, lon: -6.2603, products: "E-commerce", risk_score: 8.00, cost_score: 95, geopolitical_risk: 5, weather_risk: 10, shipping_risk: 10, financial_stability: 97, estimated_risk_level: "low", supplier_capability_tier: "A", capacity: 100000 },
    { id: "N50", name: "MiddleEast MegaStore", type: "Retailer", tier: 0, country: "Saudi Arabia", region: "Middle East", lat: 24.7136, lon: 46.6753, products: "Consumer Tech", risk_score: 18.00, cost_score: 75, geopolitical_risk: 35, weather_risk: 10, shipping_risk: 20, financial_stability: 85, estimated_risk_level: "low", supplier_capability_tier: "C", capacity: 35000 },
];

// ════════════════════════════════════════════════════════════
//  EDGES — 57 supply chain relationships
//  ⚠ SPOF: N34 relies entirely on N24; N38 relies entirely on N21
// ════════════════════════════════════════════════════════════

export const edges: SupplyEdge[] = [
    { id: "E01", source: "N01", target: "N16", relationship: "supplies_to", dependency_weight: 1.00 },
    { id: "E02", source: "N01", target: "N20", relationship: "supplies_to", dependency_weight: 0.64 },
    { id: "E03", source: "N02", target: "N18", relationship: "supplies_to", dependency_weight: 0.50 },
    { id: "E04", source: "N03", target: "N18", relationship: "supplies_to", dependency_weight: 0.50 },
    { id: "E05", source: "N04", target: "N24", relationship: "supplies_to", dependency_weight: 1.00 },
    { id: "E06", source: "N05", target: "N26", relationship: "supplies_to", dependency_weight: 0.67 },
    { id: "E07", source: "N05", target: "N28", relationship: "supplies_to", dependency_weight: 1.00 },
    { id: "E08", source: "N06", target: "N27", relationship: "supplies_to", dependency_weight: 0.50 },
    { id: "E09", source: "N07", target: "N17", relationship: "supplies_to", dependency_weight: 1.00 },
    { id: "E10", source: "N08", target: "N14", relationship: "supplies_to", dependency_weight: 1.00 },
    { id: "E11", source: "N09", target: "N21", relationship: "supplies_to", dependency_weight: 1.00 },
    { id: "E12", source: "N09", target: "N22", relationship: "supplies_to", dependency_weight: 1.00 },
    { id: "E13", source: "N10", target: "N29", relationship: "supplies_to", dependency_weight: 1.00 },
    { id: "E14", source: "N11", target: "N20", relationship: "supplies_to", dependency_weight: 0.36 },
    { id: "E15", source: "N11", target: "N25", relationship: "supplies_to", dependency_weight: 0.50 },
    { id: "E16", source: "N12", target: "N26", relationship: "supplies_to", dependency_weight: 0.33 },
    { id: "E17", source: "N13", target: "N23", relationship: "supplies_to", dependency_weight: 1.00 },
    { id: "E18", source: "N14", target: "N27", relationship: "supplies_to", dependency_weight: 0.50 },
    { id: "E19", source: "N15", target: "N25", relationship: "supplies_to", dependency_weight: 0.50 },
    { id: "E20", source: "N16", target: "N31", relationship: "supplies_to", dependency_weight: 0.28 },
    { id: "E22", source: "N17", target: "N31", relationship: "supplies_to", dependency_weight: 0.28 },
    { id: "E24", source: "N18", target: "N31", relationship: "supplies_to", dependency_weight: 0.28 },
    { id: "E30", source: "N22", target: "N31", relationship: "supplies_to", dependency_weight: 0.16 },
    { id: "E21", source: "N16", target: "N32", relationship: "supplies_to", dependency_weight: 0.78 },
    { id: "E37", source: "N29", target: "N32", relationship: "supplies_to", dependency_weight: 0.22 },
    { id: "E23", source: "N17", target: "N33", relationship: "supplies_to", dependency_weight: 0.64 },
    { id: "E33", source: "N25", target: "N33", relationship: "supplies_to", dependency_weight: 0.36 },
    { id: "E32", source: "N24", target: "N34", relationship: "supplies_to", dependency_weight: 1.00 },
    { id: "E28", source: "N20", target: "N35", relationship: "supplies_to", dependency_weight: 0.64 },
    { id: "E38", source: "N30", target: "N35", relationship: "supplies_to", dependency_weight: 0.36 },
    { id: "E26", source: "N19", target: "N36", relationship: "supplies_to", dependency_weight: 0.40 },
    { id: "E31", source: "N23", target: "N36", relationship: "supplies_to", dependency_weight: 0.20 },
    { id: "E36", source: "N28", target: "N36", relationship: "supplies_to", dependency_weight: 0.40 },
    { id: "E25", source: "N18", target: "N37", relationship: "supplies_to", dependency_weight: 1.00 },
    { id: "E29", source: "N21", target: "N38", relationship: "supplies_to", dependency_weight: 1.00 },
    { id: "E34", source: "N26", target: "N39", relationship: "supplies_to", dependency_weight: 1.00 },
    { id: "E27", source: "N19", target: "N40", relationship: "supplies_to", dependency_weight: 0.67 },
    { id: "E35", source: "N27", target: "N40", relationship: "supplies_to", dependency_weight: 0.33 },
    { id: "E39", source: "N31", target: "N41", relationship: "distributes_to", dependency_weight: 0.54 },
    { id: "E40", source: "N31", target: "N43", relationship: "distributes_to", dependency_weight: 0.47 },
    { id: "E41", source: "N32", target: "N41", relationship: "distributes_to", dependency_weight: 0.31 },
    { id: "E42", source: "N33", target: "N44", relationship: "distributes_to", dependency_weight: 0.50 },
    { id: "E43", source: "N34", target: "N43", relationship: "distributes_to", dependency_weight: 0.27 },
    { id: "E44", source: "N35", target: "N43", relationship: "distributes_to", dependency_weight: 0.26 },
    { id: "E45", source: "N36", target: "N42", relationship: "distributes_to", dependency_weight: 0.50 },
    { id: "E46", source: "N37", target: "N45", relationship: "distributes_to", dependency_weight: 1.00 },
    { id: "E47", source: "N38", target: "N44", relationship: "distributes_to", dependency_weight: 0.50 },
    { id: "E48", source: "N39", target: "N41", relationship: "distributes_to", dependency_weight: 0.15 },
    { id: "E49", source: "N40", target: "N42", relationship: "distributes_to", dependency_weight: 0.50 },
    { id: "E50", source: "N41", target: "N48", relationship: "distributes_to", dependency_weight: 1.00 },
    { id: "E51", source: "N41", target: "N49", relationship: "distributes_to", dependency_weight: 0.39 },
    { id: "E52", source: "N42", target: "N47", relationship: "distributes_to", dependency_weight: 1.00 },
    { id: "E53", source: "N42", target: "N49", relationship: "distributes_to", dependency_weight: 0.39 },
    { id: "E54", source: "N43", target: "N46", relationship: "distributes_to", dependency_weight: 0.50 },
    { id: "E55", source: "N43", target: "N49", relationship: "distributes_to", dependency_weight: 0.22 },
    { id: "E56", source: "N44", target: "N50", relationship: "distributes_to", dependency_weight: 1.00 },
    { id: "E57", source: "N45", target: "N46", relationship: "distributes_to", dependency_weight: 0.50 },
];

// ── Tier labels (5 tiers) ─────────────────────────────────
export const TIER_LABELS: Record<number, string> = {
    4: "Raw Materials",
    3: "Components",
    2: "Manufacturers",
    1: "Distributors",
    0: "Retailers",
};

// ── Tier colors (Neo-Brutalism palette, 5 tiers) ──────────
export const TIER_COLORS: Record<number, string> = {
    4: "#9BFF00",  // lime  — raw materials
    3: "#FFDF00",  // yellow — components
    2: "#FF2E88",  // pink  — manufacturers
    1: "#00D4FF",  // cyan  — distributors
    0: "#FFFFFF",  // white — retailers
};

// ── Region colors for geo visualization ───────────────────
export const REGION_COLORS: Record<string, string> = {
    "Asia": "#FFDF00",
    "Europe": "#9BFF00",
    "North America": "#00D4FF",
    "Middle East": "#FF2E88",
    "Africa": "#FF3333",
    "South America": "#FF8800",
    "Oceania": "#AA88FF",
    "Central America": "#FF8800",
};
