import { Body, Controller, Post } from '@nestjs/common';
import { ClerkService } from '../clerk/clerk.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly clerkService: ClerkService) {}

  @Post('verify-totp')
  async verifyTotp(@Body() code: string) {
    return this.clerkService.client.users.verifyTOTP({
      userId: 'user-id',
      code,
    });
  }
}
