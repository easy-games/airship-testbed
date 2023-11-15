import { Bootstrap } from "@Easy/Core/Shared/Bootstrap/Bootstrap";
import { Flamework } from "@easy-games/flamework-core";
import { BedWars } from "./BedWars/BedWars";

Flamework.AddPath("assets/bundles/server/resources/ts/services/global", "^.*service.lua$");
Flamework.AddPath("assets/bundles/shared/resources/ts/strollers/global", "^.*.lua$");
if (BedWars.IsMatchMode()) {
	Flamework.AddPath("assets/bundles/server/resources/ts/services/match", "^.*service.lua$");
	Flamework.AddPath("assets/bundles/shared/resources/ts/strollers/match", "^.*.lua$");
} else if (BedWars.IsLobbyMode()) {
	Flamework.AddPath("assets/bundles/server/resources/ts/services/lobby", "^.*service.lua$");
	Flamework.AddPath("assets/bundles/shared/resources/ts/strollers/lobby", "^.*.lua$");
}
Flamework.Ignite();

Bootstrap.FinishedSetup();

// Hack to allow require(). Will remove eventually.
export = { _: true };
