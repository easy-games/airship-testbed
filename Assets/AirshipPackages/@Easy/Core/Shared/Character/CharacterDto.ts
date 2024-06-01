import { OutfitDto } from "../Airship/Types/Outputs/AirshipPlatformInventory";

export interface CharacterDto {
	id: number;
	objectId: number;
	ownerClientId?: number;
	outfitDto?: OutfitDto;
}
