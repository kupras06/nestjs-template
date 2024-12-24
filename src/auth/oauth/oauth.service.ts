import { BadRequestException, Injectable, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	OauthProviders,
	OauthProvidersType,
} from "src/users/entities/user.entity";
let arctic: typeof import("arctic");
async function getArctic(): Promise<any> {
	if (typeof arctic !== "undefined") return arctic;
	// biome-ignore lint/security/noGlobalEval: <explanation>
	const mod = await (eval(`import('arctic')`) as Promise<
		typeof import("arctic")
	>);
	arctic = mod;
	return arctic;
}

@Injectable({
	scope: Scope.DEFAULT,
})
export class OauthService {
	private callbackUrl: string;
	constructor(private configService: ConfigService) {
		this.setupClients();
	}
	getOauthClient(provider: OauthProvidersType) {
		switch (provider) {
			case OauthProviders.Google:
				return new arctic.Google(
					this.configService.get("GOOGLE_CLIENT_ID") as string,
					this.configService.get("GOOGLE_CLIENT_SECRET") as string,
					`${this.callbackUrl}/google/callback`,
				);
			default:
				throw new BadRequestException(`Invalid Oauth Provider: ${provider}`);
		}
	}
	async setupClients() {
		await getArctic();
		const deployUrl =
			this.configService.get("RENDER_EXTERNAL_URL") ||
			this.configService.get("APP_URL") ||
			"http://localhost:3001";
		this.callbackUrl = `${deployUrl}/api/v1/auth/oauth`;
	}
	async initiateOauthLogin(provider: OauthProvidersType, req: Request) {
		const arcticState = arctic.generateState();
		const codeVerifier = arctic.generateCodeVerifier();
		const scopes = ["openid", "profile", "email"];
		const state: Record<string, string> = {};
		state.state = arcticState;
		state.code_verifier = codeVerifier;
		state.app_redirect_url = req.headers["x-app-uri"];
		const url = this.getOauthClient(provider).createAuthorizationURL(
			JSON.stringify(state),
			codeVerifier,
			scopes,
		);
		return url;
	}
	async handleOauthCallback(
		reqUrlParams: Record<string, string>,
		provider: OauthProvidersType,
	) {
		switch (provider) {
			case OauthProviders.Google:
				return this.handleGoogleCallback(reqUrlParams);
			default:
				throw new Error(`Invalid Oauth Provider: ${provider}`);
		}
	}
	async handleGoogleCallback(reqUrlParams: Record<string, string>) {
		const code = reqUrlParams.code;
		const state = JSON.parse(reqUrlParams.state as string);
		const codeVerifier = state.code_verifier;
		const tokens = await this.getOauthClient(
			"google",
		).validateAuthorizationCode(code, codeVerifier);
		const accessToken = tokens.accessToken();
		const idToken = tokens.idToken();
		const claims = arctic.decodeIdToken(idToken);
		const response = await fetch(
			"https://openidconnect.googleapis.com/v1/userinfo",
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		);
		const user = await response.json();
		return {
			user,
			tokens: {
				accessToken,
				idToken: tokens.idToken(),
				refreshToken: tokens.hasRefreshToken()
					? tokens.refreshToken()
					: undefined,
				expiresAt: tokens.accessTokenExpiresAt(),
				sub: user.sub,
			},
		};
	}
}
