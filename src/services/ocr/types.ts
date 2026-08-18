export interface OCRResponse {
  text: string;
  confidence?: number;
}


export interface OCRProvider {
  scan(
    file: File | Blob,
    onProgress?: (progress: number) => void
  ): Promise<OCRResponse>;
}