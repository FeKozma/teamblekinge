/**
 * Whether an image URL points at an upload (/filer/…). Uploads are private to
 * the visitor's demo sandbox, so next/image must not fetch them through its
 * optimizer: `<Image src={src} unoptimized={isUploadUrl(src)} … />`.
 */
export const isUploadUrl = (src?: string | null) => !!src?.startsWith("/filer/");
