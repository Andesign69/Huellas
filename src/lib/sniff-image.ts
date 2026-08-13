// Real MIME sniffing via magic bytes — the client's declared Content-Type is
// not trustworthy input, someone could POST any file with any Content-Type.

const SIGNATURES: { ext: string; mime: string; check: (b: Buffer) => boolean }[] = [
  { ext: "jpg", mime: "image/jpeg", check: (b) => b.length > 2 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    ext: "png",
    mime: "image/png",
    check: (b) => b.length > 3 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    ext: "webp",
    mime: "image/webp",
    check: (b) => b.length > 11 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP",
  },
];

export function sniffImage(buffer: Buffer): { ext: string; mime: string } | null {
  for (const sig of SIGNATURES) {
    if (sig.check(buffer)) return { ext: sig.ext, mime: sig.mime };
  }
  return null;
}
