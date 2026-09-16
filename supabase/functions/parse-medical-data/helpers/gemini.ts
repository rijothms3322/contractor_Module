/// <reference lib="deno.ns" />

export interface MedicalExtractionResult {
    medicines: Array<{
        name: string;
        dosage?: string;
        frequency?: string;
        duration?: string;
        instructions?: string;
        confidence?: number;
    }>;

    report: {
        category?:
            | "lab_report"
            | "medical_report"
            | "discharge_summary"
            | "radiology"
            | "pathology"
            | "other";

        title?: string;
        diagnosis?: string;
        doctor_name?: string;
        hospital_name?: string;
        notes?: string;
        confidence?: number;

        results?: Array<{
            test_name: string;
            value_text?: string;
            value_numeric?: number;
            unit?: string;
            reference_range?: string;
            reference_low?: number;
            reference_high?: number;

            abnormal_flag?:
                | "HIGH"
                | "LOW"
                | "NORMAL"
                | "CRITICAL"
                | "UNKNOWN";

            confidence?: number;
        }>;
    };
}

/*
 * IMPORTANT:
 *
 * Use a model that is actually available to your
 * Google AI API key.
 *
 * If you have already tested 2.5-flash-lite,
 * keep this model.
 */
const GEMINI_MODEL = "gemini-3.5-flash-lite";

const GEMINI_TIMEOUT_MS = 30_000;

export async function extractMedicalData(
    ocrText: string
): Promise<MedicalExtractionResult> {

    console.log("================================");
    console.log("GEMINI EXTRACTION START");

    /*
     * Validate OCR
     */

    if (!ocrText || !ocrText.trim()) {
        throw new Error("OCR text is empty.");
    }

    const cleanedOCRText = ocrText.trim();

    console.log(
        "Gemini OCR text length:",
        cleanedOCRText.length
    );

    /*
     * API key
     */

    const apiKey = Deno.env.get("GOOGLE_AI_KEY");

    if (!apiKey) {
        throw new Error(
            "GOOGLE_AI_KEY is not configured in Supabase Edge Function secrets."
        );
    }

    /*
     * Prompt
     */

    const prompt = `
You are a medical document data extraction assistant.

Extract ONLY information explicitly present in the OCR text.

Do NOT:
- provide medical advice
- diagnose the patient
- interpret laboratory results
- invent information
- guess unclear medicines
- guess laboratory values
- calculate values
- create missing reference ranges
- invent doctors or hospitals

If information is missing, use null where allowed or an empty array.

MEDICINES:

Extract a medicine only if it is actually present.

For each medicine extract:

- name
- dosage
- frequency
- duration
- instructions
- confidence

Never guess an unclear medicine name.

REPORT:

Identify the document category when possible.

Allowed categories:

lab_report
medical_report
discharge_summary
radiology
pathology
other

For laboratory results extract:

- test_name
- value_text
- value_numeric when clearly readable
- unit when explicitly present
- reference_range when explicitly present
- reference_low when explicitly present
- reference_high when explicitly present
- abnormal_flag
- confidence

Allowed abnormal_flag values:

HIGH
LOW
NORMAL
CRITICAL
UNKNOWN

If the document does not explicitly state the abnormal status,
use UNKNOWN.

CONFIDENCE:

100 = completely clear
90-99 = very clear
70-89 = reasonably clear
50-69 = uncertain
0-49 = very unclear

OCR TEXT:

${cleanedOCRText}
`;

    const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    console.log(
        "Gemini model:",
        GEMINI_MODEL
    );

    console.log(
        "Calling Gemini..."
    );

    /*
     * Timeout
     */

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
        console.error(
            "Gemini request timed out."
        );

        controller.abort();
    }, GEMINI_TIMEOUT_MS);

    let response: Response;

    try {

        response = await fetch(
            url,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey,
                },

                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",

                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],

                    generationConfig: {
                        temperature: 0,

                        responseMimeType:
                            "application/json",

                        responseSchema: {
                            type: "OBJECT",

                            properties: {
                                medicines: {
                                    type: "ARRAY",

                                    items: {
                                        type: "OBJECT",

                                        properties: {
                                            name: {
                                                type: "STRING",
                                            },

                                            dosage: {
                                                type: "STRING",
                                            },

                                            frequency: {
                                                type: "STRING",
                                            },

                                            duration: {
                                                type: "STRING",
                                            },

                                            instructions: {
                                                type: "STRING",
                                            },

                                            confidence: {
                                                type: "NUMBER",
                                            },
                                        },

                                        required: [
                                            "name",
                                            "confidence",
                                        ],
                                    },
                                },

                                report: {
                                    type: "OBJECT",

                                    properties: {
                                        category: {
                                            type: "STRING",

                                            enum: [
                                                "lab_report",
                                                "medical_report",
                                                "discharge_summary",
                                                "radiology",
                                                "pathology",
                                                "other",
                                            ],
                                        },

                                        title: {
                                            type: "STRING",
                                        },

                                        diagnosis: {
                                            type: "STRING",
                                        },

                                        doctor_name: {
                                            type: "STRING",
                                        },

                                        hospital_name: {
                                            type: "STRING",
                                        },

                                        notes: {
                                            type: "STRING",
                                        },

                                        confidence: {
                                            type: "NUMBER",
                                        },

                                        results: {
                                            type: "ARRAY",

                                            items: {
                                                type: "OBJECT",

                                                properties: {
                                                    test_name: {
                                                        type: "STRING",
                                                    },

                                                    value_text: {
                                                        type: "STRING",
                                                    },

                                                    value_numeric: {
                                                        type: "NUMBER",
                                                    },

                                                    unit: {
                                                        type: "STRING",
                                                    },

                                                    reference_range: {
                                                        type: "STRING",
                                                    },

                                                    reference_low: {
                                                        type: "NUMBER",
                                                    },

                                                    reference_high: {
                                                        type: "NUMBER",
                                                    },

                                                    abnormal_flag: {
                                                        type: "STRING",

                                                        enum: [
                                                            "HIGH",
                                                            "LOW",
                                                            "NORMAL",
                                                            "CRITICAL",
                                                            "UNKNOWN",
                                                        ],
                                                    },

                                                    confidence: {
                                                        type: "NUMBER",
                                                    },
                                                },

                                                required: [
                                                    "test_name",
                                                    "value_text",
                                                    "confidence",
                                                ],
                                            },
                                        },
                                    },

                                    required: [
                                        "category",
                                        "confidence",
                                    ],
                                },
                            },

                            required: [
                                "medicines",
                                "report",
                            ],
                        },
                    },
                }),

                signal: controller.signal,
            }
        );

    } catch (error) {

        if (
            error instanceof DOMException &&
            error.name === "AbortError"
        ) {
            throw new Error(
                `Gemini request timed out after ${GEMINI_TIMEOUT_MS / 1000} seconds.`
            );
        }

        throw new Error(
            `Gemini network request failed: ${
                error instanceof Error
                    ? error.message
                    : String(error)
            }`
        );

    } finally {

        clearTimeout(timeoutId);

    }

    console.log(
        "Gemini HTTP status:",
        response.status
    );

    /*
     * Read response body ONCE.
     */

    const responseText =
        await response.text();

    console.log(
        "Gemini response length:",
        responseText.length
    );

    /*
     * Gemini API error
     */

    if (!response.ok) {

        console.error(
            "Gemini API error:",
            responseText
        );

        throw new Error(
            `Gemini API error (${response.status}): ${responseText}`
        );
    }

    /*
     * Parse Gemini HTTP response
     */

    let result: any;

    try {

        result =
            JSON.parse(responseText);

    } catch {

        console.error(
            "Gemini returned non-JSON HTTP response:",
            responseText
        );

        throw new Error(
            "Gemini returned an invalid HTTP response."
        );
    }

    /*
     * Extract generated text
     */

    const content =
        result
            ?.candidates?.[0]
            ?.content?.parts
            ?.find(
                (part: unknown) =>
                    typeof (part as { text?: unknown })?.text ===
                    "string"
            )
            ?.text;

    if (!content) {

        console.error(
            "Unexpected Gemini response:",
            JSON.stringify(result)
        );

        throw new Error(
            "Gemini returned an empty response."
        );
    }

    console.log(
        "Gemini generated text length:",
        content.length
    );

    /*
     * Parse generated JSON
     */

    let parsed: MedicalExtractionResult;

    try {

        parsed =
            JSON.parse(content);

    } catch {

        console.error(
            "Gemini returned invalid generated JSON:",
            content
        );

        throw new Error(
            "Gemini returned invalid JSON."
        );
    }

    /*
     * Normalize medicines
     */

    if (!Array.isArray(parsed.medicines)) {
        parsed.medicines = [];
    }

    /*
     * Normalize report
     */

    if (
        !parsed.report ||
        typeof parsed.report !== "object"
    ) {

        parsed.report = {
            category: "other",
            confidence: 0,
            results: [],
        };

    }

    /*
     * Normalize report results
     */

    if (
        !Array.isArray(
            parsed.report.results
        )
    ) {

        parsed.report.results = [];
    }

    console.log(
        "Gemini medicines:",
        parsed.medicines.length
    );

    console.log(
        "Gemini report category:",
        parsed.report.category
    );

    console.log(
        "Gemini report results:",
        parsed.report.results.length
    );

    console.log(
        "GEMINI EXTRACTION SUCCESS"
    );

    return parsed;
}