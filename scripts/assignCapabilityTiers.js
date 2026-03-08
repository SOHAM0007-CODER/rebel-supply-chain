const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../lib/mockData.ts');

const TIER_A_PRODUCTS = [
    'Silicon', 'Lithium', 'Cobalt', 'Aluminum', 'Rare Earths', 'Steel Alloys',
    'Microchips', 'OLED Screens', 'Lithium-Ion Batteries', 'PCBs'
];

const TIER_B_PRODUCTS = [
    'Plastic Resins', 'Copper', 'Bauxite', 'Cellulose', 'Specialty Chemicals', 'Tin',
    'Sensors', 'Camera Modules', 'Lenses', 'Motherboards', 'Wiring', 'Power Supplies', 'Cooling Systems'
];

function assignCapabilityTiers() {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Regex to match the supplier objects in the array
    const supplierRegex = /\{ id: "(N\d+)", name: "(.*?)", type: "(.*?)", tier: (\d), country: "(.*?)", region: "(.*?)", lat: (.*?), lon: (.*?), products: "(.*?)", risk_score: (.*?), cost_score: (.*?), geopolitical_risk: (.*?), weather_risk: (.*?), shipping_risk: (.*?), financial_stability: (.*?), estimated_risk_level: "(.*?)"(,\s*supplier_capability_tier: "(.*?)")? \}/g;

    const updatedContent = content.replace(supplierRegex, (match, id, name, type, tier, country, region, lat, lon, products, risk, cost, geo, weather, shipping, financial, riskLevel, capTierPart, capTier) => {
        const tierNum = parseInt(tier);
        let assignedTier = capTier || "B"; // Default to B if not found and not a specialized product

        if (tierNum === 4 || tierNum === 3) {
            if (TIER_A_PRODUCTS.some(p => products.includes(p))) assignedTier = "A";
            else if (TIER_B_PRODUCTS.some(p => products.includes(p))) assignedTier = "B";
            else assignedTier = "C";
        } else if (tierNum <= 2) {
            // Logic for higher tiers
            if (name.includes('FoxAssembly') || name.includes('Global Hub') || name.includes('Giant') || name.includes('Online Store') || country === 'Netherlands') assignedTier = "A";
            else if (name.includes('MegaStore') || name.includes('Devices') || name.includes('Assemblers')) assignedTier = "C";
            else assignedTier = "B";
        }

        return `{ id: "${id}", name: "${name}", type: "${type}", tier: ${tier}, country: "${country}", region: "${region}", lat: ${lat}, lon: ${lon}, products: "${products}", risk_score: ${risk}, cost_score: ${cost}, geopolitical_risk: ${geo}, weather_risk: ${weather}, shipping_risk: ${shipping}, financial_stability: ${financial}, estimated_risk_level: "${riskLevel}", supplier_capability_tier: "${assignedTier}" }`;
    });

    fs.writeFileSync(filePath, updatedContent);
    console.log('Successfully assigned capability tiers in mockData.ts');
}

assignCapabilityTiers();
