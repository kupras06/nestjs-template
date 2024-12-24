export const APP_NAME = "wagon-value-api";

export const TokenType = {
	Access: "access",
	Refresh: "refresh",
	ResetPassword: "reset_password",
	Invite: "invite",
	Redirect: "redirect",
} as const;

export type TokenType = (typeof TokenType)[keyof typeof TokenType];

export const TokenExpiry = {
	ACCESS: "1h",
	REFRESH: "7d",
	RESET_PASSWORD: "30m",
	INVITE: "7d",
} as const;
export type TokenExpiry = (typeof TokenExpiry)[keyof typeof TokenExpiry];

export const UserRoles = {
	User: "USER",
	Valuator: "VALUATOR",
} as const;
export type UserRoles = (typeof UserRoles)[keyof typeof UserRoles];

export const OrderStatus = {
	DRAFT: "DRAFT",
	PENDING_QUOTE: "PENDING_QUOTE",
	PENDING_PAYMENT: "PENDING_PAYMENT",
	IN_PRODUCTION: "IN_PRODUCTION",
	IN_REPAIR: "IN_REPAIR",
	DELIVERED: "DELIVERED",
	COMPLETED: "COMPLETED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderType = {
	DISCUSSION: "DISCUSSION",
	INVOICE: "INVOICE",
	DELIVERY: "DELIVERY",
	DELIVERED: "DELIVERED",
	FEEDBACK: "FEEDBACK",
};
export type OrderType = (typeof OrderType)[keyof typeof OrderType];
