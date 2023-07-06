import { BedWars } from "Shared/BedWars/BedWars";
import { Player } from "Shared/Player/Player";
import { TeamUpgradeType } from "Shared/TeamUpgrades/TeamUpgradeType";
import { TeamUpgradeUtil } from "Shared/TeamUpgrades/TeamUpgradeUtil";
import { VoxelDataAPI } from "Shared/VoxelWorld/VoxelData/VoxelDataAPI";
import { BlockArchetype, BreakBlockMeta } from "../Item/ItemMeta";
import { WorldAPI } from "../VoxelWorld/WorldAPI";

/**
 * Will return 0 if can't damage.
 */
export function BlockHitDamageCalc(player: Player, blockPos: Vector3, breakBlockMeta: BreakBlockMeta): number {
	let damage = breakBlockMeta.damage;
	if (BedWars.IsMatchServer()) {
		// BedWars: disable breaking map blocks
		const wasPlacedByUser = VoxelDataAPI.GetVoxelData<boolean>(blockPos, "placedByUser");
		if (!wasPlacedByUser) {
			return 0;
		}

		// BedWars: dont allow breaking your own team's bed
		const teamBlockId = VoxelDataAPI.GetVoxelData<string>(blockPos, "teamId");
		if (teamBlockId !== undefined && teamBlockId === player.GetTeam()?.id) {
			return 0;
		}

		const blockMeta = WorldAPI.GetMainWorld().GetBlockAt(blockPos).itemMeta;
		if (
			breakBlockMeta.extraDamageBlockArchetype !== BlockArchetype.NONE &&
			blockMeta?.block?.blockArchetype === breakBlockMeta.extraDamageBlockArchetype
		) {
			damage += breakBlockMeta.extraDamage;
		}

		const breakSpeedState = TeamUpgradeUtil.GetUpgradeStateForPlayer(TeamUpgradeType.BREAK_SPEED, player);
		if (breakSpeedState && breakSpeedState.currentUpgradeTier > 0) {
			const breakSpeedValue = TeamUpgradeUtil.GetUpgradeTierForType(
				TeamUpgradeType.BREAK_SPEED,
				breakSpeedState.currentUpgradeTier,
			).value;
			damage *= 1 + breakSpeedValue / 100;
		}
	}
	return damage;
}
