import { SocialNotificationType } from "./SocialNotificationType";

export interface PendingSocialNotification {
	type: SocialNotificationType;
	key: string;
	title: string;
	username: string;
	userId: string;
	profileImageId?: string;
	extraData: unknown;
}
