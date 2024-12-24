import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "src/users/users.module";
import { OauthService } from "./oauth/oauth.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "./jwt.service";

@Module({
	imports: [UsersModule],
	controllers: [AuthController],
	providers: [AuthService, JwtService, OauthService, ConfigService],
	exports: [JwtService],
})
export class AuthModule {}
