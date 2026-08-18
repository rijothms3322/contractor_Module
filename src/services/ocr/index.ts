import { platform } from "@/utils/platform";
import { MobileOCR } from "./mobile";
import { WebOCR } from "./web";

let webOCR: WebOCR | null = null;
let mobileOCR: MobileOCR | null = null;

export const getOCRService = () => {
    if (platform() === "mobile") {
        if (!mobileOCR) {
            mobileOCR = new MobileOCR();
        }

        return mobileOCR;
    }

    if (!webOCR) {
        webOCR = new WebOCR();
    }

    return webOCR;
};