
import PDFDocument from 'pdfkit';
import type PDFKit from 'pdfkit';

type StoredPdf = {
  storageKey: string;
  mimeType: 'application/pdf';
  size: number;
};

export const generatePdfBuffer = async (
  render: (document: PDFKit.PDFDocument) => void
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({
      size: 'A4',
      margins: { top: 45, bottom: 45, left: 45, right: 45 }
    });

    const chunks: Buffer[] = [];

    document.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    document.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    document.on('error', reject);

    try {
      render(document);
      document.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Adapter contract for the private document storage module.
 * Connect this to the storage provider configured by SIGMS.
 */
export interface PrivatePdfStorage {
  save(input: {
    schoolId: string;
    fileName: string;
    contentType: 'application/pdf';
    buffer: Buffer;
  }): Promise<StoredPdf>;
}

export const storeGeneratedPdf = async (
  storage: PrivatePdfStorage,
  schoolId: string,
  fileName: string,
  buffer: Buffer
) => {
  return storage.save({
    schoolId,
    fileName,
    contentType: 'application/pdf',
    buffer
  });
};
