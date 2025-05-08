import { ApiProperty } from '@nestjs/swagger';
import { PageOptionsDto } from './page-options.dto';

export class PageMetaDto {
  @ApiProperty({ example: 1, description: 'Number of the page (1-based)' })
  readonly page: number;

  @ApiProperty({ example: 20, description: 'Number of items per page' })
  readonly limit: number;

  @ApiProperty({ example: 15, description:  'Number of items on the current page' })
  readonly itemCount: number;

  @ApiProperty({ example: 100, description: 'Total number of items' })
  readonly totalItems: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  readonly totalPages: number;

  constructor(options: PageOptionsDto, totalItems: number, itemCount: number) {
    this.page = options.page ?? 1;
    this.limit = options.limit ?? 20;
    this.itemCount = itemCount;
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(totalItems / (options.limit ?? 20));
  }
}