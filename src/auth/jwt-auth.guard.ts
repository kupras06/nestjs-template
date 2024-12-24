import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { APP_NAME, TokenType, UserRoles } from "src/config/constants";
import { JwtService } from "./jwt.service";

export function verifyRole(checkRole: UserRoles[], currentRoles: UserRoles[]) {
	if (checkRole.length === 0) {
		return currentRoles.length > 0;
	}
	return currentRoles.some((role) => checkRole.includes(role));
}
@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const role = this.reflector.get<UserRoles[]>(
			"roleCheck",
			context.getHandler(),
		) ?? [UserRoles.User];
		const tokenType =
			this.reflector.get<TokenType>("tokenType", context.getHandler()) ??
			TokenType.Access;
		const token = this.extractTokenFromHeader(request);
		if (!token) {
			throw new UnauthorizedException("Invalid Token Provided");
		}
		try {
			console.log("tokenType", tokenType);
			const { payload } = await this.jwtService.verifyToken(token);
			console.log(payload);
			if (!payload.sub) {
				throw new UnauthorizedException("Invalid Token Provided");
			}
			if (!verifyRole(role, payload.roles as UserRoles[])) {
				throw new UnauthorizedException(
					"You are not allowed to access this resource",
				);
			}
			if (payload.typ !== tokenType) {
				throw new UnauthorizedException("Invalid Token Type");
			}
			request.user = payload;
			request.token = token;
		} catch (err) {
			console.error(err);
			throw new UnauthorizedException(err.message);
		}
		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		// @ts-expect-error because of the way the headers are set
		const [type, token] = request.headers.authorization?.split(" ") ?? [];
		return type === "Bearer" ? token : undefined;
	}
}
