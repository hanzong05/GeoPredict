// app/api/files/[folder]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const BUCKET_NAME = "geotechnical-data";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ folder: string }> }
) {
    try {
        // Await params in Next.js 15
        const { folder: folderName } = await params;

        console.log(`Fetching files from folder: ${folderName}`);

        // List files in the specific folder
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .list(folderName);

        if (error) {
            console.error("Storage error:", error);
            return NextResponse.json({
                error: error.message
            }, { status: 400 });
        }

        console.log(`Files in ${folderName}:`, data);

        // Filter out placeholder files and only get actual files
        const files = data
            .filter(item =>
                item.id && // Only actual files (not subfolders)
                item.name !== '.emptyFolderPlaceholder' && // Filter out placeholder
                !item.name.startsWith('.') // Filter out any hidden files
            )
            .map(file => ({
                name: file.name,
                metadata: file.metadata,
                created_at: file.created_at,
                updated_at: file.updated_at
            }));

        console.log(`Found ${files.length} files`);

        return NextResponse.json({
            success: true,
            files
        });
    } catch (err: any) {
        console.error("Error:", err);
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}