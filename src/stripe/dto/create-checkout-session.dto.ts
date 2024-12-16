import { IsUUID } from "class-validator";

export default class CreateCheckoutSessionDto {
  @IsUUID("7")
  orderId: string;
}
