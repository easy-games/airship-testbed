import { CoreItemType } from "@Easy/Core/Shared/Item/CoreItemType";

/** Generator pickup range. */
export const GeneratorPickupRange = 1.5;

/** Describes a generator. */
export interface GeneratorCreationConfig {
	/** The type of item a generator produces. */
	item: CoreItemType;
	/** How many `GeneratorConfig.item`s can accumulate on generator before production ceases. */
	stackLimit: number;
	/** Spawn rate in seconds. How often a generator produces `GeneratorConfig.item`. */
	spawnRate: number;
	/**
	 * If this field is set, all players _near_ (see `GeneratorConfig.split.splitRange`)
	 * a generator will recieve loot.
	 */
	split?: {
		/** How far away a player can be from a generator to recieve loot. */
		range: number;
	};
	/** If this field is set, generator will have a world-space label above it. */
	nameLabel?: boolean;
	/**
	 * The override name text
	 */
	nameOverride?: string;
	spawnTimeLabel?: boolean;
}

/** Describes a generator's state. */
export interface GeneratorDto {
	/** Generator position. */
	readonly pos: Vector3;
	/** Generator id. */
	readonly id: string;
	/** The type of item a generator produces. */
	readonly item: CoreItemType;
	/** If this field is set, generator will have a world-space label above it. */
	readonly nameLabel?: boolean;
	readonly spawnTimeLabel?: boolean;

	generatorName?: string;
	startSpawnTime: number;
	spawnRate: number;
}
