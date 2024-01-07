import { DamageType } from "@Easy/Core/Shared/Damage/DamageType";
import { StatusEffectType } from "./StatusEffectType";

export interface StatusEffectMeta {
	/** The status effect's display name. */
	name: string;
	/** The status effect's description. */
	description: string;
	/** The status effect's icon.  */
	icon: string;
	/** The **max** tier for status effect. */
	maxTier: number;
	/** The damage type associated with this status effect, if applicable. */
	damageType?: DamageType;
	/** The color associated with this status effect, if applicable. */
	color?: Color;
}

export interface StatusEffectDto {
	/** The client status effect belongs to. */
	clientId: number;
	/** The type of status effect. */
	statusEffectType: StatusEffectType;
	/** The status effect's **current** tier. */
	tier: number;
}
