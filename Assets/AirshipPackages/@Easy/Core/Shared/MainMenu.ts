/**
 * Entry point for the Main Menu while in Main Menu.
 * This is not ran while in-game.
 */

import { CoreContext } from "./CoreClientContext";
import { Game } from "./Game";
Game.coreContext = CoreContext.MAIN_MENU;

import { Flamework } from "@Easy/Core/Shared/Flamework";
import { AudioManager } from "./Audio/AudioManager";
import { CoreRefs } from "./CoreRefs";
import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { OnFixedUpdate, OnLateUpdate, OnUpdate } from "./Util/Timer";

CoreRefs.Init();
InputBridge.Instance.SetMouseLocked(false);
InputBridge.Instance.SetCursorVisible(true);

CanvasAPI.Init();
AppManager.Init();
AudioManager.Init();

const fullGo = gameObject as GameObject & {
	OnUpdate(callback: () => void): void;
	OnLateUpdate(callback: () => void): void;
	OnFixedUpdate(callback: () => void): void;
};
// Drive timer:
fullGo.OnUpdate(() => {
	OnUpdate.Fire(Time.deltaTime);
});
fullGo.OnLateUpdate(() => {
	OnLateUpdate.Fire(Time.deltaTime);
});
fullGo.OnFixedUpdate(() => {
	OnFixedUpdate.Fire(Time.fixedDeltaTime);
});

Flamework.AddPath("@easy/core/shared", "^.*singleton.ts$");
Flamework.AddPath("@easy/core/client/controllers/airship/user/airshipusercontroller", "^.*controller.ts$");
Flamework.AddPath("@easy/core/shared/player/airshipplayerssingleton", "^.*singleton.ts$");
Flamework.AddPath("@easy/core/shared/avatar/airshipavatarsingleton", "^.*singleton.ts$");
Flamework.AddPath("@easy/core/client/protectedcontrollers", "^.*controller.ts$");
Flamework.AddPath("@easy/core/client/protectedcontrollers", "^.*singleton.ts$");
Flamework.Ignite();

const mainMenuLoadingScreen = GameObject.Find("MainMenuLoadingScreen").GetComponent<MainMenuLoadingScreen>()!;
mainMenuLoadingScreen.Close();
