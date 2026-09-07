import { supabase } from "../supabaseClient";

export async function processMedicalDocument(
  documentId: string,
  ocrText: string,
  ocrConfidence: number
) {
  console.log("====================================");
  console.log("mobile: PROCESS MEDICAL DOCUMENT START");
  console.log("mobile: Document ID:", documentId);
  console.log("mobile: OCR length:", ocrText?.length || 0);
  console.log("mobile: OCR confidence:", ocrConfidence);

  const url =
    "https://iiwpgxlcriadytjuvbyq.supabase.co/functions/v1/parse-medical-data";

  const payload = {
    document_id: documentId,
    ocr_text: ocrText,
    ocr_confidence: ocrConfidence,
  };

  console.log(
    "mobile: Preparing direct parse-medical-data request"
  );

  console.log(
    "mobile: URL:",
    url
  );

  console.log(
    "mobile: Payload:",
    JSON.stringify({
      document_id: documentId,
      ocr_text_length: ocrText.length,
      ocr_confidence: ocrConfidence,
    })
  );

  console.log(
    "mobile: BEFORE direct fetch"
  );

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(
      "mobile: AFTER direct fetch"
    );

    console.log(
      "mobile: parse-medical-data HTTP status:",
      response.status
    );

    const responseText = await response.text();

    console.log(
      "mobile: parse-medical-data raw response:",
      responseText
    );

    let data: any = null;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(
        "mobile: parse-medical-data response is not JSON"
      );
    }

    if (!response.ok) {
      throw new Error(
        `parse-medical-data HTTP ${response.status}: ${
          data?.error || responseText
        }`
      );
    }

    if (!data) {
      throw new Error(
        "parse-medical-data returned empty response"
      );
    }

    if (data.success === false) {
      throw new Error(
        data.error ||
        "parse-medical-data failed"
      );
    }

    console.log(
      "mobile: PROCESS MEDICAL DOCUMENT SUCCESS"
    );

    return data;

  } catch (error) {

    console.error(
      "mobile: parse-medical-data request FAILED:",
      error
    );

    throw error;
  }
}