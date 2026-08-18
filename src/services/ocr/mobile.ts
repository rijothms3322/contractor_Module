import { createWorker } from "tesseract.js";
import { OCRProvider, OCRResponse } from "./types";

export class MobileOCR implements OCRProvider {
    async scan(file: File, onProgress?: (progress: number) => void): Promise<OCRResponse> {
        let imageToProcess: File | Blob = file;

        // If the file is a PDF, convert the first page to an image
        if (file.type === "application/pdf") {
            // Dynamic import so pdfjs-dist is loaded only on demand
            const { pdfToImages } = await import("./pdf");
            try {
                const images = await pdfToImages(file);
                if (images.length === 0) {
                    throw new Error("No pages extracted from PDF.");
                }
                // Use the first page (or you can combine all pages)
                imageToProcess = images[0];
            } catch (pdfError: any) {
                throw new Error(`PDF conversion failed: ${pdfError.message}`);
            }
        }

        const worker = await createWorker("eng", 1, {
            logger: (info) => {
                console.log(
                    info.status,
                    info.progress,
                    "progress"
                );

                console.log(info, "info");

                if (
                    info.status === "recognizing text" &&
                    typeof info.progress === "number"
                ) {
                    const ocrProgress = info.progress * 100;

                    onProgress?.(ocrProgress);
                }
            },
        });

        try {
            const result = await worker.recognize(
                imageToProcess
            );

            const text = result.data.text;
            const confidence = result.data.confidence;

            console.log("OCR Confidence:", confidence);
            console.log("OCR Text:", text);

            return {
                text,
                confidence,
            };
        } finally {
            await worker.terminate();
        }
    }
}