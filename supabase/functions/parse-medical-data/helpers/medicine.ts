/// <reference lib="deno.ns" />

import {
    SupabaseClient
} from "https://esm.sh/@supabase/supabase-js@2";


export interface MedicineMatch {

    medicine_master_id:
        string | null;

    medicine_name:
        string;

    dosage_form:
        string | null;

    strength:
        string | null;

    match_found:
        boolean;

    match_score:
        number;

}


/**
 * Normalize medicine text.
 *
 * Example:
 *
 * Dolo-650
 * Dolo 650mg
 *
 * becomes:
 *
 * dolo 650
 */
function normalizeText(
    value: string
): string {

    return value

        .toLowerCase()

        .replace(
            /[^a-z0-9\s]/g,
            " "
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/**
 * Extract strength from medicine text.
 *
 * Examples:
 *
 * Dolo 650mg
 * Dolo 650 mg
 *
 * returns:
 *
 * 650mg
 */
function extractStrength(
    value: string
): string | null {

    const match =
        value.match(
            /\d+(?:\.\d+)?\s?(mg|ml|mcg|g|%)?/i
        );


    if (
        !match
    ) {

        return null;

    }


    return match[0]
        .toLowerCase()
        .replace(
            /\s+/g,
            ""
        );

}


/**
 * Normalize strength.
 *
 * 650 mg -> 650mg
 * 650MG -> 650mg
 */
function normalizeStrength(
    value: string | null
): string {

    if (!value) {

        return "";

    }

    return value
        .toLowerCase()
        .replace(
            /\s+/g,
            ""
        );

}


/**
 * Search medicine_master.
 */
export async function findMedicineMatch(

    supabase: SupabaseClient,

    medicineText: string

): Promise<MedicineMatch> {


    const cleaned =
        normalizeText(
            medicineText
        );


    /*
        Empty medicine
    */

    if (
        !cleaned
    ) {

        return {

            medicine_master_id:
                null,

            medicine_name:
                medicineText,

            dosage_form:
                null,

            strength:
                null,

            match_found:
                false,

            match_score:
                0

        };

    }


    /*
        Extract strength
    */

    const extractedStrength =
        extractStrength(
            cleaned
        );


    const normalizedExtractedStrength =
        normalizeStrength(
            extractedStrength
        );


    /*
        Remove strength from medicine name
        for better name matching.

        Example:

        "dolo 650"

        becomes:

        "dolo"
    */

    const nameWithoutStrength =
        cleaned
            .replace(
                /\d+(?:\.\d+)?\s?(mg|ml|mcg|g|%)?/gi,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    /*
        ------------------------------------------------
        1. Exact normalized medicine name search
        ------------------------------------------------
    */

    const {
        data: exactMatches,
        error: exactError
    } =
        await supabase

            .from(
                "medicine_master"
            )

            .select(`
                id,
                medicine_name,
                dosage_form,
                strength
            `)

            .ilike(
                "medicine_name",
                cleaned
            )

            .limit(10);


    if (
        exactError
    ) {

        console.error(
            "Medicine exact search error:",
            exactError
        );

    }


    if (
        exactMatches &&
        exactMatches.length > 0
    ) {

        /*
            Prefer exact strength match
        */

        if (
            normalizedExtractedStrength
        ) {

            const strengthMatch =
                exactMatches.find(
                    item =>
                        normalizeStrength(
                            item.strength
                        ) ===
                        normalizedExtractedStrength
                );


            if (
                strengthMatch
            ) {

                return {

                    medicine_master_id:
                        strengthMatch.id,

                    medicine_name:
                        strengthMatch.medicine_name,

                    dosage_form:
                        strengthMatch.dosage_form,

                    strength:
                        strengthMatch.strength,

                    match_found:
                        true,

                    match_score:
                        100

                };

            }

        }


        /*
            Exact medicine name,
            but no strength match.
        */

        const selected =
            exactMatches[0];


        return {

            medicine_master_id:
                selected.id,

            medicine_name:
                selected.medicine_name,

            dosage_form:
                selected.dosage_form,

            strength:
                selected.strength,

            match_found:
                true,

            match_score:
                normalizedExtractedStrength
                    ? 85
                    : 95

        };

    }


    /*
        ------------------------------------------------
        2. Name-only exact-ish search
        ------------------------------------------------

        Example:

        OCR:
        Dolo 650

        Search:
        Dolo
    */

    if (
        nameWithoutStrength
    ) {

        const {
            data: nameMatches,
            error: nameError
        } =
            await supabase

                .from(
                    "medicine_master"
                )

                .select(`
                    id,
                    medicine_name,
                    dosage_form,
                    strength
                `)

                .ilike(
                    "medicine_name",
                    `%${nameWithoutStrength}%`
                )

                .limit(10);


        if (
            nameError
        ) {

            console.error(
                "Medicine name search error:",
                nameError
            );

        }


        if (
            nameMatches &&
            nameMatches.length > 0
        ) {

            /*
                If OCR provided strength,
                only accept a result when
                strength matches.

                This prevents:

                Dolo 650

                from accidentally matching:

                Dolo 500
            */

            if (
                normalizedExtractedStrength
            ) {

                const strengthMatches =
                    nameMatches.filter(
                        item =>
                            normalizeStrength(
                                item.strength
                            ) ===
                            normalizedExtractedStrength
                    );


                if (
                    strengthMatches.length === 1
                ) {

                    const selected =
                        strengthMatches[0];


                    return {

                        medicine_master_id:
                            selected.id,

                        medicine_name:
                            selected.medicine_name,

                        dosage_form:
                            selected.dosage_form,

                        strength:
                            selected.strength,

                        match_found:
                            true,

                        match_score:
                            90

                    };

                }


                /*
                    Multiple medicines with
                    same name/strength.

                    Do not guess.
                */

                if (
                    strengthMatches.length > 1
                ) {

                    return {

                        medicine_master_id:
                            null,

                        medicine_name:
                            medicineText,

                        dosage_form:
                            null,

                        strength:
                            extractedStrength,

                        match_found:
                            false,

                        match_score:
                            0

                    };

                }


                /*
                    Name found but strength
                    does not match.

                    Do NOT select it.
                */

                return {

                    medicine_master_id:
                        null,

                    medicine_name:
                        medicineText,

                    dosage_form:
                        null,

                    strength:
                        extractedStrength,

                    match_found:
                        false,

                    match_score:
                        30

                };

            }


            /*
                No strength in OCR.

                If only one name candidate
                exists, we can accept it
                with lower confidence.
            */

            if (
                nameMatches.length === 1
            ) {

                const selected =
                    nameMatches[0];


                return {

                    medicine_master_id:
                        selected.id,

                    medicine_name:
                        selected.medicine_name,

                    dosage_form:
                        selected.dosage_form,

                    strength:
                        selected.strength,

                    match_found:
                        true,

                    match_score:
                        80

                };

            }

        }

    }


    /*
        ------------------------------------------------
        3. No safe match
        ------------------------------------------------
    */

    return {

        medicine_master_id:
            null,

        medicine_name:
            medicineText,

        dosage_form:
            null,

        strength:
            extractedStrength,

        match_found:
            false,

        match_score:
            0

    };

}