import { SupplierNode } from "@/lib/mockData";

/**
 * Detects components or materials that are supplied by very few suppliers
 * and therefore represent a supply chain chokepoint.
 * 
 * @param suppliers - Array of supplier nodes
 * @returns Array of product names supplied by 1 or fewer suppliers
 */
export function findCriticalComponents(suppliers: SupplierNode[]): string[] {
    const productCounts: Record<string, number> = {};

    suppliers.forEach((s) => {
        const parts = s.products.split(/, | & /);
        parts.forEach((product) => {
            const trimmed = product.trim();
            if (trimmed) {
                productCounts[trimmed] = (productCounts[trimmed] || 0) + 1;
            }
        });
    });

    const critical = Object.entries(productCounts)
        .filter(([_, count]) => count <= 1)
        .map(([product]) => product);

    return critical;
}
