import { NestFactory, Reflector } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe, VersioningType } from "@nestjs/common";
// TODO: mount app to /api/v1 path
async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: "1",
		prefix: "api/v",
	});
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			disableErrorMessages: false,
			whitelist: true,
			validatorPackage: require("class-validator"),
			transformerPackage: require("class-transformer"),
		}),
	);
	const config = new DocumentBuilder()
		.setTitle("Wagon Value API")
		.setDescription("API for Wagon Value")
		.setVersion("1.0")
		.addBearerAuth()
		.addApiKey()
		.build();
	const documentFactory = () =>
		SwaggerModule.createDocument(app, config, {
			operationIdFactory: (controller, method, version) =>
				`${controller.replace(
					"Controller",
					"",
				)}_${method}_${version?.replace("api/", "")}`,
		});
	SwaggerModule.setup("api/docs", app, documentFactory, {
		jsonDocumentUrl: "/api/openapi.json",
		swaggerOptions: {
			persistAuthorization: true,
		},
	});

	await app.listen(process.env.PORT || 3000);
}
bootstrap();
