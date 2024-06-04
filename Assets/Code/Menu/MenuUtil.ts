import { Airship } from "@Easy/Core/Shared/Airship";
import { RemoteFunction } from "@Easy/Core/Shared/Network/RemoteFunction";
import Menu from "./Menu";
import { SceneEntry } from "./SceneEntry";

export class MenuUtil {
	public static scenes: SceneEntry[] = [
		{
			title: "Movement",
			subtitle: "Varying surfaces to test character movement.",
			sceneName: "AirshipPlatformDemo",
		},
		{
			title: "Client Sided",
			subtitle: "A scene that is only loaded on your local client.",
			sceneName: "ClientSidedScene",
			clientSided: true,
		},
		{
			title: "Multi Networked Scenes",
			subtitle: "Loading multiple networked scenes per player.",
			sceneName: "MultiScene_Base",
		},
	];

	public static loadGlobalSceneRequest = new RemoteFunction<string, boolean>("LoadGlobalScene");
	public static unloadGlobalSceneRequest = new RemoteFunction<string, boolean>("UnloadGlobalScene");

	public static menu: Menu;

	public static BackToMenu() {
		const activeScene = Airship.sceneManager.GetActiveScene().name;
		if (activeScene === "Menu") {
			return;
		}

		this.menu.Show();
		this.unloadGlobalSceneRequest.client.FireServer(activeScene);
	}
}
