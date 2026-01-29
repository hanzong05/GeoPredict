// app/api/files/[folder]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const BUCKET_NAME = "geotechnical-data";

export async function GET(
    request: Request,
    { params }: { params: { folder: string } } // <-- remove Promise
) {
    try {
        const { folder: folderName } = params; // No need to await

        console.log(`Fetching files from folder: ${folderName}`);

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .list(folderName);

        if (error) {
            console.error("Storage error:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        const files = data
            .filter(item =>
                item.id &&
                item.name !== ".emptyFolderPlaceholder" &&
                !item.name.startsWith(".")
            )
            .map(file => ({
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
    } catch (err: any) {
        console.error("Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
