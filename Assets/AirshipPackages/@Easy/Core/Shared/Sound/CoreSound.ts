const coreSoundPath = "AirshipPackages/@Easy/Core/Sound/";

/**
 * Shortcut for a Core sound.
 *
 * Passing in "test" will return "AirshipPackages/@Easy/Core/Sound/test"
 */
export const S = (path: string): string => {
	return coreSoundPath + path;
};

export const Footstep = (path: string): string => {
	return coreSoundPath + "Footsteps/" + path;
};

export const CoreSound = {
	footstepStone: [
		Footstep("Footstep_Stone_01"),
		Footstep("Footstep_Stone_02"),
		Footstep("Footstep_Stone_03"),
		Footstep("Footstep_Stone_04"),
	],
	footstepWool: [
		Footstep("Footstep_Wool_01"),
		Footstep("Footstep_Wool_02"),
		Footstep("Footstep_Wool_03"),
		Footstep("Footstep_Wool_04"),
	],
	footstepGrass: [
		Footstep("Footstep_Grass_01"),
		Footstep("Footstep_Grass_02"),
		Footstep("Footstep_Grass_03"),
		Footstep("Footstep_Grass_04"),
	],
	footstepWood: [
		Footstep("Footstep_Wood_01"),
		Footstep("Footstep_Wood_02"),
		Footstep("Footstep_Wood_03"),
		Footstep("Footstep_Wood_04"),
	],

	// Block: Generic
	blockHitGeneric: [S("GenericBlockPlace")],
	blockBreakGeneric: [S("GenericBlockPlace")],
	blockPlaceGeneric: [S("GenericBlockPlace")],

	// Block: Stone
	blockHitStone: [S("Block_Stone_Hit_01"), S("Block_Stone_Hit_02")],
	blockBreakStone: [S("Block_Stone_Break")],
	blockPlaceStone: [S("Block_Stone_Place_01"), S("Block_Stone_Place_02"), S("Block_Stone_Place_03")],

	// Block: Wool
	blockHitWool: [S("Wool_Hit")],
	blockBreakWool: [S("Wool_Break")],
	blockPlaceWool: [S("Wool_Place")],

	// Block: Wood
	blockHitWood: [S("WoodHit")],
	blockBreakWood: [S("WoodHit")],
	blockPlaceWood: [S("GenericBlockPlace")],

	// Block: Dirt
	blockHitDirt: [S("Blocks/Block_Dirt_Hit_01"), S("Blocks/Block_Dirt_Hit_02"), S("Blocks/Block_Dirt_Hit_03")],
	blockBreakDirt: [S("Blocks/Block_Dirt_Hit_01"), S("Blocks/Block_Dirt_Hit_02"), S("Blocks/Block_Dirt_Hit_03")],
	blockPlaceDirt: [S("Blocks/Block_Dirt_Hit_01"), S("Blocks/Block_Dirt_Hit_02"), S("Blocks/Block_Dirt_Hit_03")],

	chatMessageReceived: S("ChatMessageReceived.wav"),

	purchaseSuccess: S("ItemShopPurchase.wav"),

	bowCharge: S("Items/Bow/Bow_Charge.ogg"),
	bowShoot: S("BowArrowFire"),
};
