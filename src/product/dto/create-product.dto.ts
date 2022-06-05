import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  productName: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  outOfStock: boolean;
}
