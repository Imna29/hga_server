import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [StripeController],
  providers: [StripeService],
  imports: [PrismaModule],
})
export class StripeModule {}
