declare module 'qrcode-generator' {
  interface QRCode {
    addData(data: string): void;
    make(): void;
    getModuleCount(): number;
    isDark(row: number, col: number): boolean;
    createDataURL(cellSize?: number, margin?: number): string;
  }

  function qrcode(typeNumber: number, errorCorrectionLevel: string): QRCode;
  export = qrcode;
}
