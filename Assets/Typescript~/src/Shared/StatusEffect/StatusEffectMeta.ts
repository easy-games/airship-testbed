import { StatusEffectType } from "./StatusEffectType";

export interface StatusEffectMeta {
	/** The status effect's display name. */
	name: string;
	/** The status effect's description. */
	description: string;
	/** The **max** tier for status effect. */
	maxTier: number;
}

export interface StatusEffectDto {
	/** The type of status effect. */
	statusEffectType: StatusEffectType;
	/** The status effect's **current** tier. */
	tier: number;
}
