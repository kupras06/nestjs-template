import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Req,
	HttpRedirectResponse,
	Res,
	Query,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterUserDto } from "./dto/create-auth.dto";
import { UserResponseDto } from "src/users/dto/user-response.dto";
import { ApiBody, ApiConsumes, ApiResponse } from "@nestjs/swagger";
import { plainToInstance, plainToClass } from "class-transformer";
import { LoginResponseDto } from "./dto/auth-response.dto";
import { OauthProvidersType } from "src/users/entities/user.entity";
import { Auth, CurrentUser } from "src/config/auth.decorators";
@Controller({
	path: "auth",
	version: "1",
})
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get("me")
	@Auth()
	@ApiResponse({
		status: 200,
		type: UserResponseDto,
	})
	async getCurrentUser(
		@CurrentUser() user: UserResponseDto,
	): Promise<UserResponseDto> {
		return user;
	}

	@Post("login")
	@ApiConsumes("application/json")
	@ApiBody({ type: LoginDto })
	async userLogin(
		@Body() loginDto: LoginDto,
		@Req() req,
	): Promise<LoginResponseDto> {
		const loggedData = await this.authService.login(loginDto);
		return plainToInstance(LoginResponseDto, loggedData);
	}
	@Post("register")
	@ApiResponse({
		status: 201,
		type: UserResponseDto,
	})
	async registerUser(
		@Body() createUserDto: RegisterUserDto,
	): Promise<UserResponseDto> {
		const newUser = await this.authService.register(createUserDto);
		return plainToClass(UserResponseDto, newUser);
	}
	@Get("refresh-token")
	@Auth([], "refresh")
	@ApiResponse({
		status: 200,
		type: LoginResponseDto,
	})
	async refreshUserTokens(): Promise<LoginResponseDto> {
		const newUser = await this.authService.refreshToken("");
		return plainToClass(LoginResponseDto, newUser);
	}
	@Get("oauth/:provider")
	async initiateGoogleLogin(
		@Res() res,
		@Param("provider") provider: OauthProvidersType,
		@Req() req,
	): Promise<HttpRedirectResponse> {
		const url = await this.authService.initiateOauthLogin(provider, req);
		return res.status(302).redirect(url);
	}
	@Get("oauth/:provider/callback")
	@ApiResponse({
		status: 201,
		type: LoginResponseDto,
	})
	async handleGoogleCallback(
		@Res() res,
		@Query() query: Record<string, string>,
		@Param("provider") provider: OauthProvidersType,
	): Promise<LoginResponseDto> {
		const oauthRedirectUrl = await this.authService.handleGoogleCallback(
			query,
			provider,
		);
		return res.status(302).redirect(oauthRedirectUrl);
	}
}
