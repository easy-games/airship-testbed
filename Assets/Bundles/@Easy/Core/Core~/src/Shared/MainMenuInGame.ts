/**
 * Entry point for the Main Menu while in-game.
 */

import { AvatarUtil } from "Shared/Avatar/AvatarUtil";
import { Flamework } from "Shared/Flamework";
import { AudioManager } from "./Audio/AudioManager";
import { CoreContext } from "./CoreClientContext";
import { CoreRefs } from "./CoreRefs";
import { Game } from "./Game";
import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { TimeUtil } from "./Util/TimeUtil";
import { OnFixedUpdate, OnLateUpdate, OnUpdate } from "./Util/Timer";

Game.coreContext = CoreContext.GAME;
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

Flamework.AddPath("assets/bundles/@Easy/Core/shared/resources/ts/mainmenu", "^.*singleton.lua$");
Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/mainmenucontrollers", "^.*controller.lua$");
Flamework.Ignite();
