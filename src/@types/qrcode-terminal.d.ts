declare module "qrcode-terminal" {
  interface QRCodeOptions {
    small?: boolean;
    [key: string]: unknown;
  }

  export function generate(qr: string, options?: QRCodeOptions): void;
}
