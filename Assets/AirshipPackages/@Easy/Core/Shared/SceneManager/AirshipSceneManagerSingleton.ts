import { Airship } from "../Airship";
import { OnStart, Singleton } from "../Flamework";
import { Game } from "../Game";
import { Player } from "../Player/Player";

@Singleton()
export class AirshipSceneManagerSingleton implements OnStart {
	constructor() {
		Airship.sceneManager = this;
	}
	OnStart(): void {}

	/**
	 * Loads scene on the server and for all clients. Future clients will automatically load this scene.
	 *
	 * Global scenes cannot be stacked.
	 *
	 * @param sceneName Name of scene to be loaded.
	 */
	public LoadGlobalScene(sceneName: string): void {
		assert(Game.IsServer(), "LoadGlobalScene() can only be called from the server.");

		contextbridge.invoke("SceneManager:LoadGlobalSceneByName", LuauContext.Protected, sceneName);
	}

	/**
	 * Unloads scene on the server and for all clients.
	 * @param sceneName Name of scene to be unloaded.
	 */
	public UnloadGlobalScene(sceneName: string): void {
		assert(Game.IsServer(), "UnloadGlobalScene() can only be called from the server.");

		contextbridge.invoke("SceneManager:UnloadGlobalSceneByName", LuauContext.Protected, sceneName);
	}

	/**
	 * Loads a scene only on the client. The server will not load the scene.
	 *
	 * Loading is done additively which means this scene will be stacked on any existing scenes.
	 *
	 * @param sceneName Name of scene to be loaded.
	 */
	public LoadClientSidedScene(sceneName: string): void {
		assert(Game.IsClient(), "LoadClientSidedScene can only be called from the client.");

		contextbridge.invoke("SceneManager:LoadClientSidedSceneByName", LuauContext.Protected, sceneName);
	}

	/**
	 * Unloads a scene only on the client. The server will not unload the scene.
	 * @param sceneName Name of scene to be unloaded.
	 */
	public UnloadClientSidedScene(sceneName: string): void {
		assert(Game.IsClient(), "UnloadClientSidedScene can only be called from the client.");

		contextbridge.invoke("SceneManager:UnloadClientSidedSceneByName", LuauContext.Protected, sceneName);
	}

	public LoadSceneForPlayer(player: Player, sceneName: string, stacked = false): void {
		assert(Game.IsServer(), "LoadSceneForPlayer() can only be called from the server.");

		contextbridge.invoke(
			"SceneManager:LoadSceneForPlayer",
			LuauContext.Protected,
			player.userId,
			sceneName,
			stacked,
		);
	}

	public UnloadSceneForPlayer(player: Player, sceneName: string): void {
		assert(Game.IsServer(), "UnloadSceneForPlayer() can only be called from the server.");

		contextbridge.invoke("SceneManager:UnloadSceneForPlayer", LuauContext.Protected, player.userId, sceneName);
	}

	/**
	 * Gets the currently active Scene.
	 * @returns The active scene.
	 */
	public GetActiveScene(): Scene {
		return Bridge.GetActiveScene();
	}
}
