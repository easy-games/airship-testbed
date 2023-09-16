import { MathUtil } from "Shared/Util/MathUtil";
import { BlockHitDamageFunc } from "./BlockHitDamageFunc";
import { World } from "./World";

export class WorldAPI {
	private static world: World | undefined;
	public static DefaultVoxelHealth = 10;
	public static ChildVoxelId = 32;

	public static GetMainWorld(): World {
		if (this.world) {
			return this.world;
		}

		const voxelWorld = GameObject.Find("VoxelWorld").GetComponent<VoxelWorld>();
		this.world = new World(voxelWorld);
		return this.world;
	}

	public static GetVoxelPosition(worldPosition: Vector3) {
		return MathUtil.FloorVec(worldPosition);
	}

	public static BlockHitDamageFunc: BlockHitDamageFunc = (player, block, blockPos, breakBlockMeta) => {
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

		return breakBlockMeta.damage;
	};
}
