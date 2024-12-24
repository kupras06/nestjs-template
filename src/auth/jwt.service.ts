import { Injectable, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { importJWK, jwtVerify, JWTVerifyOptions, KeyLike, SignJWT } from "jose";
import { pbkdf2Sync } from "node:crypto";
import { pick } from "ramda";
import { APP_NAME, TokenExpiry, TokenType } from "src/config/constants";
import { ulid } from "ulid";

const alg = "HS256";
const cache = new Map();
async function createLocalJWKSetFromPassword(secretKey: string) {
	if (cache.has("jwkKey")) return cache.get("jwkKey");
	const passwordBuffer = Buffer.from(secretKey, "utf8");
	const salt = Buffer.from(secretKey); // Use a proper salt in a real application
	const key = pbkdf2Sync(passwordBuffer, salt, 100000, 32, "sha256");
	const keyBase64Url = key.toString("base64url");
	const jwk = {
		kty: "oct",
		k: keyBase64Url,
		alg: "HS256", // Specify the algorithm here
	};
	const jwkKey = await importJWK(jwk, "HS256");
	cache.set("jwkKey", jwkKey);
	return jwkKey;
}
@Injectable({ scope: Scope.DEFAULT })
export class JwtService {
	private jwkKey: KeyLike;
	constructor(private readonly configService: ConfigService) {
		createLocalJWKSetFromPassword(
			this.configService.get("JWT_KEY") as string,
		).then((res) => {
			this.jwkKey = res;
		});
	}
	async getToken(
		payload: Record<string, any>,
		tokenType: TokenType = TokenType.Access,
	) {
		const jwt = new SignJWT({ ...payload, typ: tokenType })
			.setProtectedHeader({ alg })
			.setIssuedAt()
			.setIssuer(APP_NAME)
			.setAudience(APP_NAME)
			.setJti(`jwt_${ulid()}`)
			.setSubject(payload.sub);
		if (tokenType === TokenType.Access) {
			jwt.setExpirationTime(TokenExpiry.ACCESS);
		} else if (tokenType === TokenType.Refresh) {
			jwt.setExpirationTime(TokenExpiry.REFRESH);
		} else if (tokenType === TokenType.Invite) {
			jwt.setExpirationTime(TokenExpiry.INVITE);
		} else if (tokenType === TokenType.ResetPassword) {
			jwt.setExpirationTime(TokenExpiry.RESET_PASSWORD);
		} else if (tokenType === TokenType.Redirect) {
			jwt.setExpirationTime("3m");
		}
		return jwt.sign(this.jwkKey);
	}
	async verifyToken(token: string, options: JWTVerifyOptions = {}) {
		const jwt = await jwtVerify(token, this.jwkKey, {
			issuer: APP_NAME,
			audience: APP_NAME,
			algorithms: [alg],
			...options,
		});
		return jwt;
	}
	async getAuthTokens(user: Record<string, any>) {
		const userPayload: Record<string, string | string[]> = pick(
			["email", "fullName", "userId", "roles", "picture"],
			user,
		);
		userPayload.sub = user.userId;
		const accessToken = await this.getToken(userPayload);
		const refreshToken = await this.getToken(userPayload, TokenType.Refresh);
		return { user, accessToken, refreshToken };
	}
}
