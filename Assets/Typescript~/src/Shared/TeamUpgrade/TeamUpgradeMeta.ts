import { ItemType } from "Imports/Core/Shared/Item/ItemType";
import { TeamUpgradeType } from "./TeamUpgradeType";

/** Describes a team upgrade tier. */
export interface TeamUpgradeTier {
	/** Team upgrade cost currency. */
	currency: ItemType;
	/** Team upgrade cost in `TeamUpgradeTier.currency`. */
	cost: number;
	/** Upgrade tier description. */
	description: string;
	/** Numeric value to represent tier strength. */
	value: number;
}

/** Describes a team upgrade. */
export interface TeamUpgrade {
	/** The type of team upgrade. */
	type: TeamUpgradeType;
	/** The team upgrade display name. */
	displayName: string;
	/** The upgrade tiers. */
	tiers: TeamUpgradeTier[];
}

/** Describes a team upgrade state. */
export interface TeamUpgradeStateDto {
	/** The team that upgrade state applies to. */
	teamId: string;
	/** The team upgrade. */
	teamUpgrade: TeamUpgrade;
	/** The current upgrade tier. */
	currentUpgradeTier: number;
}

/** Mapping of `TeamUpgradeType` to `TeamUpgrade`. */
export const teamUpgrades: { [key in TeamUpgradeType]: TeamUpgrade } = {
	[TeamUpgradeType.TEAM_GENERATOR]: {
		type: TeamUpgradeType.TEAM_GENERATOR,
		displayName: "Team Generator",
		tiers: [
			{
				currency: ItemType.DIAMOND,
				cost: 4,
				description: "Tier I: +50% Iron",
				value: 50,
			},
			{
				currency: ItemType.DIAMOND,
				cost: 8,
				description: "Tier II: +100% Iron",
				value: 100,
			},
			{
				currency: ItemType.DIAMOND,
				cost: 16,
				description: "Tier III: Spawn Emeralds",
				value: 0,
			},
		],
	},
	[TeamUpgradeType.DIAMOND_GENERATOR]: {
		type: TeamUpgradeType.DIAMOND_GENERATOR,
		displayName: "Diamond Generator",
		tiers: [
			{
				currency: ItemType.DIAMOND,
				cost: 4,
				description: "Tier I: Spawn Diamonds",
				value: 0,
			},
			{
				currency: ItemType.DIAMOND,
				cost: 8,
				description: "Tier II: +100% Speed",
				value: 100,
			},
			{
				currency: ItemType.DIAMOND,
				cost: 12,
				description: "Tier III: +200% Speed",
				value: 200,
			},
		],
	},
	[TeamUpgradeType.DAMAGE]: {
		type: TeamUpgradeType.DAMAGE,
		displayName: "Damage",
		tiers: [
			{
				currency: ItemType.DIAMOND,
				cost: 6,
				description: "Tier I: +25% Damage",
				value: 25,
			},
			{
				currency: ItemType.DIAMOND,
				cost: 12,
				description: "Tier II: +40% Damage",
				value: 40,
			},
			{
				currency: ItemType.DIAMOND,
				cost: 22,
				description: "Tier III: +55% Damage",
				value: 55,
			},
		],
	},
	[TeamUpgradeType.ARMOR_PROTECTION]: {
		type: TeamUpgradeType.ARMOR_PROTECTION,
		displayName: "Armor Protection",
		tiers: [
			{
				currency: ItemType.DIAMOND,
				cost: 6,
				description: "Tier I: +20% Armor",
				value: 20,
			},
			{
				currency: ItemType.DIAMOND,
				cost: 12,
				description: "Tier II: +40% Armor",
				value: 40,
			},
			{
				currency: ItemType.DIAMOND,
				cost: 22,
				description: "Tier III: +60% Armor",
				value: 60,
			},
		],
	},
	[TeamUpgradeType.BREAK_SPEED]: {
		type: TeamUpgradeType.BREAK_SPEED,
		displayName: "Break Speed",
		tiers: [
			{
				currency: ItemType.DIAMOND,
				cost: 3,
				description: "Tier I: +30% Breaking",
				value: 30,
			},
			{
				currency: ItemType.DIAMOND,
				cost: 6,
				description: "Tier II: +60% Breaking",
				value: 60,
			},
			{
				currency: ItemType.DIAMOND,
				cost: 10,
				description: "Tier III: +100% Breaking",
				value: 100,
			},
		],
	},
};
