const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../lib/mockData.ts');

function assignDependencyWeights() {
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Parse Suppliers to get their Capability Tiers
    const supplierRegex = /\{ id: "(N\d+)",.*?supplier_capability_tier: "(.*?)" \}/g;
    const capabilityMap = new Map();
    let match;
    while ((match = supplierRegex.exec(content)) !== null) {
        capabilityMap.set(match[1], match[2]);
    }

    // 2. Process Edges
    // Using a more robust regex for multi-line block
    const edgesStart = content.indexOf('export const edges: SupplyEdge[] = [');
    const edgesEnd = content.indexOf('];', edgesStart) + 2;
    const edgesBlock = content.substring(edgesStart, edgesEnd);

    const edgeItemRegex = /\{ id: "(.*?)", source: "(.*?)", target: "(.*?)", relationship: "(.*?)"(,\s*dependency_weight: (.*?))? \}/g;

    // Group edges by target
    const targetGroups = new Map();
    const allEdges = [];
    while ((match = edgeItemRegex.exec(edgesBlock)) !== null) {
        const edge = {
            id: match[1],
            source: match[2],
            target: match[3],
            relationship: match[4],
            weight: match[6] ? parseFloat(match[6]) : null
        };
        allEdges.push(edge);
        if (!targetGroups.has(edge.target)) targetGroups.set(edge.target, []);
        targetGroups.get(edge.target).push(edge);
    }

    // 3. Assign and Normalize Weights
    const weightRules = { 'A': 0.7, 'B': 0.4, 'C': 0.2 };

    allEdges.forEach(edge => {
        const group = targetGroups.get(edge.target);
        if (group.length === 1) {
            edge.weight = 1.0;
        } else {
            const sourceCap = capabilityMap.get(edge.source) || 'B';
            edge.weight = weightRules[sourceCap];
        }
    });

    // Normalize by target group
    targetGroups.forEach((group, targetId) => {
        if (group.length > 1) {
            const totalWeight = group.reduce((sum, e) => sum + (e.weight || 0), 0);
            group.forEach(e => {
                e.weight = parseFloat((e.weight / totalWeight).toFixed(2));
            });
            // Adjust last element to ensure sum is exactly 1.0
            const currentSum = parseFloat(group.reduce((sum, e) => sum + e.weight, 0).toFixed(2));
            if (currentSum !== 1.0) {
                group[group.length - 1].weight = parseFloat((group[group.length - 1].weight + (1.0 - currentSum)).toFixed(2));
            }
        }
    });

    // 4. Reconstruct File Content
    const reconstructedEdges = allEdges.map(e => 
        `    { id: "${e.id}", source: "${e.source}", target: "${e.target}", relationship: "${e.relationship}", dependency_weight: ${e.weight.toFixed(2)} }`
    ).join(',\n');

    const updatedEdgesBlock = `export const edges: SupplyEdge[] = [\n${reconstructedEdges},\n];`;
    const updatedContent = content.substring(0, edgesStart) + updatedEdgesBlock + content.substring(edgesEnd);

    fs.writeFileSync(filePath, updatedContent);
    console.log('Successfully assigned dependency weights in mockData.ts');
}

assignDependencyWeights();
