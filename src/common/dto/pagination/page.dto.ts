import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from './page-meta.dto';

export class PageDto<T> {
  @ApiProperty({ isArray: true, description: 'Array of items' })
  readonly data: T[];

  @ApiProperty({ type: () => PageMetaDto, description: 'Page metadata' })
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}