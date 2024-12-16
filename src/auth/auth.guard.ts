import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ClerkService } from "../clerk/clerk.service";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private clerkService: ClerkService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    try {
      const protocol = request.protocol;
      const host = request.hostname;
      const originalUrl = request.originalUrl;
      const port = request.port;
      const fullUrl = `${protocol}://${host ? host : "localhost"}${port ? ":" + port : ":3500"}${originalUrl}`;

      // Create a new Request object with the full URL
      const newRequest = new Request(fullUrl, {
        method: request.method,
        headers: request.headers,
        body:
          request.method !== "GET" && request.method !== "HEAD"
            ? request.body
            : null,
        credentials: request.credentials,
      });
      const requestState =
        await this.clerkService.client.authenticateRequest(newRequest);

      const userId = requestState.toAuth().userId;
      request["userId"] = userId;
      return !userId ? false : true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
