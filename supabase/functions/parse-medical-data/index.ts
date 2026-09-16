/// <reference lib="deno.ns" />

import {
    getServiceSupabaseClient
} from "../_shared/supabase.ts";

import {
    extractMedicalData
} from "./helpers/gemini.ts";

import {
    findMedicineMatch
} from "./helpers/medicine.ts";

import {
    validateOCRText
} from "./helpers/validator.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods":
        "POST, OPTIONS",
};

/*
 * JSON response helper
 */
const jsonResponse = (
    data: unknown,
    status = 200
) => {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
            },
        }
    );
};




Deno.serve(async (req) => {

        console.log("====================================");
    console.log("PARSE MEDICAL DATA FUNCTION START");
    console.log("Method:", req.method);
    console.log(
        "Authorization present:",
        !!req.headers.get("authorization")
    );
    console.log(
        "Apikey present:",
        !!req.headers.get("apikey")
    );

    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: corsHeaders,
        });
    }
    try {

        /*
            Supabase client
        */

        const supabase =
            getServiceSupabaseClient(req);


        /*
            Check user login
        */

        // const {
        //     data: {
        //         user
        //     },
        //     error: userError
        // } =
        //     await supabase.auth.getUser();


        // if (
        //     userError ||
        //     !user
        // ) {

        // return jsonResponse(
        //     {
        //         error: "Unauthorized"
        //     },
        //     401
        // );

        // }


        /*
            Request body
        */

        const body =
            await req.json();


        const {
            document_id,
            ocr_text,
            ocr_confidence
        } = body;


        if (
            !document_id ||
            !ocr_text
        ) {

            return jsonResponse(
                {
                    error:
                        "document_id and ocr_text required"
                },
                400
            );

        }


        /*
            Verify document belongs
            to logged-in user
        */

        const {
    data: document,
    error: documentError
} =
    await supabase
        .from("documents")
        .select(`
            id,
            user_id,
            file_path,
            file_name,
            mime_type,
            document_type
        `)
        .eq("id", document_id)
        .single();

if (documentError || !document) {
    return jsonResponse(
        {
            error: "Document not found"
        },
        404
    );
}

const userId = document.user_id;


        // if (
        //     documentError ||
        //     !document
        // ) {
        //     return jsonResponse(
        //         {
        //             error:
        //                 "Document not found or access denied"
        //         },
        //         404
        //     );

        // }


        /*
            Validate OCR quality
        */

        const validation =
            validateOCRText(
                ocr_text
            );

console.log(
    "OCR VALIDATION:",
    JSON.stringify({
        document_id,
        input_length: ocr_text.length,
        supplied_ocr_confidence: body.ocr_confidence ?? null,
        validation,
    })
);

        if (
            !validation.valid
        ) {

            await supabase

                .from("documents")

                .update({

                    status:
                        "failed",

                    needs_review:
                        true,

                    ocr_confidence:
                        validation.confidence,

                    error_message:
                        validation.reason,

                    updated_at:
                        new Date().toISOString()

                })

                .eq(
                    "id",
                    document_id
                );


            return jsonResponse(
                {
                    success: false,

                    requires_manual_review:
                        true,

                    document_id,

                    ocr_confidence:
                        validation.confidence,

                    message:
                        validation.reason,

                    reason:
                        validation.reason
                },
                422
            );

        }


        /*
            Mark document as processing
        */

        const {
            error: processingError
        } =
            await supabase

                .from("documents")

                .update({

                    status:
                        "processing",

                    ocr_text,

                    ocr_confidence:
                        validation.confidence,

                    error_message:
                        null,

                    updated_at:
                        new Date().toISOString()

                })

                .eq(
                    "id",
                    document_id
                );


        if (processingError) {

            throw new Error(
                `Unable to update document: ${processingError.message}`
            );

        }


        /*
            AI extraction
        */

        const extracted =
            await extractMedicalData(
                ocr_text
            );


        /*
            Match medicines
        */

        const medicines: any[] = [];


        for (
            const medicine
            of extracted.medicines ?? []
        ) {

            const match =
                await findMedicineMatch(
                    supabase,
                    medicine.name
                );


            const medicineConfidence =
                medicine.confidence ?? 0;


            medicines.push({

                user_id:
                    userId,

                document_id,

                medicine_master_id:
                    match.medicine_master_id,

                medicine_name:
                    medicine.name,

                dosage:
                    medicine.dosage ??
                    null,

                frequency:
                    medicine.frequency ??
                    null,

                duration:
                    medicine.duration ??
                    null,

                instructions:
                    medicine.instructions ??
                    null,

                confidence:
                    medicineConfidence,

                needs_review:
                    !match.match_found ||
                    medicineConfidence < 70

            });

        }


        /*
            Insert medicines
        */

        if (
            medicines.length > 0
        ) {

            const {
                error: medicineError
            } =
                await supabase

                    .from(
                        "prescription_medicines"
                    )

                    .insert(
                        medicines
                    );


            if (medicineError) {

                throw new Error(
                    `Medicine save failed: ${medicineError.message}`
                );

            }

        }


        /*
            Save medical report
        */

        const report =
            extracted.report;


        let medicalReportId:
            string | null = null;


        // if (report) {

        //     const {
        //         data: medicalReport,
        //         error: reportError
        //     } =
        //         await supabase

        //             .from(
        //                 "medical_reports"
        //             )

        //             .upsert({

        //                 document_id,

        //                 user_id:
        //                     userId,

        //                 report_category:
        //                     report.category ??
        //                     "other",

        //                 report_title:
        //                     report.title ??
        //                     null,

        //                 doctor_name:
        //                     report.doctor_name ??
        //                     null,

        //                 hospital_name:
        //                     report.hospital_name ??
        //                     null,

        //                 diagnosis:
        //                     report.diagnosis ??
        //                     null,

        //                 notes:
        //                     report.notes ??
        //                     null,

        //                 ai_result:
        //                     report,

        //                 ai_confidence:
        //                     report.confidence ??
        //                     null,

        //                 needs_review:
        //                     false,

        //                 manually_updated:
        //                     false,

        //                 updated_at:
        //                     new Date().toISOString()

        //             })

        //             .select("id")

        //             .single();


        //     if (reportError) {

        //         throw new Error(
        //             `Medical report save failed: ${reportError.message}`
        //         );

        //     }


        //     medicalReportId =
        //         medicalReport.id;


        //     /*
        //         Save laboratory results
        //     */

        //     if (
        //         report.results &&
        //         report.results.length > 0
        //     ) {

        //         const results =
        //             report.results.map(
        //                 result => ({

        //                     report_id:
        //                         medicalReportId,

        //                     test_name:
        //                         result.test_name,

        //                     value_text:
        //                         result.value_text ??
        //                         null,

        //                     value_numeric:
        //                         result.value_numeric ??
        //                         null,

        //                     unit:
        //                         result.unit ??
        //                         null,

        //                     reference_range:
        //                         result.reference_range ??
        //                         null,

        //                     reference_low:
        //                         result.reference_low ??
        //                         null,

        //                     reference_high:
        //                         result.reference_high ??
        //                         null,

        //                     abnormal_flag:
        //                         result.abnormal_flag ??
        //                         "UNKNOWN",

        //                     ai_confidence:
        //                         result.confidence ??
        //                         0,

        //                     ai_result:
        //                         result,

        //                     manually_updated:
        //                         false

        //                 })
        //             );


        //         // const {
        //         //     error: resultError
        //         // } =
        //         //     await supabase

        //         //         .from(
        //         //             "medical_report_results"
        //         //         )

        //         //         .insert(
        //         //             results
        //         //         );


        //         // if (resultError) {

        //         //     throw new Error(
        //         //         `Medical report results save failed: ${resultError.message}`
        //         //     );

        //         // }

        //     }

        // }


        /*
            Determine whether
            manual review is required
        */

        const medicinesNeedReview =
            medicines.some(
                medicine =>
                    medicine.needs_review === true
            );


        const reportNeedReview =
            report?.results?.some(
                result =>
                    (result.confidence ?? 0) < 70
            ) ?? false;


        const reportConfidenceLow =
            report?.confidence !== undefined &&
            report.confidence < 70;


        const needsReview =
            medicinesNeedReview ||
            reportNeedReview ||
            reportConfidenceLow;


        /*
            Complete document
        */

        const {
            error: completeError
        } =
            await supabase

                .from("documents")

                .update({

                    status:
                        "completed",

                    needs_review:
                        needsReview,

                    updated_at:
                        new Date().toISOString()

                })

                .eq(
                    "id",
                    document_id
                );


        if (completeError) {

            throw new Error(
                `Document completion failed: ${completeError.message}`
            );

        }


        /*
            Final response
        */

        return jsonResponse({
                success: true,

                document_id,

                requires_manual_review:
                    needsReview,

                data: {
                    medicines,
                    report:
                        extracted.report
                }
            });


    }
    catch (error) {

                console.error(
            "parse-medical-data error:",
            error
        );

        return jsonResponse(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error"
            },
            500
        );

    }

});