import { AudioManager } from "./Audio/AudioManager";
import { CoreContext } from "./CoreClientContext";
import { Game } from "./Game";
import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { TimeUtil } from "./Util/TimeUtil";

Game.Context = CoreContext.MAIN_MENU;

TimeUtil.GetLifetimeSeconds();
CanvasAPI.Init();
AppManager.Init();
AudioManager.Init();

const client = require("Imports/Core/Client/Resources/TS/MainClient") as {
	SetupClient: (context: CoreContext) => void;
};
client.SetupClient(CoreContext.MAIN_MENU);

const mainMenuLoadingScreen = GameObject.Find("MainMenuLoadingScreen").GetComponent<MainMenuLoadingScreen>();
mainMenuLoadingScreen.Close();
