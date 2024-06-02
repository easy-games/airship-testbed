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
	];

	public static loadSceneRequest = new RemoteFunction<string, boolean>("LoadScene");

	public static menu: Menu;

	public static BackToMenu() {
		const currentScene = Airship.sceneManager.GetActiveSceneName();
		this.menu.Show();
		Airship.sceneManager.UnloadGlobalScene(currentScene);
	}
}
