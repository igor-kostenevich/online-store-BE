import { Expose, Type } from 'class-transformer';

export class ProductImageDto {
  @Expose() id: string;
  @Expose() url: string;
}

export class ProductAutocompleteDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() price: number;
  @Expose() slug: string;

  @Expose()
  @Type(() => ProductImageDto)
  image?: ProductImageDto;
}
