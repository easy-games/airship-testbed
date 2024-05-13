/**
 * Entry point for the Main Menu while in Main Menu.
 * This is not ran while in-game.
 */

import { AvatarUtil } from "@Easy/Core/Shared/Avatar/AvatarUtil";
import { Flamework } from "@Easy/Core/Shared/Flamework";
import { AudioManager } from "./Audio/AudioManager";
import { CoreContext } from "./CoreClientContext";
import { CoreRefs } from "./CoreRefs";
import { Game } from "./Game";
import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { TimeUtil } from "./Util/TimeUtil";
import { OnFixedUpdate, OnLateUpdate, OnUpdate } from "./Util/Timer";

Game.coreContext = CoreContext.MAIN_MENU;
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

Flamework.AddPath("assets/bundles/@Easy/Core/shared/resources/ts", "^.*singleton.lua$");
Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/protectedcontrollers", "^.*controller.lua$");
Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/protectedcontrollers", "^.*singleton.lua$");
Flamework.Ignite();

const mainMenuLoadingScreen = GameObject.Find("MainMenuLoadingScreen").GetComponent<MainMenuLoadingScreen>()!;
mainMenuLoadingScreen.Close();
