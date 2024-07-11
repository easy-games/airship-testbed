import { Game } from "./Game";
import { Player } from "./Player/Player";
import { CSArrayUtil } from "./Util/CSArrayUtil";
import { Signal } from "./Util/Signal";

/**
 * Scene management at run-time.
 */
export class SceneManager {
	/**
	 * Called when a client presence changes within a scene, before the server rebuilds observers.
	 */
	public static readonly onClientPresenceChangeStart = new Signal<
		[clientId: number, sceneName: string, added: boolean]
	>();

	/**
	 * Called when a client presence changes within a scene, after the server rebuilds observers.
	 *
	 * When this is called, the client has fully loaded the scene.
	 */
	public static readonly onClientPresenceChangeEnd = new Signal<
		[clientId: number, sceneName: string, added: boolean]
	>();

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
			player.connectionId,
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
			player.connectionId,
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

	/**
	 * Returns an array of all the game scenes currently open in the hierarchy.
	 *
	 * This does not include any Airship protected scenes.
	 *
	 * @returns Array of scenes in the hierarchy.
	 */
	public static GetScenes(): Scene[] {
		return CSArrayUtil.Convert(Bridge.GetScenes());
	}

	/**
	 * Searches through the Scenes loaded for a Scene with the given name.
	 *
	 * The name has to be without the .unity extension.
	 * The name can be the last part of the name as displayed in the BuildSettings window in which case the first Scene that matches will be returned.
	 * The name can also the be path as displayed in the Build Settings (still without the .unity extension), in which case only the exact match will be returned.
	 * This is case insensitive.
	 *
	 * @param sceneName
	 * @returns A reference to the Scene, if valid. If not, an invalid Scene is returned. Returns undefined if no scene found.
	 */
	public static GetSceneByName(sceneName: string): Scene | undefined {
		for (let scene of this.GetScenes()) {
			if (scene.name === sceneName) {
				return scene;
			}
		}
		return undefined;
	}
}
