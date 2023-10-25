import { AudioManager } from "./Audio/AudioManager";
import { CoreContext } from "./CoreClientContext";
import { Game } from "./Game";
import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { TimeUtil } from "./Util/TimeUtil";
import { OnFixedUpdate, OnLateUpdate, OnUpdate } from "./Util/Timer";

Game.Context = CoreContext.MAIN_MENU;

TimeUtil.GetLifetimeSeconds();
CanvasAPI.Init();
AppManager.Init();
AudioManager.Init();

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

const client = require("@Easy/Core/Client/Resources/TS/MainClient") as {
	SetupClient: (context: CoreContext) => void;
};
client.SetupClient(CoreContext.MAIN_MENU);

const mainMenuLoadingScreen = GameObject.Find("MainMenuLoadingScreen").GetComponent<MainMenuLoadingScreen>();
mainMenuLoadingScreen.Close();
