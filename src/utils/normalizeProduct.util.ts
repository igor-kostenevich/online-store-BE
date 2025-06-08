import { ProductAutocompleteDto } from 'src/product/dto/responces/product-autocomplete.dto';
import { RawAutocompleteProduct } from 'src/product/Interfaces/product.interface';

export function normalizeRawAutocomplete(p: RawAutocompleteProduct): ProductAutocompleteDto {
  return {
    id: p.id,
    name: p.name,
    price: +p.price,
    slug: p.slug,
    image: p.imageId && p.imageUrl
      ? { id: p.imageId, url: p.imageUrl }
      : undefined,
  };
}