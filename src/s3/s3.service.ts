import { Injectable } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

@Injectable()
export class S3Service {
  client: S3Client;

  constructor() {
    this.client = new S3Client({
      endpoint: "https://usc1.contabostorage.com",
      region: "usc1",
      forcePathStyle: true,
    });
  }

  async uploadFile(bucket: string, key: string, file: Buffer) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
    });

    return this.client.send(command);
  }
}
