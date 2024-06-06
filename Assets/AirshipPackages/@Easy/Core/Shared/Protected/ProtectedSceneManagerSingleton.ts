import { OnStart, Singleton } from "@Easy/Core/Shared/Flamework";

interface UnitySceneManagerConstructor {
	new (): UnitySceneManagerConstructor;
	GetSceneByName(sceneName: string): Scene;
	SetActiveScene(scene: Scene): void;
	GetActiveScene(): Scene;
}
declare const SceneManager: UnitySceneManagerConstructor;

/**
 * @protected
 */
@Singleton()
export class ProtectedSceneManagerSingleton implements OnStart {
	private protectedSceneNames = ["corescene", "mainmenu", "login"];

	constructor() {
		const scriptingManager = GameObject.Find("CoreScriptingManager").GetComponent<CoreScriptingManager>()!;
		scriptingManager.OnClientPresenceChangeStart((scene, connection, added) => {
			print("presence start " + scene.name);
			contextbridge.broadcast("SceneManager:OnClientPresenceChangeStart", scene.name, connection.ClientId, added);
		});
		scriptingManager.OnClientPresenceChangeStart((scene, connection, added) => {
			print("presence end " + scene.name);
			contextbridge.broadcast("SceneManager:OnClientPresenceChangeEnd", scene.name, connection.ClientId, added);
		});
	}

	OnStart(): void {
		contextbridge.callback<(sceneName: string) => void>(
			"SceneManager:LoadGlobalSceneByName",
			(fromContext, sceneName) => {
				if (this.IsProtectedSceneName(sceneName)) {
					Debug.LogError("Not allowed to load protected scene: " + sceneName);
					return;
				}

				Bridge.LoadGlobalSceneByName(sceneName);
			},
		);

		contextbridge.callback<(sceneName: string) => void>(
			"SceneManager:UnloadGlobalSceneByName",
			(fromContext, sceneName) => {
				if (this.IsProtectedSceneName(sceneName)) {
					Debug.LogError("Not allowed to unload protected scene: " + sceneName);
					return;
				}

				Bridge.UnloadGlobalSceneByName(sceneName);
			},
		);

		contextbridge.callback("SceneManager:GetActiveSceneName", (fromContext) => {
			return SceneManager.GetActiveScene().name;
		});

		contextbridge.callback<(sceneName: string) => void>(
			"SceneManager:LoadClientSidedSceneByName",
			(fromContext, sceneName) => {
				if (this.IsProtectedSceneName(sceneName)) {
					Debug.LogError("Not allowed to load protected scene: " + sceneName);
					return;
				}

				Bridge.LoadSceneFromAssetBundle(sceneName, LoadSceneMode.Additive);
			},
		);

		contextbridge.callback<(sceneName: string) => void>(
			"SceneManager:UnloadClientSidedSceneByName",
			(fromContext, sceneName) => {
				if (this.IsProtectedSceneName(sceneName)) {
					Debug.LogError("Not allowed to unload protected scene: " + sceneName);
					return;
				}

				Bridge.UnloadScene(sceneName);
			},
		);

		contextbridge.callback<(clientId: number, sceneName: string, makeActiveScene: boolean) => void>(
			"SceneManager:LoadSceneForPlayer",
			(fromContext, clientId, sceneName, makeActiveScene) => {
				if (this.IsProtectedSceneName(sceneName)) {
					Debug.LogError("Not allowed to load protected scene: " + sceneName);
					return;
				}

				const connection = InstanceFinder.ServerManager.Clients.Get(clientId);
				if (!connection) {
					error("Failed to load scene for player. Unable to find player with clientId: " + clientId);
				}
				Bridge.LoadSceneForConnection(connection, sceneName, makeActiveScene);
			},
		);

		contextbridge.callback<(clientId: number, sceneName: string, preferredActiveScene: string | undefined) => void>(
			"SceneManager:UnloadSceneForPlayer",
			(fromContext, clientId, sceneName, preferredActiveScene) => {
				if (this.IsProtectedSceneName(sceneName)) {
					error("Not allowed to load protected scene: " + sceneName);
				}
				if (preferredActiveScene && this.IsProtectedSceneName(preferredActiveScene)) {
					error("Not allowed to set active scene to a protected scene: " + preferredActiveScene);
				}

				const connection = InstanceFinder.ServerManager.Clients.Get(clientId);
				if (!connection) {
					error("Failed to load scene for player. Unable to find player with clientId: " + clientId);
				}
				Bridge.UnloadSceneForConnection(connection, sceneName, preferredActiveScene ?? "");
			},
		);

		contextbridge.callback<(sceneName: string) => void>("SceneManager:SetActiveScene", (fromContext, sceneName) => {
			if (this.IsProtectedSceneName(sceneName)) {
				Debug.LogError("Not allowed to set active scene to a protected scene: " + sceneName);
				return false;
			}

			let scene = SceneManager.GetSceneByName(sceneName);
			if (!scene) {
				Debug.LogError("Scene not found: " + sceneName);
				return false;
			}
			return SceneManager.SetActiveScene(scene);
		});
	}

	public IsProtectedSceneName(sceneName: string): boolean {
		const s = sceneName.lower();
		return this.protectedSceneNames.includes(sceneName);
	}
}
