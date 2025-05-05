import { ApiProperty } from '@nestjs/swagger';

class CategoryBase {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty({ type: String, nullable: true }) parentId?: string | null;
}

export class CategoryResponse extends CategoryBase {
  @ApiProperty({ type: [CategoryBase] })
  children?: CategoryBase[];
}