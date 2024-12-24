import { SetMetadata, UseGuards } from "@nestjs/common";
import { TokenType, UserRoles } from "./constants";
import { AuthGuard } from "src/auth/jwt-auth.guard";
import { ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import {
	applyDecorators,
	createParamDecorator,
	ExecutionContext,
} from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { UserResponseDto } from "src/users/dto/user-response.dto";

export const Role = (roleName: UserRoles) => SetMetadata("roleCheck", roleName);
export const TokenCheck = (tokenType: TokenType) =>
	SetMetadata("tokenType", tokenType);
export const AuthMetaData = (...metadata: string[]) =>
	SetMetadata("auth", metadata);

export function Auth(
	roles: UserRoles[] = ["USER"],
	tokenType: TokenType = TokenType.Access,
) {
	return applyDecorators(
		SetMetadata("roleCheck", roles),
		SetMetadata("tokenType", tokenType),
		UseGuards(AuthGuard),
		ApiBearerAuth(),
		ApiUnauthorizedResponse({ description: "Unauthorized" }),
	);
}

export const CurrentUser = createParamDecorator(
	(data: string, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		const user = request.user;
		return plainToClass(UserResponseDto, user);
	},
);
