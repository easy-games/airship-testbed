import { Flamework } from "@easy-games/flamework-core";
import { Bootstrap } from "Imports/Core/Shared/Bootstrap/Bootstrap";
import { BedWars } from "./BedWars/BedWars";

Flamework.AddPath("assets/bundles/client/resources/ts/controllers/global", "^.*controller.lua$");
if (BedWars.IsMatchServer()) {
	Flamework.AddPath("assets/bundles/client/resources/ts/controllers/match", "^.*controller.lua$");
} else if (BedWars.IsLobbyServer()) {
	Flamework.AddPath("assets/bundles/client/resources/ts/controllers/lobby", "^.*controller.lua$");
}
Flamework.Ignite();

// Dependency<LocalEntityController>().SetCharacterCameraMode(CharacterCameraMode.ORBIT);

Bootstrap.FinishedSetup();

// Hack to allow require(). Will remove eventually.
export = { _: true };
