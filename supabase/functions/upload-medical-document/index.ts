import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl =
    Deno.env.get("SUPABASE_URL")!;

const serviceRoleKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin =
    createClient(
        supabaseUrl,
        serviceRoleKey
    );

Deno.serve(async (req) => {

    // ------------------------------------------------------------
    // CORS
    // ------------------------------------------------------------

    if (req.method === "OPTIONS") {

        return new Response(
            null,
            {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers":
                        "authorization, x-client-info, apikey, content-type",
                    "Access-Control-Allow-Methods":
                        "POST, OPTIONS",
                },
            }
        );
    }

    try {

        if (req.method !== "POST") {

            return new Response(
                JSON.stringify({
                    error:
                        "Method not allowed",
                }),
                {
                    status: 405,
                    headers: {
                        "Content-Type":
                            "application/json",
                        "Access-Control-Allow-Origin":
                            "*",
                    },
                }
            );
        }

        // --------------------------------------------------------
        // Request body
        // --------------------------------------------------------

        const body =
            await req.json();

        const userId =
            body?.userId;

        const fileName =
            body?.fileName;

        const mimeType =
            body?.mimeType ||
            "application/octet-stream";

        const fileSize =
            Number(body?.fileSize || 0);

        const fileBase64 =
            body?.fileBase64;

        console.log(
            "UPLOAD MEDICAL DOCUMENT"
        );

        console.log(
            "User ID:",
            userId
        );

        console.log(
            "File:",
            fileName
        );

        console.log(
            "Mime:",
            mimeType
        );

        // --------------------------------------------------------
        // Validation
        // --------------------------------------------------------

        if (!userId) {

            throw new Error(
                "userId is required."
            );
        }

        if (!fileName) {

            throw new Error(
                "fileName is required."
            );
        }

        if (!fileBase64) {

            throw new Error(
                "fileBase64 is required."
            );
        }

        // --------------------------------------------------------
        // Verify profile exists
        // --------------------------------------------------------

        const {
            data: profile,
            error: profileError,
        } =
            await supabaseAdmin
                .from("profiles")
                .select("id")
                .eq("id", userId)
                .maybeSingle();

        if (profileError) {

            throw new Error(
                `Profile lookup failed: ${profileError.message}`
            );
        }

        if (!profile) {

            throw new Error(
                `Profile does not exist for user ID ${userId}`
            );
        }

        console.log(
            "Profile verified:",
            profile.id
        );

        // --------------------------------------------------------
        // Generate IDs
        // --------------------------------------------------------

        const documentId =
            crypto.randomUUID();

        const storageFileId =
            crypto.randomUUID();

        // --------------------------------------------------------
        // Extension
        // --------------------------------------------------------

        const extension =
            fileName.includes(".")
                ? fileName.substring(
                    fileName.lastIndexOf(".")
                )
                : "";

        const filePath =
            `${userId}/${documentId}/${storageFileId}${extension}`;

        console.log(
            "Document ID:",
            documentId
        );

        console.log(
            "Storage path:",
            filePath
        );

        // --------------------------------------------------------
        // Base64 → Uint8Array
        // --------------------------------------------------------

        const binaryString =
            atob(fileBase64);

        const bytes =
            new Uint8Array(
                binaryString.length
            );

        for (
            let i = 0;
            i < binaryString.length;
            i++
        ) {
            bytes[i] =
                binaryString.charCodeAt(i);
        }

        // --------------------------------------------------------
        // Storage upload
        // --------------------------------------------------------

        console.log(
            "Starting Storage upload..."
        );

        const {
            error: storageError
        } =
            await supabaseAdmin
                .storage
                .from("medical-documents")
                .upload(
                    filePath,
                    bytes,
                    {
                        contentType:
                            mimeType,

                        upsert:
                            false,
                    }
                );

        if (storageError) {

            console.error(
                "Storage upload failed:",
                storageError
            );

            throw new Error(
                `Storage upload failed: ${storageError.message}`
            );
        }

        console.log(
            "Storage upload SUCCESS"
        );

        // --------------------------------------------------------
        // Documents row
        // --------------------------------------------------------

        const payload = {
            id:
                documentId,

            user_id:
                userId,

            file_path:
                filePath,

            file_name:
                fileName,

            mime_type:
                mimeType,

            file_size:
                fileSize,

            document_type:
                "other",

            status:
                "uploaded",

            needs_review:
                false,
        };

        console.log(
            "Creating documents row..."
        );

        const {
            data: document,
            error: documentError
        } =
            await supabaseAdmin
                .from("documents")
                .insert(payload)
                .select("*")
                .single();

        if (documentError) {

            console.error(
                "Documents insert failed:",
                documentError
            );

            // ----------------------------------------------------
            // Cleanup storage
            // ----------------------------------------------------

            console.log(
                "Removing orphaned Storage file..."
            );

            const {
                error: cleanupError
            } =
                await supabaseAdmin
                    .storage
                    .from("medical-documents")
                    .remove([
                        filePath
                    ]);

            if (cleanupError) {

                console.error(
                    "Storage cleanup failed:",
                    cleanupError
                );
            }

            throw new Error(
                `Document insert failed: ${documentError.message}`
            );
        }

        if (!document) {

            throw new Error(
                "Document row was not returned."
            );
        }

        console.log(
            "DOCUMENT ROW CREATED:",
            document
        );

        // --------------------------------------------------------
        // SUCCESS
        // --------------------------------------------------------

        return new Response(
            JSON.stringify({
                success:
                    true,

                document,

                documentId:
                    document.id,

                filePath:
                    filePath,
            }),
            {
                status: 200,

                headers: {
                    "Content-Type":
                        "application/json",

                    "Access-Control-Allow-Origin":
                        "*",
                },
            }
        );

    } catch (error) {

        console.error(
            "Medical document upload error:",
            error
        );

        return new Response(
            JSON.stringify({
                success:
                    false,

                error:
                    error instanceof Error
                        ? error.message
                        : "Medical document upload failed.",
            }),
            {
                status: 500,

                headers: {
                    "Content-Type":
                        "application/json",

                    "Access-Control-Allow-Origin":
                        "*",
                },
            }
        );
    }
});