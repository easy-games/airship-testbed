import { KitType } from "./KitType";

export interface Kit {
	/** The kit's name. */
	name: string;
	/** The kit's description. */
	description: string;
}

/** Mapping of **ALL** BedWars kits to their respective kit metas. */
export const bedwarsKits: { [key in KitType]: Kit } = {
	[KitType.NONE]: {
		name: "None",
		description: "Just you!",
	},
};
