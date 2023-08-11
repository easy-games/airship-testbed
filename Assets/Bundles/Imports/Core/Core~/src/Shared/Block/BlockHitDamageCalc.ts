import { Player } from "Shared/Player/Player";
import { Block } from "Shared/VoxelWorld/Block";
import { BreakBlockMeta } from "../Item/ItemMeta";

/**
 * Will return 0 if can't damage.
 */
export function BlockHitDamageCalc(
	player: Player,
	block: Block,
	blockPos: Vector3,
	breakBlockMeta: BreakBlockMeta,
): number {
	let damage = breakBlockMeta.damage;
	// if (BedWars.IsMatchServer()) {
	// 	// BW: disable breaking map blocks
	// 	if (block.itemType !== ItemType.BED) {
	// 		const wasPlacedByUser = BlockDataAPI.GetBlockData<boolean>(blockPos, "placedByUser");
	// 		if (!wasPlacedByUser) {
	// 			return 0;
	// 		}
	// 	}

	// 	// BW: dont allow breaking your own team's bed
	// 	const teamBlockId = BlockDataAPI.GetBlockData<string>(blockPos, "teamId");
	// 	if (teamBlockId !== undefined && teamBlockId === player.GetTeam()?.id) {
	// 		return 0;
	// 	}

	// 	const blockMeta = WorldAPI.GetMainWorld().GetBlockAt(blockPos).itemMeta;
	// 	if (
	// 		breakBlockMeta.extraDamageBlockArchetype !== BlockArchetype.NONE &&
	// 		blockMeta?.block?.blockArchetype === breakBlockMeta.extraDamageBlockArchetype
	// 	) {
	// 		damage += breakBlockMeta.extraDamage;
	// 	}

	// 	const breakSpeedState = TeamUpgradeUtil.GetUpgradeStateForPlayer(TeamUpgradeType.BREAK_SPEED, player);
	// 	if (breakSpeedState && breakSpeedState.currentUpgradeTier > 0) {
	// 		const breakSpeedValue = TeamUpgradeUtil.GetUpgradeTierForType(
	// 			TeamUpgradeType.BREAK_SPEED,
	// 			breakSpeedState.currentUpgradeTier,
	// 		).value;
	// 		damage *= 1 + breakSpeedValue / 100;
	// 	}
	// }
	return damage;
}
