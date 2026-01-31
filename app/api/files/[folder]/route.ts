// app/api/files/[folder]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

const BUCKET_NAME = "geotechnical-data";

// Mark as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{
        folder: string;
    }>;
}

export async function GET(
    request: Request,
    context: RouteContext
) {
    try {
        // Properly await params
        const params = await context.params;
        const folderName = params.folder;

        console.log(`Fetching files from folder: ${folderName}`);

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .list(folderName);

        if (error) {
            console.error("Storage error:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        const files = data
            .filter(
                (item) =>
                    item.id &&
                    item.name !== ".emptyFolderPlaceholder" &&
                    !item.name.startsWith(".")
            )
            .map((file) => ({
                name: file.name,
                metadata: file.metadata,
                created_at: file.created_at,
                updated_at: file.updated_at,
            }));

        console.log(`Found ${files.length} files`);

        return NextResponse.json({
            success: true,
            files,
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Error:", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}