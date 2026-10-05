export interface OCRUploaderResult {

    document_id: string;

    text: string;

    medicines?: any[];

    report?: any;

    requires_manual_review: boolean;

}

export interface OCRUploaderProps {
    userId?: string;
    reportDate?: string;
    reportNote?: string;
    reportCategory?: string;
    isPrivate?: boolean;
    onComplete: (data: {
        document_id: string;
        text: string;
        medicines: any[];
        report: any;
        requires_manual_review: boolean;
    }) => void;
    onError?: (
        error: Error
    ) => void;
    onClear?: () => void;

}