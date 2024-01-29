import { Flamework } from "@easy-games/flamework-core";

Flamework.AddPath("assets/bundles/client/resources/ts/controllers/global", "^.*controller.lua$");
Flamework.AddPath("assets/bundles/shared/resources/ts/strollers/global", "^.*.lua$");
// if (BedWars.IsMatchMode()) {
// 	Flamework.AddPath("assets/bundles/client/resources/ts/controllers/match", "^.*controller.lua$");
// 	Flamework.AddPath("assets/bundles/shared/resources/ts/strollers/match", "^.*.lua$");
// } else if (BedWars.IsLobbyMode()) {
// 	Flamework.AddPath("assets/bundles/client/resources/ts/controllers/lobby", "^.*controller.lua$");
// 	Flamework.AddPath("assets/bundles/shared/resources/ts/strollers/lobby", "^.*.lua$");
// }
Flamework.Ignite();

// const localEntityController = Dependency<LocalEntityController>();
// localEntityController.SetCharacterCameraMode(CharacterCameraMode.ORBIT);
// localEntityController.SetDefaultFirstPerson(false);

// Dependency<LocalEntityController>().SetCharacterCameraMode(CharacterCameraMode.ORBIT);
// Dependency<LocalEntityController>().SetDefaultFirstPerson(false);

// Bootstrap.FinishedSetup();

// Hack to allow require(). Will remove eventually.
export = { _: true };
