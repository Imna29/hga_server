import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  images: any;
}
