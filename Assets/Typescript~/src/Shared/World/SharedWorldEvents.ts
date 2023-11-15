import { BlockArchetype } from "@Easy/Core/Shared/Item/ItemMeta";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { BlockDataAPI, CoreBlockMetaKeys } from "@Easy/Core/Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "@Easy/Core/Shared/VoxelWorld/WorldAPI";
import { TeamUpgradeType } from "Shared/TeamUpgrade/TeamUpgradeType";
import { TeamUpgradeUtil } from "Shared/TeamUpgrade/TeamUpgradeUtil";

export class MatchWorldEvents {
	static Init() {
		WorldAPI.OnBlockHitDamageCalc.Connect((event) => {
			// BW: dont allow breaking your own team's bed
			const teamBlockId = BlockDataAPI.GetBlockData<string>(event.blockPos, "teamId");
			if (teamBlockId !== undefined && teamBlockId === event.entity?.player?.GetTeam()?.id) {
				event.damage = 0;
			}

			// Disable breaking map blocks
			if (event.block.itemType !== ItemType.BED) {
				const canBreak = BlockDataAPI.GetBlockData<number>(event.blockPos, CoreBlockMetaKeys.CAN_BREAK);
				if (!canBreak) {
					event.damage = 0;
				}
			}

			//Team Upgrades
			if (event.entity?.player) {
				const upgradeState = TeamUpgradeUtil.GetUpgradeStateForPlayer(
					TeamUpgradeType.BREAK_SPEED,
					event.entity.player,
				);
				if (upgradeState?.currentUpgradeTier) {
					const damageMultiplier = TeamUpgradeUtil.GetUpgradeTierForType(
						TeamUpgradeType.BREAK_SPEED,
						upgradeState.currentUpgradeTier,
					).value;
					event.damage *= 1 + damageMultiplier / 100;
				}
			}
		});
	}
}
