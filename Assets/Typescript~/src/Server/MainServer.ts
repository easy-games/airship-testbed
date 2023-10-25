import { Bootstrap } from "@Easy/Core/Shared/Bootstrap/Bootstrap";
import { Flamework } from "@easy-games/flamework-core";
import { BedWars } from "./BedWars/BedWars";

Flamework.AddPath("assets/bundles/server/resources/ts/services/global", "^.*service.lua$");
if (BedWars.IsMatchServer()) {
	Flamework.AddPath("assets/bundles/server/resources/ts/services/match", "^.*service.lua$");
} else if (BedWars.IsLobbyServer()) {
	Flamework.AddPath("assets/bundles/server/resources/ts/services/lobby", "^.*service.lua$");
}
Flamework.Ignite();

Bootstrap.FinishedSetup();

// Hack to allow require(). Will remove eventually.
export = { _: true };
