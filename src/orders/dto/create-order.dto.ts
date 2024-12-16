import { IsIn, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsIn(['ECONOMY', 'CORE', 'BULK'])
  type: 'ECONOMY' | 'CORE' | 'BULK';

  @IsNumber({
    maxDecimalPlaces: 0,
  })
  @Min(1)
  @Max(50)
  quantity: number;
}
