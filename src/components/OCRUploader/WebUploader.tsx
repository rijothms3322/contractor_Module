"use client";

import { useState, useEffect, useRef } from "react";
import { getOCRService } from "@/services/ocr";
import { parseOCRText } from "@/services/ocr/parser";
import type { OCRUploaderProps } from "./types";
import { processUploadedMedicalFile } from "@/lib/medical/processUploadedMedicalFile";
import { useApp } from "@/context/AppContext";

const STATIC_MEDICINES = [
    {
        user_id: "e77f78e3-c089-4179-85e1-9aefac9191d3",
        document_id: "07941932-6179-49f6-9c2c-38f4e88ac7b7",
        medicine_master_id: null,
        medicine_name: "ABCDAMAS",
        dosage: "1 Morning",
        frequency: null,
        duration: "8 Days",
        instructions: "Total: 8 Tab",
        confidence: 95,
        needs_review: true,
    },
    {
        user_id: "e77f78e3-c089-4179-85e1-9aefac9191d3",
        document_id: "07941932-6179-49f6-9c2c-38f4e88ac7b7",
        medicine_master_id: null,
        medicine_name: "vomAST",
        dosage: "1 Morning, 1 Night",
        frequency: null,
        duration: "8 Days",
        instructions: "After Food",
        confidence: 85,
        needs_review: true,
    },
    {
        user_id: "e77f78e3-c089-4179-85e1-9aefac9191d3",
        document_id: "07941932-6179-49f6-9c2c-38f4e88ac7b7",
        medicine_master_id: null,
        medicine_name: "ZOCUAR 500",
        dosage: "1 Morning",
        frequency: null,
        duration: "3 Days",
        instructions: null,
        confidence: 80,
        needs_review: true,
    },
    {
        user_id: "e77f78e3-c089-4179-85e1-9aefac9191d3",
        document_id: "07941932-6179-49f6-9c2c-38f4e88ac7b7",
        medicine_master_id: null,
        medicine_name: "GESTAKIND 10/58",
        dosage: "1 Night",
        frequency: null,
        duration: "8 Days",
        instructions: null,
        confidence: 85,
        needs_review: true,
    },
];

const STATIC_REPORT = {
    category: "lab_report",
    confidence: 90,
    diagnosis: "Neutrophilia",
    doctor_name: "Dr. Dogar",
    hospital_name: "Shah Latif Pathology Lab",
    notes: "Comments: film shows high Neutrophilia",
    results: [
        {
            "test_name": "Haemoglobin",
            "value_text": "12.5",
            "confidence": 80,
            "abnormal_flag": "NORMAL",
            "reference_high": 14,
            "reference_low": 11,
            "reference_range": "11.0-14.0",
            "unit": "g/dl",
            "value_numeric": 12.5
        },
        {
            "test_name": "PCV (HCT)",
            "value_text": "38",
            "confidence": 95,
            "abnormal_flag": "NORMAL",
            "reference_high": 40,
            "reference_low": 35,
            "reference_range": "35-40",
            "unit": "%",
            "value_numeric": 38
        },
        {
            "test_name": "WBC(TLC)",
            "value_text": "5.8",
            "confidence": 80,
            "abnormal_flag": "NORMAL",
            "reference_high": 13.5,
            "reference_low": 4.5,
            "reference_range": "4.5-13.5",
            "unit": "X10^9/L",
            "value_numeric": 5.8
        },
        {
            "test_name": "Lymphocytes",
            "value_text": "24",
            "confidence": 90,
            "abnormal_flag": "UNKNOWN",
            "value_numeric": 24
        },
        {
            "test_name": "Platelet Count",
            "value_text": "266",
            "confidence": 90,
            "abnormal_flag": "NORMAL",
            "reference_high": 450,
            "reference_low": 150,
            "reference_range": "150-450",
            "value_numeric": 266
        },
        {
            "test_name": "Malaria",
            "value_text": "Negative",
            "confidence": 85,
            "abnormal_flag": "NORMAL"
        }
    ],
    title: "BLOOD COMPLETE PICTURE"
};


export default function WebUploader({
    onComplete,
    onError,
    onClear, 
}: OCRUploaderProps) {
    const [loading, setLoading] = useState(false);
    console.log(loading, 'loading')
    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
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

    const handleFile = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile =
            event.target.files?.[0];

        if (!selectedFile) return;
        setProgress(0);

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            alert("Only image and PDF files are allowed");
            return;
        }
        setProgress(0);

        // -------------------------
        // Set preview/file FIRST
        // -------------------------

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setFile(selectedFile);

        if (selectedFile.type.startsWith("image/")) {
            setPreviewUrl(
                URL.createObjectURL(selectedFile)
            );
        } else {
            // PDF ke liye image preview nahi hai
            setPreviewUrl(null);
        }

        // -------------------------
        // Processing
        // -------------------------

        try {
            setLoading(true);
            const ocr = getOCRService();

            const result = await ocr.scan(
                selectedFile,
                (ocrProgress) => {
                    const overallProgress = ocrProgress;

                    setProgress(
                        Math.round(overallProgress)
                    );
                }
            );

            const ocrText =
                result?.text?.trim();

            const ocrConfidence =
                result?.confidence ?? 0;

            if (!ocrText) {
                throw new Error(
                    "Unable to extract readable text from this document."
                );
            }

            console.log("OCR Confidence:", ocrConfidence);
            console.log("OCR Text:", ocrText);
            console.log('Calling processUploadedMedicalFile...');
            const medicalResult =
                await processUploadedMedicalFile(
                    user?.id,
                    selectedFile,
                    ocrText,
                    ocrConfidence
                );
            console.log('processUploadedMedicalFile returned:', medicalResult);

            // onComplete({
            //     document_id: "static-doc-id",
            //     text: ocrText,
            //     medicines: STATIC_MEDICINES,
            //     report: STATIC_REPORT,
            //     requires_manual_review: false,
            // });
            onComplete({
                document_id: medicalResult.documentId,
                text: medicalResult.ocrText,

                medicines: medicalResult.result
                    ?.data
                    ?.medicines ?? [],

                report: medicalResult.result
                    ?.data
                    ?.report,

                requires_manual_review: medicalResult.result
                    ?.requires_manual_review
                    ?? false,
            });
        } catch (error: unknown) {
            console.error("ERROR in WebUploader:", error);
            console.log(error, 'document processing')
            console.error(
                "Medical document processing error:",
                error
            );

            onError?.(
                error instanceof Error
                    ? error
                    : new Error(
                        "Medical document processing failed."
                    )
            );
        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // REMOVE FILE
    // ========================================

    const handleRemove = () => {

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setLoading(false)
        setProgress(0)
        setFile(null);
        setPreviewUrl(null);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
        onClear?.();
    };


    return (
        <>
            <div className="space-y-3">
                {/* Upload area */}
                <div className="relative">
                    <label
                        htmlFor="file-upload"
                        className={`block w-full cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-colors ${file ? "border-primary" : "border-outline-variant hover:border-primary"
                            }`}
                    >
                        <input
                            ref={inputRef}
                            id="file-upload"
                            type="file"
                            accept="image/*,.pdf"
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
                            <div className="flex items-center justify-center gap-2 p-6">
                                <span className="material-symbols-outlined text-secondary text-3xl">cloud_upload</span>
                                <span className="font-label-md text-sm text-on-surface font-bold">
                                    Upload PDF or Image
                                </span>
                            </div>
                        ) : (
                            <div className="relative w-full aspect-video min-h-30 flex items-center justify-center bg-surface-container-low/40">
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
                                {/* File name overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center truncate">
                                    {file.name}
                                </div>
                            </div>
                        )}
                    </label>

                    {/* Action buttons inside the area */}
                    {file && (
                        <>
                            {/* Preview button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsFullscreen(true);
                                }}
                                className="flex justify-center items-center absolute top-2 left-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
                                title="Preview full screen"
                            >
                                <span className="material-symbols-outlined text-sm">zoom_in</span>
                            </button>
                            {/* Remove button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                                className="flex justify-center items-center absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
                                title="Remove file"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Progress bar */}
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

            {/* Full‑screen overlay (triggered by preview button only) */}
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