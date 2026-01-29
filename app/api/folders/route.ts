// app/api/folders/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const BUCKET_NAME = "geotechnical-data";

export async function GET() {
    try {
        // List everything in the bucket
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .list();

        if (error) {
            console.error("Storage error:", error);
            return NextResponse.json({
                error: error.message,
                details: error
            }, { status: 400 });
        }

        console.log("Storage data:", data);

        // Extract folder names
        const folders = data
            .filter(item => !item.id) // Folders don't have IDs in Supabase
            .map(folder => ({
                name: folder.name
            }));

        console.log("Folders found:", folders);

        return NextResponse.json({
            success: true,
            folders,
            rawData: data // For debugging
        });
    } catch (err: any) {
        console.error("Error:", err);
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}