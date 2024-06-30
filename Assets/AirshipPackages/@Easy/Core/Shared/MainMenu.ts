/**
 * Entry point for the Main Menu while in Main Menu.
 * This is not ran while in-game.
 */

import { CoreContext } from "./CoreClientContext";
import { Game } from "./Game";
Game.coreContext = CoreContext.MAIN_MENU;

import { AvatarUtil } from "@Easy/Core/Shared/Avatar/AvatarUtil";
import { Flamework } from "@Easy/Core/Shared/Flamework";
import { AudioManager } from "./Audio/AudioManager";
import { CoreRefs } from "./CoreRefs";
import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { TimeUtil } from "./Util/TimeUtil";
import { OnFixedUpdate, OnLateUpdate, OnUpdate } from "./Util/Timer";

CoreRefs.Init();

TimeUtil.GetLifetimeSeconds();
CanvasAPI.Init();
AppManager.Init();
AudioManager.Init();
AvatarUtil.Initialize();

// Drive timer:
gameObject.OnUpdate(() => {
	OnUpdate.Fire(TimeUtil.GetDeltaTime());
});
gameObject.OnLateUpdate(() => {
	OnLateUpdate.Fire(TimeUtil.GetDeltaTime());
});
gameObject.OnFixedUpdate(() => {
	OnFixedUpdate.Fire(TimeUtil.GetFixedDeltaTime());
});

Flamework.AddPath("@easy/core/shared", "^.*singleton.ts$");
Flamework.AddPath("@easy/core/client/controllers/airship/user/airshipusercontroller", "^.*controller.ts$");
Flamework.AddPath("@easy/core/shared/player/playerssingleton", "^.*singleton.ts$");
Flamework.AddPath("@easy/core/client/protectedcontrollers", "^.*controller.ts$");
Flamework.AddPath("@easy/core/client/protectedcontrollers", "^.*singleton.ts$");
Flamework.Ignite();

const mainMenuLoadingScreen = GameObject.Find("MainMenuLoadingScreen").GetComponent<MainMenuLoadingScreen>()!;
mainMenuLoadingScreen.Close();
