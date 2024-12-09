import { NetworkFunction } from "@Easy/Core/Shared/Network/NetworkFunction";
import { SceneManager } from "@Easy/Core/Shared/SceneManager";
import Menu from "./Menu";
import { SceneEntry } from "./SceneEntry";

export class MenuUtil {
	public static scenes: SceneEntry[] = [
		{
			title: "Movement",
			subtitle: "Varying surfaces to test character movement.",
			sceneName: "Movement",
		},
		{
			title: "Movement Manipulation",
			subtitle: "Testing changing the movement dynamically at runtime",
			sceneName: "MovementMods",
		},
		{
			title: "Predicted Movement",
			subtitle: "Server Auth Client Predicted movement",
			sceneName: "ClientPrediction",
		},
		{
			title: "Rigidbodies",
			subtitle: "Cubes with physics!",
			sceneName: "RigidBodies",
		},
		{
			title: "Client Sided",
			subtitle: "A scene that is only loaded on your local client.",
			sceneName: "ClientSidedScene",
			clientSided: true,
		},
		{
			title: "NavMesh",
			subtitle: "Unity NavMesh API",
			sceneName: "NavMesh",
		},
		{
			title: "Post Processing",
			subtitle: "Post processing volumes",
			sceneName: "PostProcessing",
		},
		{
			title: "Matchmaking",
			subtitle: "Matchmaking testing scene.",
			sceneName: "Matchmaking",
		},
	];

	public static loadGlobalSceneRequest = new NetworkFunction<string, boolean>("LoadGlobalScene");
	public static unloadGlobalSceneRequest = new NetworkFunction<string, boolean>("UnloadGlobalScene");

	public static menu: Menu;

	public static BackToMenu() {
		const activeScene = SceneManager.GetActiveScene().name;
		if (activeScene === "Menu") {
			return;
		}

		this.menu.Show();
		this.unloadGlobalSceneRequest.client.FireServer(activeScene);
	}
}
