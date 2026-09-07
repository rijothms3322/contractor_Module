"use client";

export type UploadMedicalDocumentResult = {
    success: true;
    document: any;
    documentId: string;
    filePath: string;
};

export async function uploadMedicalDocument(
    file: File,
    userId: string
): Promise<UploadMedicalDocumentResult> {

    console.log("================================");
    console.log("mobile: MEDICAL DOCUMENT UPLOAD START");
    console.log("mobile: Passed User ID:", userId);
    console.log(
        "mobile: File:",
        file.name,
        file.type,
        file.size
    );

    if (!userId) {
        throw new Error("User ID is required.");
    }

    if (!file) {
        throw new Error("File is required.");
    }

    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
        throw new Error(
            "NEXT_PUBLIC_SUPABASE_URL is not configured."
        );
    }

    // ------------------------------------------------------------
    // Convert file to base64
    // ------------------------------------------------------------

    console.log("mobile: Reading file...");

    const arrayBuffer =
        await file.arrayBuffer();

    const uint8Array =
        new Uint8Array(arrayBuffer);

    let binary = "";

    const chunkSize = 0x8000;

    for (
        let i = 0;
        i < uint8Array.length;
        i += chunkSize
    ) {
        binary += String.fromCharCode(
            ...uint8Array.subarray(
                i,
                Math.min(
                    i + chunkSize,
                    uint8Array.length
                )
            )
        );
    }

    const base64 =
        btoa(binary);

    console.log(
        "mobile: File converted to base64:",
        arrayBuffer.byteLength
    );

    // ------------------------------------------------------------
    // Call Edge Function
    // ------------------------------------------------------------

    const functionUrl =
        `${supabaseUrl}/functions/v1/upload-medical-document`;

    console.log(
        "mobile: Calling upload-medical-document Edge Function..."
    );

    const response =
        await fetch(
            functionUrl,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    apikey:
                        process.env
                            .NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
                },

                body: JSON.stringify({
                    userId,

                    fileName:
                        file.name,

                    mimeType:
                        file.type ||
                        "application/octet-stream",

                    fileSize:
                        file.size,

                    fileBase64:
                        base64,
                }),
            }
        );

    console.log(
        "mobile: Edge Function HTTP status:",
        response.status
    );

    const responseText =
        await response.text();

    console.log(
        "mobile: Edge Function response:",
        responseText
    );

    let responseData: any;

    try {
        responseData =
            JSON.parse(responseText);
    } catch {
        throw new Error(
            `Upload service returned invalid response (${response.status}).`
        );
    }

    if (!response.ok) {

        throw new Error(
            responseData?.error ||
            responseData?.message ||
            `Medical document upload failed (${response.status}).`
        );
    }

    if (
        !responseData?.success ||
        !responseData?.document ||
        !responseData?.document?.id
    ) {

        throw new Error(
            "Upload service did not return a valid document."
        );
    }

    console.log(
        "mobile: DOCUMENT CREATED:",
        responseData.document
    );

    console.log(
        "mobile: Document ID:",
        responseData.document.id
    );

    console.log(
        "mobile: Storage path:",
        responseData.filePath
    );

    console.log(
        "mobile: MEDICAL DOCUMENT UPLOAD SUCCESS"
    );

    return {
        success: true,

        document:
            responseData.document,

        documentId:
            responseData.document.id,

        filePath:
            responseData.filePath,
    };
}