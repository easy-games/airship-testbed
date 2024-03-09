import { OutfitDto } from "../Airship/Types/Outputs/PlatformInventory";
export interface CharacterDto {
    id: number;
    objectId: number;
    ownerClientId?: number;
    outfitDto?: OutfitDto;
}
