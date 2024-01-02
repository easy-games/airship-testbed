import { AbilityId } from "Shared/Abilities/AbilityType";
import { KitType } from "./KitType";

export interface Kit {
	/** The kit's name. */
	name: string;
	/** The kit's description. */
	description: string;
	/** The kit's active abilities. */
	activeAbilities: AbilityId[];
	/** The kit's passive abilities. */
	passiveAbilities: AbilityId[];
}

/** Mapping of **ALL** BedWars kits to their respective kit metas. */
export const BedwarsKits: { [key in KitType]: Kit } = {
	[KitType.NONE]: {
		name: "None",
		description: "Just you!",
		activeAbilities: [],
		passiveAbilities: [],
	},
};
