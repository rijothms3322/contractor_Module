"use client";

import { getOCRService } from "@/services/ocr";
import {
    processUploadedMedicalFile
} from "@/lib/medical/processUploadedMedicalFile";
import type { OCRUploaderProps } from "./types";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";

export default function MobileUploader({
    onComplete,
    onError,
    onClear,
}: OCRUploaderProps) {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { user } = useApp();

    if (!user?.id) {
        throw new Error("User is not authenticated.");
    }


    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const cleanup = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setError(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    const processFile = async (selectedFile: File) => {
        // Robust file type detection
        let fileType = selectedFile.type;
        const isPdfByExtension = selectedFile.name.toLowerCase().endsWith('.pdf');

        // If MIME type is not recognised but extension is .pdf, treat as PDF
        if (!fileType.startsWith('image/') && !fileType.includes('pdf') && isPdfByExtension) {
            // Create a new File object with correct type
            selectedFile = new File([selectedFile], selectedFile.name, { type: 'application/pdf' });
            fileType = 'application/pdf';
        }

        // Validate
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        if (!allowedTypes.includes(fileType)) {
            alert("Only image and PDF files are allowed");
            return;
        }

        // Clear previous error
        setError(null);

        // Create preview
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);

        console.log('File selected:', selectedFile.name, 'Type:', fileType, 'URL:', url); // Debug

        setLoading(true);
        setProgress(0);
        try {
            /* -------------------------------- STEP 1 Existing OCR --------------------------------*/
            const ocr = getOCRService();
            const result = await ocr.scan(
                selectedFile,
                (ocrProgress) => {
                    setProgress(Math.round(ocrProgress));
                }
            );
            const ocrText = result?.text?.trim();
            const ocrConfidence = result?.confidence ?? 0;

            if (!ocrText) {
                throw new Error(
                    "Unable to extract readable text from this document. Please upload a clearer image or PDF."
                );
            }

            console.log("OCR Confidence:", ocrConfidence);
            console.log("OCR Text:", ocrText);
            console.log('Calling processUploadedMedicalFile...');
            /* -------------------------------- STEP 2 Upload file + process medical data -------------------------------- */
            const medicalResult =
                await processUploadedMedicalFile(
                    user?.id,
                    selectedFile,
                    ocrText,
                    ocrConfidence
                );
            console.log('processUploadedMedicalFile returned:', medicalResult);
            console.log('processUploadedMedicalFile document Id', medicalResult.documentId)
            console.log('processUploadedMedicalFile document text', medicalResult.ocrText)
            console.log('processUploadedMedicalFile document medicine', medicalResult.result?.data?.medicines)
            console.log('processUploadedMedicalFile document report', medicalResult.result?.data?.report)
            console.log('processUploadedMedicalFile document requires_manual_review', medicalResult.result?.requires_manual_review)
            /* -------------------------------- STEP 3 Send result to parent -------------------------------- */

            onComplete({
                document_id:
                    medicalResult.documentId,

                text:
                    medicalResult.ocrText,

                medicines:
                    medicalResult.result?.data?.medicines ?? [],

                report:
                    medicalResult.result?.data?.report,

                requires_manual_review:
                    medicalResult.result?.requires_manual_review ?? false,
            });
        } catch (err: any) {
            // Keep the preview – just show an error
            const msg = err.message || "OCR failed. Please try again.";
            setError(msg);
            onError?.(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;
        processFile(selectedFile);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleRemove = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setFile(null);
        setPreviewUrl(null);
        console.log(previewUrl, 'pre')
        setLoading(false);
        setProgress(0);
        setError(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        onClear?.();
    };

    return (
        <>
            <div className="space-y-3">
                <div className="relative">
                    <label
                        htmlFor="mobile-file-upload"
                        className={`block w-full cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-colors ${file ? "border-primary" : "border-outline-variant hover:border-primary"
                            }`}
                    >
                        <input
                            ref={inputRef}
                            id="mobile-file-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            onChange={handleFile}
                            disabled={loading}
                            className="hidden"
                        />
                        {loading && (
                            <div className="absolute inset-0 z-20 rounded-xl flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                                <span className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />

                                <span className="mt-2 text-sm font-medium text-white">
                                    Loading...
                                </span>
                            </div>
                        )}

                        {!file ? (
                            <div className="flex items-center justify-center gap-2 p-6 min-h-[80px]">
                                <span className="material-symbols-outlined text-secondary text-3xl">cloud_upload</span>
                                <span className="font-label-md text-sm text-on-surface font-bold">
                                    Upload PDF or Image
                                </span>
                            </div>
                        ) : (
                            <div className="relative w-full aspect-video min-h-[120px] flex items-center justify-center bg-surface-container-low/40">
                                {file.type.startsWith("image/") ? (
                                    <img
                                        src={previewUrl || ""}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-secondary">
                                        <span className="material-symbols-outlined text-5xl">picture_as_pdf</span>
                                        <span className="text-xs font-medium mt-1">{file.name}</span>
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center truncate">
                                    {file.name}
                                </div>
                            </div>
                        )}
                    </label>

                    {file && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsFullscreen(true);
                                }}
                                className="flex justify-center items-center absolute top-2 left-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
                                title="Preview full screen"
                            >
                                <span className="material-symbols-outlined text-sm">zoom_in</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                                className="flex justify-center items-center absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
                                title="Remove file"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </>
                    )}
                </div>

                {error && (
                    <div className="text-red-500 text-xs text-center bg-red-50/10 p-2 rounded-lg border border-red-200/20">
                        ⚠️ {error}
                    </div>
                )}

                {loading && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-on-surface-variant">
                            <span>Processing...</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Full‑screen overlay (same as before) */}
            {isFullscreen && file && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setIsFullscreen(false)}
                >

                    <div
                        className="relative max-w-4xl max-h-full w-full h-full"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {file.type.startsWith("image/") ? (

                            <img
                                src={previewUrl || ""}
                                alt="Medical document"
                                className="max-h-screen max-w-full object-contain rounded-lg shadow-2xl"
                            />

                        ) : (

                            <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-lg">

                                <span className="material-symbols-outlined text-6xl text-red-500">
                                    picture_as_pdf
                                </span>

                                <p className="text-black text-sm mt-2">
                                    {file.name}
                                </p>

                                <button
                                    onClick={() => {
                                        const url =
                                            URL.createObjectURL(file);

                                        window.open(
                                            url,
                                            "_blank"
                                        );
                                    }}
                                    className="mt-4 px-5 py-2 bg-primary text-white rounded-lg"
                                >
                                    Open PDF
                                </button>

                            </div>

                        )}

                        <button
                            onClick={() =>
                                setIsFullscreen(false)
                            }
                            className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white"
                        >
                            <span className="material-symbols-outlined">
                                close
                            </span>
                        </button>

                    </div>

                </div>
            )}
        </>
    );
}