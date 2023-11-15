import { Bootstrap } from "@Easy/Core/Shared/Bootstrap/Bootstrap";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { BlockDataAPI, CoreBlockMetaKeys } from "@Easy/Core/Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "@Easy/Core/Shared/VoxelWorld/WorldAPI";
import { BedWars } from "./BedWars/BedWars";
import { RegisterItems } from "./Item/GameItems";
import { TeamUpgradeType } from "./TeamUpgrade/TeamUpgradeType";
import { TeamUpgradeUtil } from "./TeamUpgrade/TeamUpgradeUtil";
import { MatchWorldEvents } from "./World/SharedWorldEvents";

RegisterItems();

Bootstrap.PrepareVoxelWorld();
Bootstrap.Prepare();

if (BedWars.IsMatchMode()) {
	//Initialize shared managers for a match
	MatchWorldEvents.Init();
}

if (RunUtil.IsServer()) {
	require("Server/Resources/TS/MainServer");
} else {
	require("Client/Resources/TS/MainClient");
}
