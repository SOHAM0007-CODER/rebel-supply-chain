// ============================================================
// API Route: GET /api/suppliers
// Returns all supplier nodes with optional filtering
// Query params: ?tier=2&search=wafer&minRisk=50&maxRisk=100
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { suppliers } from "@/lib/mockData";

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    let result = [...suppliers];

    // Filter by tier
    const tier = searchParams.get("tier");
    if (tier !== null && tier !== "") {
        result = result.filter((s) => s.tier === Number(tier));
    }

    // Filter by search term (name or industry)
    const search = searchParams.get("search");
    if (search) {
        const q = search.toLowerCase();
        result = result.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.products.toLowerCase().includes(q)
        );
    }

    // Filter by risk range
    const minRisk = searchParams.get("minRisk");
    const maxRisk = searchParams.get("maxRisk");
    if (minRisk) result = result.filter((s) => s.risk_score >= Number(minRisk));
    if (maxRisk) result = result.filter((s) => s.risk_score <= Number(maxRisk));

    // Sort
    const sortBy = searchParams.get("sortBy") as keyof typeof result[0] | null;
    const sortDir = searchParams.get("sortDir") === "asc" ? 1 : -1;
    if (sortBy && result.length > 0 && sortBy in result[0]) {
        result.sort((a, b) => {
            const av = a[sortBy];
            const bv = b[sortBy];
            if (typeof av === "number" && typeof bv === "number")
                return (av - bv) * sortDir;
            return String(av).localeCompare(String(bv)) * sortDir;
        });
    }

    return NextResponse.json({
        count: result.length,
        suppliers: result,
    });
}
