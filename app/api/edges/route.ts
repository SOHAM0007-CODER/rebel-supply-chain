// ============================================================
// API Route: GET /api/edges
// Returns all supply chain edges
// ============================================================

import { NextResponse } from "next/server";
import { edges } from "@/lib/mockData";

export async function GET() {
    return NextResponse.json({
        count: edges.length,
        edges,
    });
}
