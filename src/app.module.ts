import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthService } from './auth/auth.service';
import { ClerkModule } from './clerk/clerk.module';
import { S3Module } from './s3/s3.module';
import { StripeModule } from './stripe/stripe.module';
import { FiguresModule } from './figures/figures.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    OrdersModule,
    ClerkModule,
    S3Module,
    StripeModule,
    FiguresModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
