import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	NotFoundException,
	UseGuards,
	UseInterceptors,
	SerializeOptions,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { UserResponseDto } from "./dto/user-response.dto";
import { AuthGuard } from "src/auth/jwt-auth.guard";
import { Auth } from "src/config/auth.decorators";

@Controller({
	path: "users",
	version: "1",
})
@ApiTags("users")
@Auth()
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	findAll() {
		return this.usersService.findAll();
	}

	@Get(":id")
	@SerializeOptions({ type: UserResponseDto })
	async findOne(@Param("id") id: string) {
		const user = await this.usersService.findById(id);
		if (!user) {
			throw new NotFoundException("User not found");
		}
		return user.toObject();
	}

	@Patch(":id")
	@ApiBody({ type: CreateUserDto })
	update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.usersService.update(+id, updateUserDto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.usersService.remove(id);
	}
}
