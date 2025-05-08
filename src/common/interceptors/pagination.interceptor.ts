import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageOptionsDto } from '../dto/pagination/page-options.dto';
import { PageMetaDto } from '../dto/pagination/page-meta.dto';
import { PageDto } from '../dto/pagination/page.dto';

@Injectable()
export class PaginationInterceptor<T> implements NestInterceptor<T[], PageDto<T> | T[]> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T[]>
  ): Observable<PageDto<T> | T[]> {
    const req = context.switchToHttp().getRequest();
    const { page, limit } = req.query as Record<string, any>;

    return next.handle().pipe(
      map((data: T[]) => {
        if (!page || !limit) {
          return data;
        }

        const options = new PageOptionsDto();
        options.page = parseInt(page, 10);
        options.limit = parseInt(limit, 10);

        const start = (options.page - 1) * options.limit;
        const end = start + options.limit;
        const items = data.slice(start, end);

        const meta = new PageMetaDto(options, data.length, items.length);
        return new PageDto(items, meta);
      })
    );
  }
}