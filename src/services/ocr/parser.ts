export interface MedicalData {
    medicines: {
        name: string;
        dosage?: string;
        frequency?: string;
    }[];
    report: {
        diagnosis?: string;
        doctor?: string;
    };
}

export function parseOCRText(
    text: string
): MedicalData {
    const medicines = [];
    const lines =
        text.split("\n");
    for (
        const line of lines
    ) {
        if (
            /mg|tablet|capsule/i
                .test(line)
        ) {
            medicines.push({
                name: line.trim()
            });
        }
    }
    return {
        medicines,
        report: {
        }
    };
}