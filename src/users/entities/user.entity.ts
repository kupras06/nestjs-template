import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";
import { Types } from "mongoose";
import { UserRoles } from "src/config/constants";
export type UserDocument = HydratedDocument<User>;
export const OauthProviders = {
	Google: "google",
	Facebook: "facebook",
	Twitter: "twitter",
	Github: "github",
	Linkedin: "linkedin",
	Microsoft: "microsoft",
} as const;
export type OauthProviderType = keyof typeof OauthProviders;
export type OauthProvidersType = (typeof OauthProviders)[OauthProviderType];

@Schema()
export class OauthProvider {
	@Prop({ required: true })
	provider: OauthProvidersType;
	@Prop({ required: true })
	accessToken: string;
	@Prop({ required: true })
	idToken: string;
	@Prop({})
	refreshToken?: string;
	@Prop({ required: true })
	expiresAt: Date;
	@Prop({ required: true })
	sub: string;
}
@Schema({ timestamps: true })
export class User {
	@Prop({
		default: () => `user_${new Types.ObjectId().toString()}`,
		required: true,
		index: true,
		unique: true,
	})
	userId: string;

	@Prop({ unique: true })
	email: string;
	@Prop()
	fullName: string;
	@Prop({})
	passwordHash: string;

	@Prop({ default: [UserRoles.User] })
	roles: string[];
	@Prop()
	picture?: string;
	@Prop({ default: false })
	isActive: boolean;

	@Prop({ default: false })
	isEmailVerified: boolean;

	@Prop({ default: [], type: [OauthProvider], _id: false })
	oauthProviders: OauthProvider[];
}

export const UserSchema = SchemaFactory.createForClass(User);
