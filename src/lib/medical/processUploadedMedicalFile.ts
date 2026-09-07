import { uploadMedicalDocument } from "./uploadMedicalDocument";
import { processMedicalDocument } from "./processMedicalDocument";
import { supabase } from "../supabaseClient";

export async function processUploadedMedicalFile(
  userId: string,
  file: File,
  ocrText: string,
  ocrConfidence: number
) {
  console.log("================================");
  console.log(
    "mobile: processUploadedMedicalFile started"
  );

  console.log(
    "mobile: User ID:",
    userId
  );

  console.log(
    "mobile: File:",
    file.name,
    file.type,
    file.size
  );

  console.log(
    "mobile: OCR text length:",
    ocrText?.length || 0
  );

  console.log(
    "mobile: OCR confidence:",
    ocrConfidence
  );

  // ============================================================
  // STEP 1 — Upload
  // ============================================================

  console.log(
    "mobile: Calling uploadMedicalDocument..."
  );

  const uploadResult =
    await uploadMedicalDocument(
      file,
      userId
    );

  console.log(
    "mobile: uploadMedicalDocument returned:",
    uploadResult
  );

  if (
    !uploadResult.success ||
    !uploadResult.document?.id
  ) {
    throw new Error(
      "Medical document upload failed"
    );
  }

  const documentId =
    uploadResult.document.id;

  console.log(
    "mobile: DOCUMENT CREATED:",
    documentId
  );

  console.log(
    "mobile: Document row:",
    uploadResult.document
  );

  // ============================================================
  // STEP 2 — Parse
  // ============================================================

  try {
    console.log(
      "mobile: Calling processMedicalDocument..."
    );

    console.log(
      "mobile: Document ID:",
      documentId
    );

    console.log(
      "mobile: OCR text length:",
      ocrText?.length || 0
    );

    console.log(
      "mobile: OCR confidence:",
      ocrConfidence
    );

    console.log(
      "mobile: BEFORE processMedicalDocument"
    );

    const result =
      await processMedicalDocument(
        documentId,
        ocrText,
        ocrConfidence
      );

    console.log(
      "mobile: AFTER processMedicalDocument"
    );

    console.log(
      "mobile: processMedicalDocument returned:",
      result
    );

    console.log(
      "mobile: Medical document processing SUCCESS"
    );

    return {
      document: uploadResult.document,
      documentId,
      ocrText,
      ocrConfidence,
      result,
    };

  } catch (error) {

    console.error(
      "mobile: Medical document processing FAILED:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Processing failed";

    console.log(
      "mobile: Updating document as failed:",
      documentId
    );

    const {
      error: updateError,
    } = await supabase
      .from("documents")
      .update({
        status: "failed",
        needs_review: true,
        error_message: errorMessage,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", documentId);

    if (updateError) {
      console.error(
        "mobile: Failed to update document:",
        updateError
      );
    }

    throw error;
  }
}