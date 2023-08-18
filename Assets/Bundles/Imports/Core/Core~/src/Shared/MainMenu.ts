import { CoreContext } from "./CoreClientContext";
import { Game } from "./Game";

Game.Context = CoreContext.MAIN_MENU;

const client = require("Imports/Core/Client/Resources/TS/MainClient") as {
	SetupClient: (context: CoreContext) => void;
};
client.SetupClient(CoreContext.MAIN_MENU);

const mainMenuLoadingScreen = GameObject.Find("MainMenuLoadingScreen").GetComponent<MainMenuLoadingScreen>();
mainMenuLoadingScreen.Close();
