export interface ProfilePicture {
	uid: string;
	instanceId: string;
	imageId: string;
}

export const enum ResourceType {
	GAME = "GAME",
	ORGANIZATION = "ORGANIZATION",
}

export type ItemClass = {
	/** The type of resource that owns this item class */
	resourceType: ResourceType;
	/** Either the game ID or the organization ID depending on the resource type */
	resourceId: string;

	/** The ID of the item class. Item instances will reference this class ID. */
	classId: string;

	name: string;
	imageId: string; // thumbnail ID (https://easy-cdn/images/{imageId})
	tags: string[];
	description: string;

	/** Whether or not this item will be granted by default when a player joins your game. */
	default: boolean; // whether or not it will be granted to users by default

	tradable: {
		permitted: boolean;
	};

	marketable: {
		permitted: boolean;
	};
};

export enum GearCategory {
	Clothing = "Clothing",
	FaceDecal = "FaceDecal",
}

export enum GearClothingSubcategory {
	Root = "Root",
	Head = "Head",
	Hair = "Hair",
	Face = "Face",
	Neck = "Neck",
	Torso = "Torso",
	RightHand = "RightHand",
	LeftHand = "LeftHand",
	Waist = "Waist",
	Legs = "Legs",
	Feet = "Feet",
	Ears = "Ears",
	Nose = "Nose",
	TorsoOuter = "TorsoOuter",
	TorsoInner = "TorsoInner",
	Backpack = "Backpack",
	Hands = "Hands",
	HandsOuter = "HandsOuter",
	LeftWrist = "LeftWrist",
	RightWrist = "RightWrist",
	LegsOuter = "LegsOuter",
	LegsInner = "LegsInner",
	FeetInner = "FeetInner",
	LeftFoot = "LeftFoot",
	RightFoot = "RightFoot",
	LeftLegUpper = "LeftLegUpper",
	LeftLegLower = "LeftLegLower",
	RightLegUpper = "RightLegUpper",
	RightLegLower = "RightLegLower",
	LeftArmUpper = "LeftArmUpper",
	LeftArmLower = "LeftArmLower",
	RightArmUpper = "RightArmUpper",
	RightArmLower = "RightArmLower",
}

export type GearClass = ItemClass &
	(
		| {
				gear: {
					airAssets: string[];
					category: GearCategory.Clothing;
					subcategory: GearClothingSubcategory;
				};
		  }
		| {
				gear: {
					airAssets: string[];
					category: GearCategory.FaceDecal;
					subcategory: undefined;
				};
		  }
	);

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
	float: number;
}

export interface GearInstanceDto extends ItemInstanceDto {
	class: GearClass;
}

export interface ProfilePictureInstanceDto extends ItemInstanceDto {
	class: ProfilePictureClass;
}

export interface EquippedProfilePicture {
	uid: string;
	instanceId: string;
	imageId: string;
}

export interface OutfitPatch {
	gear: string[];
	skinColor: string;
	name: string;
}

export interface OutfitCreateDto {
	outfitId: string;
	owner: string;

	name: string;
	/** Hex string */
	skinColor: string;
	gear: Array<string>;

	equipped: boolean;
}

export interface OutfitDto {
	outfitId: string;
	owner: string;

	name: string;
	/** Hex string */
	skinColor: string;
	gear: Array<GearInstanceDto>;

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
