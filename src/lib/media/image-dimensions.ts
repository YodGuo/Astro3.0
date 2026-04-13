/**
 * Pure binary image dimension parser — zero dependencies.
 * Compatible with Cloudflare Workers runtime (Uint8Array only).
 * Ported from flare-stack-blog/src/features/media/utils/image-dimensions.ts
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

export function getImageDimensions(buffer: ArrayBuffer | Uint8Array): ImageDimensions | null {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  // PNG: IHDR chunk at offset 16
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
    const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
    return { width, height };
  }

  // JPEG: scan for SOF markers (0xFFC0-0xFFCF, excluding 0xFFC4/0xFFC8/0xFFCC)
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset < bytes.length - 1) {
      if (bytes[offset] !== 0xff) return null;
      const marker = bytes[offset + 1];

      // SOI, RST, SOS — skip
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
        continue;
      }

      // SOF markers (0xFFC0-0xFFC3, 0xFFC5-0xFFC7, 0xFFC9-0xFFCB, 0xFFCD-0xFFCF)
      if (
        ((marker >= 0xc0 && marker <= 0xc3) ||
         (marker >= 0xc5 && marker <= 0xc7) ||
         (marker >= 0xc9 && marker <= 0xcb) ||
         (marker >= 0xcd && marker <= 0xcf))
      ) {
        const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
        const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
        return { width, height };
      }

      // Skip other markers by reading their length
      const segLen = (bytes[offset + 2] << 8) | bytes[offset + 3];
      offset += 2 + segLen;
    }
    return null;
  }

  // WebP
  if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    const format = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);

    if (format === "VP8 ") {
      // Lossy VP8
      const width = (bytes[26] & 0x3f) << 8 | bytes[25];
      const height = (bytes[28] & 0x3f) << 8 | bytes[27];
      return { width, height };
    }

    if (format === "VP8L") {
      // Lossless VP8L
      const bits = (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
      const width = (bits & 0x3fff) + 1;
      const height = ((bits >> 14) & 0x3fff) + 1;
      return { width, height };
    }

    if (format === "VP8X") {
      // Extended VP8X
      const width = ((bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)) & 0xffffff) + 1;
      const height = ((bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)) & 0xffffff) + 1;
      return { width, height };
    }
  }

  // GIF
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    const width = bytes[6] | (bytes[7] << 8);
    const height = bytes[8] | (bytes[9] << 8);
    return { width, height };
  }

  return null;
}
