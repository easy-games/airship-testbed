import { OutfitDto } from "../Airship/Types/Outputs/AirshipPlatformInventory";

export interface CharacterDto {
	id: number;
	netId: number;
	displayName?: string;
	ownerConnectionId?: number;
	outfitDto?: OutfitDto;
}
