import { Airship } from "./Airship";
import { Game } from "./Game";
import { Player } from "./Player/Player";

export class SceneManager {
	constructor() {
		Airship.sceneManager = this;
	}

	OnStart(): void {}

	/**
	 * Sets the scene to be active.
	 * @param scene The scene to be set.
	 * @returns Returns false if the Scene is not loaded yet
	 */
	public static SetActiveScene(scene: Scene): boolean {
		return contextbridge.invoke("SceneManager:SetActiveScene", LuauContext.Protected, scene.name);
	}

	// /**
	//  * Loads scene on the server and for all clients. Future clients will automatically load this scene.
	//  *
	//  * Global scenes cannot be stacked.
	//  *
	//  * @param sceneName Name of scene to be loaded.
	//  */
	// public LoadGlobalScene(sceneName: string): void {
	// 	assert(Game.IsServer(), "LoadGlobalScene() can only be called from the server.");

	// 	contextbridge.invoke("SceneManager:LoadGlobalSceneByName", LuauContext.Protected, sceneName);
	// }

	// /**
	//  * Unloads scene on the server and for all clients.
	//  * @param sceneName Name of scene to be unloaded.
	//  */
	// public UnloadGlobalScene(sceneName: string): void {
	// 	assert(Game.IsServer(), "UnloadGlobalScene() can only be called from the server.");

	// 	contextbridge.invoke("SceneManager:UnloadGlobalSceneByName", LuauContext.Protected, sceneName);
	// }

	/**
	 * Loads a scene only on the local environment. The scene will not have any networking.
	 *
	 * Loading is done additively which means this scene will be stacked on any existing scenes.
	 *
	 * @param sceneName Name of scene to be loaded.
	 */
	public static LoadOfflineScene(sceneName: string): void {
		assert(Game.IsClient(), "LoadClientSidedScene can only be called from the client.");

		contextbridge.invoke("SceneManager:LoadClientSidedSceneByName", LuauContext.Protected, sceneName);
	}

	/**
	 * Unloads a scene only on the local environment.
	 *
	 * @param sceneName Name of scene to be unloaded.
	 */
	public static UnloadOfflineScene(sceneName: string): void {
		assert(Game.IsClient(), "UnloadClientSidedScene can only be called from the client.");

		contextbridge.invoke("SceneManager:UnloadClientSidedSceneByName", LuauContext.Protected, sceneName);
	}

	/**
	 * Loads a scene for this player. This will also load the scene on server if not already open.
	 *
	 * **Must be called from server.**
	 * @param player The player that will have a scene loaded.
	 * @param sceneName The name of the scene to be loaded. Do not include ".unity"
	 * @param makeActiveScene True to set the newly loaded scene as the active scene.
	 */
	public static LoadSceneForPlayer(player: Player, sceneName: string, makeActiveScene = false): void {
		assert(Game.IsServer(), "LoadSceneForPlayer() can only be called from the server.");

		contextbridge.invoke(
			"SceneManager:LoadSceneForPlayer",
			LuauContext.Protected,
			player.clientId,
			sceneName,
			makeActiveScene,
		);
	}

	/**
	 * Unloads the scene for the player.
	 *
	 * If no players are remaining in the scene, the server will also unload the scene.
	 *
	 * **Must be called from server.**
	 * @param player The player that will have the scene unloaded.
	 * @param sceneName The name of scene to be unloaded. Do not include ".unity"
	 * @param preferredActiveScene Name of scene to be made the new active scene.
	 */
	public static UnloadSceneForPlayer(
		player: Player,
		sceneName: string,
		preferredActiveScene: string | undefined = undefined,
	): void {
		assert(Game.IsServer(), "UnloadSceneForPlayer() can only be called from the server.");

		contextbridge.invoke(
			"SceneManager:UnloadSceneForPlayer",
			LuauContext.Protected,
			player.clientId,
			sceneName,
			preferredActiveScene,
		);
	}

	/**
	 * Gets the currently active Scene.
	 * @returns The active scene.
	 */
	public static GetActiveScene(): Scene {
		return Bridge.GetActiveScene();
	}

	/**
	 * Move a GameObject from its current Scene to a new Scene.
	 *
	 * You can only move root GameObjects from one Scene to another.
	 * This means the GameObject to move must not be a child of any other GameObject in its Scene.
	 * This only works on GameObjects being moved to a Scene that is already loaded (additive).
	 * If you want to load single Scenes, make sure to use DontDestroyOnLoad on the GameObject you would like to move to a new Scene, otherwise Unity deletes it when it loads a new Scene.
	 *
	 * @param gameObject
	 * @param scene
	 */
	public static MoveGameObjectToScene(gameObject: GameObject, scene: Scene): void {
		Bridge.MoveGameObjectToScene(gameObject, scene);
	}
}
