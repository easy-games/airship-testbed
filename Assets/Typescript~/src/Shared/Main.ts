import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { BedWars } from "./BedWars/BedWars";
import { RegisterItems } from "./Item/GameItems";
import { MatchWorldEvents } from "./World/SharedWorldEvents";

RegisterItems();

if (BedWars.IsMatchMode()) {
	//Initialize shared managers for a match
	MatchWorldEvents.Init();
}

if (RunUtil.IsServer()) {
	require("Server/Resources/TS/MainServer");
}
if (RunUtil.IsClient()) {
	require("Client/Resources/TS/MainClient");
}
