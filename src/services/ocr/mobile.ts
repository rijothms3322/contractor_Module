import { Filesystem, Directory } from "@capacitor/filesystem";
import {
    TextRecognition,
    Script,
} from "@capacitor-mlkit/text-recognition";

import { OCRProvider, OCRResponse } from "./types";

export class MobileOCR implements OCRProvider {
    async scan(
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<OCRResponse> {
        try {
            onProgress?.(5);

            let images: Blob[] = [];

            // ---------------------------------------------------------
            // STEP 1: Convert input into images
            // ---------------------------------------------------------

            if (file.type === "application/pdf") {
                const { pdfToImages } = await import("./pdf");

                try {
                    images = await pdfToImages(file);

                    if (images.length === 0) {
                        throw new Error("No pages extracted from PDF.");
                    }
                } catch (pdfError: any) {
                    throw new Error(
                        `PDF conversion failed: ${pdfError.message}`
                    );
                }
            } else {
                images = [file];
            }

            // ---------------------------------------------------------
            // STEP 2: OCR every image/page using Google ML Kit
            // ---------------------------------------------------------

            const extractedTexts: string[] = [];

            for (let i = 0; i < images.length; i++) {
                const image = images[i];

                const progressStart = 10 + (i / images.length) * 80;
                onProgress?.(Math.round(progressStart));

                // Convert Blob/File → base64
                const arrayBuffer = await image.arrayBuffer();

                const bytes = new Uint8Array(arrayBuffer);

                let binary = "";

                const chunkSize = 0x8000;

                for (
                    let offset = 0;
                    offset < bytes.length;
                    offset += chunkSize
                ) {
                    const chunk = bytes.subarray(
                        offset,
                        Math.min(offset + chunkSize, bytes.length)
                    );

                    binary += String.fromCharCode(...chunk);
                }

                const base64Data = btoa(binary);

                // -----------------------------------------------------
                // STEP 3: Save image to native filesystem
                // -----------------------------------------------------

                const fileName = `ocr_${Date.now()}_${i}.png`;

                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache,
                });

                if (!savedFile.uri) {
                    throw new Error(
                        "Unable to create local image file for OCR."
                    );
                }

                // -----------------------------------------------------
                // STEP 4: Google ML Kit OCR
                // -----------------------------------------------------

                const result = await TextRecognition.processImage({
                    path: savedFile.uri,
                    script: Script.Latin,
                });

                console.log(
                    `ML Kit OCR page ${i + 1}:`,
                    result.text
                );

                extractedTexts.push(result.text);

                // -----------------------------------------------------
                // STEP 5: Cleanup temporary file
                // -----------------------------------------------------

                try {
                    await Filesystem.deleteFile({
                        path: fileName,
                        directory: Directory.Cache,
                    });
                } catch (cleanupError) {
                    console.warn(
                        "Failed to cleanup OCR temporary file:",
                        cleanupError
                    );
                }

                const progressEnd =
                    10 + ((i + 1) / images.length) * 80;

                onProgress?.(Math.round(progressEnd));
            }

            // ---------------------------------------------------------
            // STEP 6: Combine all pages
            // ---------------------------------------------------------

            const text = extractedTexts
                .filter(Boolean)
                .join("\n\n");

            if (!text.trim()) {
                throw new Error(
                    "Unable to extract readable text from this document."
                );
            }

            // ML Kit does not return the same overall confidence value
            // that Tesseract provides.
            const confidence = 0;

            console.log("ML Kit OCR Confidence:", confidence);
            console.log("ML Kit OCR Text:", text);

            onProgress?.(100);

            // ---------------------------------------------------------
            // SAME OCRResponse STRUCTURE AS BEFORE
            // ---------------------------------------------------------

            return {
                text,
                confidence,
            };
        } catch (error: any) {
            console.error("ML Kit OCR failed:", error);

            throw new Error(
                error?.message ||
                    "OCR failed. Please try again."
            );
        }
    }
}