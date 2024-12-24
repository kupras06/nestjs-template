import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, IsAlphanumeric } from "class-validator";

export class CreateAuthDto {}

export class LoginDto {
	@ApiProperty()
	@IsEmail()
	email: string;

	@IsString()
	@ApiProperty()
	password: string;
}

export class RegisterUserDto extends LoginDto {
	@ApiProperty()
	@IsString()
	fullName: string;
}
