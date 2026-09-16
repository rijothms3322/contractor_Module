/// <reference lib="deno.ns" />


export interface OCRValidation {

    valid: boolean;

    confidence: number;

    reason: string;

}


/**
 * Validate OCR text before sending it
 * to the medical extraction AI.
 *
 * This does NOT determine whether the
 * medical information itself is correct.
 *
 * It only determines whether there is
 * enough readable OCR text to continue.
 */
export function validateOCRText(
    text: string
): OCRValidation {


    /*
        Empty OCR
    */

    if (
        !text ||
        !text.trim()
    ) {

        return {

            valid: false,

            confidence: 0,

            reason:
                "OCR text is empty. Please upload a clearer image or document."

        };

    }


    const cleanText =
        text
            .trim()
            .replace(
                /\s+/g,
                " "
            );


    const words =
        cleanText.split(/\s+/);


    const length =
        cleanText.length;


    /*
        Very small OCR result
    */

    if (
        length < 20 ||
        words.length < 5
    ) {

        return {

            valid: false,

            confidence: 20,

            reason:
                "Too little readable text. Please upload a clearer image or document."

        };

    }


    /*
        Count alphabetic words
    */

    const readableWords =
        words.filter(

            word =>
                /[a-zA-Z]{2,}/
                    .test(word)

        );


    /*
        Count numeric/medical tokens.

        Examples:

        650
        650mg
        210
        mg/dL
        1-0-1
        5 days
        120/80
    */

    const usefulMedicalTokens =
        words.filter(

            word =>

                /\d/.test(word) ||

                /mg|ml|mcg|g\/dl|mg\/dl|mmhg|%|tablet|tab|capsule|cap|syrup|days|week|weeks|month|months|daily|night|morning|evening|after|before/i
                    .test(word)

        );


    /*
        Calculate readable ratio
    */

    const readableRatio =
        readableWords.length /
        words.length;


    /*
        Medical token ratio
    */

    const medicalRatio =
        usefulMedicalTokens.length /
        words.length;


    /*
        Base confidence

        Alphabetic readability is more important,
        but medical tokens also contribute.
    */

    let confidence =
        Math.round(
            (
                readableRatio * 0.75 +
                medicalRatio * 0.25
            ) * 100
        );


    /*
        Keep within 0-100
    */

    confidence =
        Math.max(
            0,
            Math.min(
                100,
                confidence
            )
        );


    /*
        OCR threshold

        Below 40:
        Do not send to AI extraction.

        User should upload a clearer document.
    */

    if (
        confidence < 40
    ) {

        return {

            valid: false,

            confidence,

            reason:
                "OCR quality is too low. Please upload a clearer image or document."

        };

    }


    /*
        OCR acceptable
    */

    return {

        valid: true,

        confidence,

        reason:
            "OCR quality is acceptable."

    };

}