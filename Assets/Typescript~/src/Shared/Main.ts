import { ItemType } from "Core/Shared/Item/ItemType";
import { Bootstrap } from "Imports/Core/Shared/Bootstrap/Bootstrap";
import { RunUtil } from "Imports/Core/Shared/Util/RunUtil";
import { BlockDataAPI } from "Imports/Core/Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Imports/Core/Shared/VoxelWorld/WorldAPI";
import { BedWars } from "./BedWars/BedWars";
import { RegisterItems } from "./Item/GameItems";
import { TeamUpgradeType } from "./TeamUpgrade/TeamUpgradeType";
import { TeamUpgradeUtil } from "./TeamUpgrade/TeamUpgradeUtil";

RegisterItems();

Bootstrap.PrepareVoxelWorld();
Bootstrap.Prepare();

if (BedWars.IsMatchServer()) {
	WorldAPI.OnBlockHitDamageCalc.Connect((event) => {
		// BW: dont allow breaking your own team's bed
		const teamBlockId = BlockDataAPI.GetBlockData<string>(event.blockPos, "teamId");
		if (teamBlockId !== undefined && teamBlockId === event.entity?.player?.GetTeam()?.id) {
			event.damage = 0;
		}

		// Disable breaking map blocks
		if (event.block.itemType !== ItemType.BED) {
			const canBreak = BlockDataAPI.GetBlockData<number>(event.blockPos, "canBreak");
			if (!canBreak) {
				event.damage = 0;
			}
		}

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

if (RunUtil.IsServer()) {
	require("Server/Resources/TS/MainServer");
} else {
	require("Client/Resources/TS/MainClient");
}
