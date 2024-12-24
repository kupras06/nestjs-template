import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { JwtService } from "./auth/jwt.service";

@Module({
	imports: [
		ConfigModule.forRoot({
			cache: true,
			isGlobal: true,
		}),
		MongooseModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return {
					uri: configService.get("MONGO_URI"),
				};
			},
		}),
		AuthModule,
		UsersModule,
	],
	providers: [JwtService],
})
export class AppModule {}
