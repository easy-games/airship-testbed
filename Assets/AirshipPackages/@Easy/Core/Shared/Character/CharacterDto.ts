import { OutfitDto } from "../Airship/Types/Outputs/AirshipPlatformInventory";

export interface CharacterDto {
	id: number;
	netId: number;
	ownerClientId?: number;
	outfitDto?: OutfitDto;
}
