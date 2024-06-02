import { Airship } from "../Airship";
import { OnStart, Singleton } from "../Flamework";
import { Game } from "../Game";

@Singleton()
export class AirshipSceneManagerSingleton implements OnStart {
	constructor() {
		Airship.sceneManager = this;
	}
	OnStart(): void {}

	public LoadGlobalScene(sceneName: string): void {
		assert(Game.IsServer(), "LoadGlobalScene() can only be called from the server.");

		contextbridge.invoke("SceneManager:LoadGlobalSceneByName", LuauContext.Protected, sceneName);
	}

	public UnloadGlobalScene(sceneName: string): void {
		assert(Game.IsServer(), "UnloadGlobalScene() can only be called from the server.");

		contextbridge.invoke("SceneManager:UnloadGlobalSceneByName", LuauContext.Protected, sceneName);
	}

	public LoadClientSidedScene(sceneName: string): void {
		assert(Game.IsClient(), "LoadClientSidedScene can only be called from the client.");

		contextbridge.invoke("SceneManager:LoadClientSidedSceneByName", LuauContext.Protected, sceneName);
	}

	public UnloadClientSidedScene(sceneName: string): void {
		assert(Game.IsClient(), "UnloadClientSidedScene can only be called from the client.");

		contextbridge.invoke("SceneManager:UnloadClientSidedSceneByName", LuauContext.Protected, sceneName);
	}

	public GetActiveScene(): Scene {
		return Bridge.GetActiveScene();
	}
}
