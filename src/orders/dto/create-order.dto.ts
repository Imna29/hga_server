import { ServiceType } from "@prisma/client";
import { IsIn, IsNumber, IsString, Max, Min } from "class-validator";

export class CreateOrderDto {
  @IsString()
  type: ServiceType;

  @IsNumber({
    maxDecimalPlaces: 0,
  })
  @Min(1)
  @Max(50)
  quantity: number;
}
