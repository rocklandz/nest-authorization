import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Product {
  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: false })
  outOfStock: boolean;
}

export type UserDocument = Product & Document;
export const ProductSchema = SchemaFactory.createForClass(Product);
