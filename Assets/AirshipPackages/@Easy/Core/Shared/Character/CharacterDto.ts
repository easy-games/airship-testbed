import { AirshipOutfit } from "../Airship/Types/AirshipPlatformInventory";

export interface CharacterDto {
	id: number;
	netId: number;
	displayName?: string;
	ownerConnectionId?: number;
	outfitDto?: AirshipOutfit;
	health: number;
	maxHealth: number;
}
