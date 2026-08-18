"use client";

import { isMobileApp } from "@/utils/platform";
import WebUploader from "./WebUploader";
import MobileUploader from "./MobileUploader";
import type { OCRUploaderProps } from "./types";

export default function OCRUploader(
    props: OCRUploaderProps
) {
    if (isMobileApp()) {
        return (
            <MobileUploader
                {...props}
            />
        );
    }

    return (
        <WebUploader
            {...props}
        />
    );
}