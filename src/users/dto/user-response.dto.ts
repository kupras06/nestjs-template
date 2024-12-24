import { IsEmail, IsNotEmpty, IsNumber } from "class-validator";
import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
	@Exclude()
	_id: string;
	@Exclude()
	passwordHash: string;
	@Exclude()
	oauthProviders: unknown[];

	@Expose()
	@ApiProperty()
	userId: string;

	@IsEmail()
	@ApiProperty()
	@Expose()
	email: string;

	@Expose()
	@ApiProperty()
	roles: string[];

	@ApiProperty()
	@Expose()
	fullName: string;

	@Expose()
	@ApiProperty()
	picture: string;

	@ApiProperty()
	@Expose()
	createdAt: Date;

	@ApiProperty()
	@Expose()
	updatedAt: Date;

	@ApiProperty({ type: Number })
	@IsNotEmpty()
	@IsNumber()
	@Expose({ name: "__v" })
	version: number;
}
