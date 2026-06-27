import { randomUUID } from "node:crypto";

export type SignedUpload = {
  filePath: string;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
  expiresAt: string;
};

export type SignedDownload = {
  downloadUrl: string;
  expiresAt: string;
};

export type CoaStorageService = {
  signCoaUpload(input: {
    organizationId: string;
    lotId: string;
    fileName: string;
    contentType: string;
  }): Promise<SignedUpload>;
  signCoaDownload(input: {
    organizationId: string;
    filePath: string;
  }): Promise<SignedDownload>;
};

export function createMemoryCoaStorageService(): CoaStorageService {
  return {
    async signCoaUpload(input) {
      const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${input.organizationId}/lots/${input.lotId}/${randomUUID()}-${safeFileName}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      return {
        filePath,
        uploadUrl: `/api/storage/mock-upload/${encodeURIComponent(filePath)}`,
        method: "PUT",
        headers: {
          "content-type": input.contentType
        },
        expiresAt
      };
    },

    async signCoaDownload(input) {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      return {
        downloadUrl: `/api/storage/mock-download/${encodeURIComponent(input.filePath)}?org=${encodeURIComponent(input.organizationId)}`,
        expiresAt
      };
    }
  };
}
