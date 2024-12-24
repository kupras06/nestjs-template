import { Type } from "class-transformer";
import { UserResponseDto } from "src/users/dto/user-response.dto";

export class LoginResponseDto {
	@Type(() => UserResponseDto)
	user: UserResponseDto;
	accessToken: string;
	refreshToken: string;
}
