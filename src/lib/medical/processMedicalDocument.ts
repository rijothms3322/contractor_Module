import { supabase } from "../supabaseClient";

export interface ProcessMedicalDocumentResponse {
    success: boolean;
    document_id: string;
    requires_manual_review: boolean;
    data?: { medicines: any[]; report: any; };
    message?: string;
    reason?: string;
}

export async function processMedicalDocument(
    documentId: string,
    ocrText: string,
    ocrConfidence: number,
): Promise<ProcessMedicalDocumentResponse> {
    if (!documentId) {
        throw new Error(
            "Document ID is required."
        );
    }
    if (!ocrText || !ocrText.trim()) {
        throw new Error(
            "OCR text is empty."
        );
    }

    /* OCR confidence should always be a valid number. */

    const confidence = Number.isFinite(ocrConfidence) ? ocrConfidence : 0;

    /* Call Supabase Edge Function  */
    console.log('Invoking Edge Function with:', { documentId, ocrTextLength: ocrText.length, ocrConfidence });
    const { data, error } = await supabase.functions.invoke("parse-medical-data",
        {
            body: {
                document_id: documentId,
                ocr_text: ocrText,
                ocr_confidence: confidence
            }
        }
    );
    console.log('Edge Function response:', { data, error });

    console.log(data, 'data')

    /* Edge Function / network error */

    // if (error) {
    //     console.error("process-medical-document error:",
    //         error
    //     );


    //     throw new Error(
    //         error.message ||
    //         "Medical document processing failed."
    //     );

    // }


    if (error) {
        console.error("EDGE FUNCTION ERROR");
        console.error("Error:", error);
        console.error("Name:", error.name);
        console.error("Message:", error.message);
        console.error("Cause:", error.cause);
        console.error("Context:", "context" in error ? error.context : null);

        throw error;
    }


    /*
        OCR quality failure
        Our Edge Function returns
        HTTP 422 for this.
    */

    if (data?.success === false) {
        console.log('call')
        return data;
    }

    return data;

}