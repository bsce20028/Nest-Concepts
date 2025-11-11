/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    //const request = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      map((data) => {
        if (data === null || data === undefined) {
          return {
            success: false,
            message: 'Request failed',
            data: undefined,
          };
        }
        
        return {
          success: true,
          message: 'Request successful',
          data,
        };
      }),
    );
  }
}
