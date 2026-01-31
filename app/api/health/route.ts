// app/api/health/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

// Mark as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    try {
        const BUCKET_NAME = "geotechnical-data";

        // Try listing 1 file to check connection
        const { data, error } = await supabase.storage.from(BUCKET_NAME).list("", {
            limit: 1,
            offset: 0,
        });

        if (error) {
            return NextResponse.json(
                { success: false, message: "Supabase connection failed", error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Supabase connection successful",
            filesCount: data.length,
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Supabase connection failed";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
}