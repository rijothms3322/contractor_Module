import { uploadMedicalDocument } from "./uploadMedicalDocument";
import { processMedicalDocument } from "./processMedicalDocument";
import { supabase } from "../supabaseClient";

export async function processUploadedMedicalFile(
    file: File,
    ocrText: string,
    ocrConfidence: number
) {

    /* STEP 1 Upload file + create documents row */
    console.log('processUploadedMedicalFile started');
    const document = await uploadMedicalDocument(file);
    console.log('Document uploaded:', document);
    try {
        /* STEP 2 OCR already happened in WebUploader. Send OCR text + confidence to Edge Function. */
        console.log('Calling processMedicalDocument...');
        const result = await processMedicalDocument(
            document.documentId,
            ocrText,
            ocrConfidence
        );
        console.log('processMedicalDocument returned:', result);

        /* STEP 3 Return everything */
        return {
            document,
            ocrText,
            ocrConfidence,
            result
        };

    } catch (error) {

        /*
            Processing failed after upload.
            Keep document in Supabase
            for manual review.
        */
        console.log('test', error)
        await supabase
            .from("documents")
            .update({
                status: "failed",
                needs_review: true,
                error_message:
                    error instanceof Error
                        ? error.message
                        : "Processing failed",
                updated_at:
                    new Date().toISOString()
            })
            .eq(
                "id",
                document.documentId
            );

        throw error;
    }
}