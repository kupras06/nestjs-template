import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { LoginDto, RegisterUserDto } from "./dto/create-auth.dto";
import { createHash } from "node:crypto";
import { UsersService } from "src/users/users.service";
import { TokenType } from "src/config/constants";
import * as argon2 from "argon2";
import { OauthService } from "./oauth/oauth.service";
import {
	OauthProvider,
	OauthProvidersType,
} from "src/users/entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "./jwt.service";

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly oauthService: OauthService,
	) {}
	private async getAuthTokens(user: Record<string, any>) {
		return await this.jwtService.getAuthTokens(user);
	}
	async login(loginData: LoginDto) {
		const user = await this.usersService.findByEmail(loginData.email);
		console.log(user, loginData);

		if (!user) {
			throw new UnauthorizedException("Invalid User");
		}
		if (!user.isActive) {
			throw new UnauthorizedException("User is not active");
		}
		const isPasswordValid = await argon2.verify(
			user.passwordHash,
			loginData.password,
		);
		if (!isPasswordValid) {
			throw new UnauthorizedException("Invalid User/Password");
		}
		return await this.getAuthTokens(user.toJSON());
	}
	async refreshToken(refreshToken: string) {
		const isJwtValid = await this.jwtService.verifyToken(refreshToken, {
			typ: "refresh",
		});
		if (!isJwtValid.payload.sub) {
			throw new UnauthorizedException("Invalid Refresh Token");
		}
		const user = await this.usersService.findById(isJwtValid.payload.sub);
		if (!user) {
			throw new UnauthorizedException("Invalid User");
		}
		return await this.getAuthTokens(user);
	}
	async register(loginData: RegisterUserDto) {
		const user = await this.usersService.findByEmail(loginData.email);
		if (user) {
			throw new BadRequestException("User already exists");
		}
		const isValid = await this.verifyPasswordStrength(loginData.password);
		if (isValid) {
			throw new BadRequestException("Password is not strong enough");
		}
		const hashedPassword = await argon2.hash(loginData.password);
		const newUser = await this.usersService.create({
			email: loginData.email,
			fullName: loginData.fullName,
			passwordHash: hashedPassword,
		});
		return newUser.toObject();
	}
	async initiateOauthLogin(provider: OauthProvidersType, req: Request) {
		return await this.oauthService.initiateOauthLogin(provider, req);
	}
	async handleGoogleCallback(query, provider: OauthProvidersType) {
		const userOauthData = await this.oauthService.handleOauthCallback(
			query,
			provider,
		);
		let user = await this.usersService.findByEmail(userOauthData.user.email);
		const providerData: OauthProvider = {
			accessToken: userOauthData.tokens.accessToken,
			expiresAt: userOauthData.tokens.expiresAt,
			idToken: userOauthData.tokens.idToken,
			provider: provider,
			refreshToken: userOauthData.tokens.refreshToken,
			sub: userOauthData.user.sub,
		};

		if (!user) {
			user = await this.usersService.create({
				email: userOauthData.user.email,
				fullName: userOauthData.user.name,
			});
			user.oauthProviders.push(providerData);
		} else {
			const providerIndex = user.oauthProviders.findIndex(
				(provider) => provider.provider === providerData.provider,
			);
			const isProviderPresent = providerIndex !== -1;
			if (isProviderPresent) user.oauthProviders[providerIndex] = providerData;
			else user.oauthProviders.push(providerData);
		}
		user.isEmailVerified = true;
		user.isActive = true;
		user.picture = user.picture || userOauthData.user.picture;
		await user.save();
		let redirectAppUrl =
			query.state.app_redirect_url ||
			process.env.APP_URL ||
			"http://localhost:5173";
		redirectAppUrl += "/auth/callback";
		const redirectToken = await this.jwtService.getToken(
			{ sub: user.userId },
			TokenType.Redirect,
		);
		return `${redirectAppUrl}?token=${redirectToken}`;
	}
	async verifyPasswordStrength(password: string): Promise<boolean> {
		if (password.length < 8 || password.length > 255) {
			return false;
		}
		const sha1Hash = createHash("sha1")
			.update(password)
			.digest("hex")
			.toUpperCase();
		const hashPrefix = sha1Hash.slice(0, 5);
		const hashSuffix = sha1Hash.substring(5).toUpperCase();
		const response = await fetch(
			`https://api.pwnedpasswords.com/range/${hashPrefix}`,
		);
		const data = await response.text();
		const hashes = data.split("\n");
		return hashes.some((hash) => hash.endsWith(hashSuffix));
	}
}
