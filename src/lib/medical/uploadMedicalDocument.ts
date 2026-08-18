import { supabase } from "../supabaseClient";

export interface MedicalDocumentUploadResult {
    documentId: string;
    filePath: string;
    fileName: string;
    mimeType: string;
}

export async function uploadMedicalDocument(
    file: File
): Promise<MedicalDocumentUploadResult> {

    /* 1. Get logged-in user */

    const {
        data: { user }, error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error(
            "Please login before uploading a medical document."
        );
    }

    /* 2. Validate file */
    if (!file) {
        throw new Error(
            "Please select a file."
        );
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf"
    ];

    if (!allowedTypes.includes(file.type)
    ) {
        throw new Error(
            "Only JPG, PNG, WEBP and PDF files are supported."
        );
    }

    /* 3. Generate unique file path */
    const extension = file.name
        .split(".")
        .pop()
        ?.toLowerCase() ?? "bin";
    const fileName = `${crypto.randomUUID()}.${extension}`;

    /*
        Keep user files separated.

        Example:

        user-id/
            document-id/
                uuid.pdf
    */

    const temporaryDocumentId =
        crypto.randomUUID();

    const filePath = `${user.id}/${temporaryDocumentId}/${fileName}`;

    /* 4. Upload to Storage */
    const {
        data: uploadData,
        error: uploadError
    } = await supabase
        .storage
        .from("medical-documents")
        .upload(filePath, file,
            {
                contentType: file.type,
                cacheControl: "3600",
                upsert: false
            }
        );

    if (uploadError) {
        throw new Error(
            `File upload failed: ${uploadError.message}`
        );
    }

    /* 5. Create documents row */
    const { data: document, error: documentError } =
        await supabase
            .from("documents")
            .insert({
                id: temporaryDocumentId,
                user_id: user.id,
                file_path: uploadData.path,
                file_name: file.name,
                mime_type: file.type,
                status: "uploaded",
                needs_review: false
            })
            .select(
                "id, file_path, file_name, mime_type"
            )
            .single();
    if (documentError) {
        /*
            Important:
            If DB insert fails, remove
            the uploaded file so we
            don't leave orphan files.
        */
        await supabase
            .storage
            .from(
                "medical-documents"
            )
            .remove([
                filePath
            ]);
        throw new Error(
            `Document creation failed: ${documentError.message}`
        );
    }
    /*
        6. Return document information
    */
    return {
        documentId:
            document.id,
        filePath:
            document.file_path,
        fileName:
            document.file_name,
        mimeType:
            document.mime_type
    };
}