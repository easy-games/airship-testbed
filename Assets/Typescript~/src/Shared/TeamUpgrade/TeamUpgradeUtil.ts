import { Dependency } from "@easy-games/flamework-core";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { TeamUpgradeController } from "Client/Controllers/Global/TeamUpgrade/TeamUpgradeController";
import { TeamUpgradeService } from "Server/Services/Match/TeamUpgradeService";
import { TeamUpgrade, TeamUpgrades, TeamUpgradeStateDto, TeamUpgradeTier } from "./TeamUpgradeMeta";
import { TeamUpgradeType } from "./TeamUpgradeType";

/** Set of utilities for interfacing team upgrades. */
export class TeamUpgradeUtil {
	/**
	 * Fetch `TeamUpgrade` meta for a given type.
	 * @param teamUpgradeType A team upgrade type.
	 * @returns `TeamUpgrade` meta that corresponds to type.
	 */
	public static GetTeamUpgradeMeta(teamUpgradeType: TeamUpgradeType): TeamUpgrade {
		return TeamUpgrades[teamUpgradeType];
	}

	/**
	 * Fetch how many tiers a given team upgrade has.
	 * @param teamUpgradeType A team upgrade type.
	 * @returns How many tiers type has.
	 */
	public static GetUpgradeTierCountForType(teamUpgradeType: TeamUpgradeType): number {
		const upgradeMeta = TeamUpgradeUtil.GetTeamUpgradeMeta(teamUpgradeType);
		return upgradeMeta.tiers.size();
	}

	/**
	 * Fetch tier meta for given team upgrade type and tier.
	 * @param teamUpgradeType A team upgrade type.
	 * @param tier A tier. This value is clamped to `1` and `getUpgradeTierCountForType`.
	 */
	public static GetUpgradeTierForType(teamUpgradeType: TeamUpgradeType, tier: number): TeamUpgradeTier {
		const upgradeMeta = TeamUpgradeUtil.GetTeamUpgradeMeta(teamUpgradeType);
		const tiersInType = TeamUpgradeUtil.GetUpgradeTierCountForType(teamUpgradeType);
		const targetTier = math.clamp(tier, 1, tiersInType);
		return upgradeMeta.tiers[targetTier - 1];
	}

	/**
	 * Convert a numeric tier to a roman numeral tier.
	 * @param tier A team upgrade tier.
	 * @returns A roman numeral tier.
	 */
	public static NumericTierToRomanNumeralTier(tier: number): string | undefined {
		if (tier === 1) return "TierI";
		if (tier === 2) return "TierII";
		if (tier === 3) return "TierIII";
		return undefined;
	}

	/**
	 * Fetch upgrade state for a provided upgrade type and player.
	 * @param upgradeType A team upgrade type.
	 * @param player A player.
	 * @returns Upgrade type state for player.
	 */
	public static GetUpgradeStateForPlayer(
		upgradeType: TeamUpgradeType,
		player: Player,
	): TeamUpgradeStateDto | undefined {
		if (RunUtil.IsClient()) {
			return Dependency<TeamUpgradeController>().localUpgradeMap.get(upgradeType);
		} else {
			return Dependency<TeamUpgradeService>().GetUpgradeStateForPlayer(player, upgradeType);
		}
	}
}
