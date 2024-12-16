import { Injectable, OnModuleInit } from '@nestjs/common';
import { env } from 'process';
import { ClerkClient, createClerkClient } from '@clerk/backend';

@Injectable()
export class ClerkService implements OnModuleInit {
  client: ClerkClient;

  async onModuleInit() {
    this.client = createClerkClient({
      secretKey: env.CLERK_SECRET_KEY,
      publishableKey: env.CLERK_PUBLISHABLE_KEY,
    });
  }
}
