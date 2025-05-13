import {
	ContentServiceGear,
	ContentServiceItemClasses,
	ContentServiceItems,
	ContentServiceOutfits,
	ContentServicePrisma,
} from "../../TypePackages/content-service-types";

interface ItemBaseQueryParameters<T extends "tag" | "class"> {
	queryType: T;
	resourceIds?: string[];
}

interface TagQueryParameters extends ItemBaseQueryParameters<"tag"> {
	tags: string[];
}

interface ClassQueryParameters extends ItemBaseQueryParameters<"class"> {
	classIds: string[];
}

export type ItemQueryParameters = ClassQueryParameters | TagQueryParameters;

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

export enum GearCategory {
	Clothing = "Clothing",
	FaceDecal = "FaceDecal",
}

export type AirshipGear = ContentServiceGear.SelectedGear &
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

export type AirshipItem = ContentServiceItems.SelectedItem;
export type AirshipGearItem = ContentServiceGear.SelectedGearItem;
export type AirshipOutfit = ContentServiceOutfits.SelectedOutfit;

export type Transaction = ContentServicePrisma.Transaction;
