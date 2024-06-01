export interface ProfilePicture {
	uid: string;
	instanceId: string;
	imageId: string;
}

export const enum ResourceType {
	GAME = "GAME",
	ORGANIZATION = "ORGANIZATION",
}

export interface ItemClass {
	resourceType: ResourceType;
	/** Either the game ID or the organization ID depending on the resource type */
	resourceId: string;

	classId: string;

	name: string;
	imageId: string; // thumbnail ID (https://easy-cdn/images/{imageId})
	tags: string[];
	description: string;

	default: boolean; // whether or not it will be granted to users by default

	tradable: {
		permitted: boolean;
	};

	marketable: {
		permitted: boolean;
	};
}

export interface AccessoryClass extends ItemClass {
	accessory: {};
}

export interface ProfilePictureClass extends ItemClass {
	profilePicture: {
		imageId: string;
	};
}

export interface ItemInstanceDto {
	ownerId: string;
	class: ItemClass;
	instanceId: string;
	createdAt: string;
}

export interface AccessoryInstanceDto extends ItemInstanceDto {
	class: AccessoryClass;
}

export interface ProfilePictureInstanceDto extends ItemInstanceDto {
	class: ProfilePictureClass;
}

export interface EquippedProfilePicture {
	uid: string;
	instanceId: string;
	imageId: string;
}

export interface OutfitDto {
	outfitId: string;
	owner: string;

	name: string;
	/** Hex string */
	skinColor: string;
	accessories: Array<AccessoryInstanceDto>;

	equipped: boolean;
}

/** Describes an item that was gained in a transaction */
export interface GainedItemSummary {
	/** The userId of the user that gained the item */
	uid: string;
	resourceType: string;
	resourceId: string;
	classId: string;
	instanceId: string;
}

/** Describes an item that was lost in a transaction */
export interface LostItemSummary {
	/** The userId of the user that lost the item */
	uid: string;
	resourceType: string;
	resourceId: string;
	classId: string;
	instanceId: string;
}

export interface Transaction {
	/** Describes the items gained in the transaction */
	itemsGained: GainedItemSummary[];
	/** Describes the items lost in the transaction */
	itemsLost: LostItemSummary[];

	type: "GAME_BROKERED_TRADE";
	transactionId: string;
	createdAt: string;
}
