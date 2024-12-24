// import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

// @Injectable()
// export class LoggerMiddleware implements NestMiddleware {
//   private logger = new Logger('HTTP');

//   use(request: Request, response: Response, next: NextFunction): void {
//     const { ip, method, originalUrl: url } = request;
//     this.logger.log(
//       `Called ${method} ${url}  - ${ip}`
//     );
//     response.on('close', () => {
//       const { statusCode } = response;
//       const contentLength = response.get('content-length');
//       this.logger.log(
//         ` ${statusCode} ${contentLength}  `
//       );
//     });

//     next();
//   }
// }
