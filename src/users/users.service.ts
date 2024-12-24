import { Injectable } from "@nestjs/common";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./entities/user.entity";
import type { Model } from "mongoose";

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name) private readonly usersModel: Model<User>,
	) {}
	async create(createUserDto: CreateUserDto) {
		return await this.usersModel.create(createUserDto);
	}

	async findAll() {
		return await this.usersModel.find({ isActive: true });
	}

	async findOne(userId: string) {
		return await this.findById(userId);
	}
	async findById(userId: string) {
		return await this.usersModel.findOne({ userId: userId });
	}
	async findByEmail(email: string) {
		const userByemail = await this.usersModel.findOne({ email: email }).exec();
		return userByemail;
	}
	update(id: number, updateUserDto: UpdateUserDto) {
		return `This action updates a #${id} user`;
	}

	remove(id: string) {
		return `This action removes a #${id} user`;
	}
}
