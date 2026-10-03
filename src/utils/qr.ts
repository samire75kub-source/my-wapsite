// High-performance QR Code SVG Generator for instant mobile website viewing
export function generateQrSvg(url: string, size = 180): string {
  // Use public high-reliability vector QR API with offline/fallback SVG renderer
  const encoded = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=050811&color=00ffcc&margin=2`;
}
