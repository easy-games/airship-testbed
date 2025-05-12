import { ContentServiceOutfits } from "../TypePackages/content-service-types";

export interface CharacterDto {
	id: number;
	netId: number;
	displayName?: string;
	ownerConnectionId?: number;
	outfitDto?: ContentServiceOutfits.SelectedOutfit;
	health: number;
	maxHealth: number;
}
