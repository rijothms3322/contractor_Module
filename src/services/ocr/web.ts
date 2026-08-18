import Tesseract from "tesseract.js";
import { OCRProvider, OCRResponse } from "./types";

export class WebOCR implements OCRProvider {
  async scan(file: File, onProgress?: (progress: number) => void): Promise<OCRResponse> {
    let imageToProcess: File | Blob = file;

    // If the file is a PDF, convert the first page to an image
    if (file.type === "application/pdf") {
      // Only run on the client (browser)
      if (typeof window !== "undefined") {
        // Dynamic import to avoid loading pdf.js on the server
        const { pdfToImages } = await import("./pdf");
        try {
          const images = await pdfToImages(file);
          if (images.length === 0) {
            throw new Error("No pages extracted from PDF.");
          }
          imageToProcess = images[0]; // Use first page
        } catch (pdfError: any) {
          throw new Error(`Failed to convert PDF to image: ${pdfError.message}`);
        }
      } else {
        throw new Error("PDF conversion is only supported in the browser.");
      }
    }

    const result = await Tesseract.recognize(imageToProcess, "eng", {
      logger: (info) => {
        console.log(info.status,info.progress, 'progress')
        console.log(info, 'info')
        if (
          info.status === "recognizing text" &&
          typeof info.progress === "number"
        ) {

          onProgress?.(
            info.progress * 100
          );

        }

      },
    });
    console.log(result, 'result')
    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  }
}