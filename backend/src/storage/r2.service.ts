import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { type ObjectKeyInput, buildObjectKey } from './object-key.js';

const UPLOAD_URL_TTL_SECONDS = 600;
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export interface UploadTicket {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  expiresInSeconds: number;
}

interface R2Settings {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
}

/**
 * Cloudflare R2 over the S3 API. Uploads are presigned so the browser sends
 * the file straight to the bucket and the API never handles the bytes.
 */
@Injectable()
export class R2Service {
  private readonly settings: R2Settings | null;
  private readonly client: S3Client | null;

  constructor(config: ConfigService) {
    this.settings = readSettings(config);
    this.client = this.settings
      ? new S3Client({
          region: 'auto',
          endpoint: `https://${this.settings.accountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: this.settings.accessKeyId,
            secretAccessKey: this.settings.secretAccessKey,
          },
        })
      : null;
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  async createUploadTicket(input: ObjectKeyInput): Promise<UploadTicket> {
    const { client, settings } = this.requireStorage();
    const key = buildObjectKey(input);

    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: settings.bucket,
        Key: key,
        ContentType: input.contentType,
      }),
      { expiresIn: UPLOAD_URL_TTL_SECONDS },
    );

    return {
      key,
      uploadUrl,
      publicUrl: this.publicUrl(key),
      expiresInSeconds: UPLOAD_URL_TTL_SECONDS,
    };
  }

  async remove(key: string): Promise<void> {
    const { client, settings } = this.requireStorage();

    await client.send(new DeleteObjectCommand({ Bucket: settings.bucket, Key: key }));
  }

  publicUrl(key: string): string {
    const { settings } = this.requireStorage();

    return `${settings.publicBaseUrl.replace(/\/+$/, '')}/${key}`;
  }

  private requireStorage(): { client: S3Client; settings: R2Settings } {
    if (!this.client || !this.settings) {
      throw new ServiceUnavailableException(
        'Image storage is not configured. Set the R2_* values in apps/api/.env.',
      );
    }
    return { client: this.client, settings: this.settings };
  }
}

function readSettings(config: ConfigService): R2Settings | null {
  const settings = {
    accountId: config.get<string>('R2_ACCOUNT_ID') ?? '',
    accessKeyId: config.get<string>('R2_ACCESS_KEY_ID') ?? '',
    secretAccessKey: config.get<string>('R2_SECRET_ACCESS_KEY') ?? '',
    bucket: config.get<string>('R2_BUCKET') ?? '',
    publicBaseUrl: config.get<string>('R2_PUBLIC_BASE_URL') ?? '',
  };

  // Storage is optional so the app still runs before a bucket exists. The
  // upload endpoint then answers with a message naming what to fill in.
  return Object.values(settings).every(Boolean) ? settings : null;
}
