import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageOptionsDto } from '../dto/pagination/page-options.dto';
import { PageMetaDto } from '../dto/pagination/page-meta.dto';
import { PageDto } from '../dto/pagination/page.dto';

@Injectable()
export class PaginationInterceptor<T> implements NestInterceptor<any, any> {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const applyPagination = pageParam !== undefined && limitParam !== undefined;

    return next.handle().pipe(
      map((result: any) => {
        if (!applyPagination) {
          return result;
        }

        const options = new PageOptionsDto();
        options.page = parseInt(pageParam, 10) || options.page;
        options.limit = parseInt(limitParam, 10) || options.limit;

        let items: any[] | undefined;
        let isRootArray = false;
        let arrayKey: string | null = null;

        if (Array.isArray(result)) {
          isRootArray = true;
          items = result;
        } else if (result && typeof result === 'object') {
          for (const key of Object.keys(result)) {
            if (Array.isArray(result[key])) {
              arrayKey = key;
              items = result[key];
              break;
            }
          }
        }

        if (!items) {
          return result;
        }

        const totalItems = items.length;
        const start = ((options.page ?? 1) - 1) * (options.limit ?? 10);
        const pagedItems = items.slice(start, start + (options.limit ?? 10));
        const meta = new PageMetaDto(options, totalItems, pagedItems.length);

        if (isRootArray) {
          return new PageDto<T>(pagedItems, meta);
        }

        return {
          ...result,
          [arrayKey!]: pagedItems,
          meta,
        };
      })
    );
  }
}