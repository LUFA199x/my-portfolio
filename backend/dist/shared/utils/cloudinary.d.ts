export interface UploadResult {
    url: string;
    secureUrl: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
}
export declare function uploadImageBuffer(buffer: Buffer, folder?: string, options?: {
    transformation?: object[];
    tags?: string[];
    filename?: string;
}): Promise<UploadResult>;
export declare function deleteImage(publicId: string): Promise<void>;
export declare function getOptimisedUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: string;
}): string;
//# sourceMappingURL=cloudinary.d.ts.map