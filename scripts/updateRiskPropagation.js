const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../lib/algorithms.ts');

function updateRiskPropagation() {
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. New DFS logic
    const dfsReplace = `    function dfs(current: string, visited: Set<string>, path: string[], currentWeight: number = 1.0) {
        const currentNode = nodeMap.get(current);
        const weightedRisk = (currentNode?.risk_score ?? 0) * currentWeight;
        
        if (weightedRisk > maxRisk) {
            maxRisk = weightedRisk;
            maxPath = [...path];
        }

        const parents = upstream.get(current) ?? [];
        for (const parent of parents) {
            if (!visited.has(parent)) {
                // Find the edge between parent and current to get dependency_weight
                const edge = edges.find(e => e.source === parent && e.target === current);
                const weight = edge?.dependency_weight ?? 1.0;
                
                visited.add(parent);
                dfs(parent, visited, [...path, parent], weight);
                visited.delete(parent);
            }
        }
    }`;

    // Regex to match the old DFS function more flexibly
    const dfsRegex = /function dfs\(current: string, visited: Set<string>, path: string\[\]\) \{[\s\S]*?\}\s*?\}/;

    if (dfsRegex.test(content)) {
        content = content.replace(dfsRegex, dfsReplace + "\n    }");
        
        // 2. Update initial call
        content = content.replace(
            /visited = new Set<string>\(\[nodeId\]\);\s*dfs\(nodeId, visited, \[nodeId\]\);/,
            `visited = new Set<string>([nodeId]);\n    dfs(nodeId, visited, [nodeId], 1.0);`
        );

        fs.writeFileSync(filePath, content);
        console.log('Successfully updated risk propagation in algorithms.ts');
    } else {
        console.error('Could not find the DFS function in algorithms.ts using regex');
    }
}

updateRiskPropagation();
