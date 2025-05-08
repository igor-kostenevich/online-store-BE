import { ApiProperty } from '@nestjs/swagger';

export class ProductImageResponse {
  @ApiProperty({ description: 'Image UUID' })
  id: string;

  @ApiProperty({ description: 'URL or path to the image file' })
  url: string;

  @ApiProperty({ description: 'Whether this image is the main preview' })
  isMain: boolean;
}
