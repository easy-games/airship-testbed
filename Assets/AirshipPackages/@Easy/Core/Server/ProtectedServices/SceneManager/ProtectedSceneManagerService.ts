import { Airship } from "@Easy/Core/Shared/Airship";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";

@Service({})
export class ProtectedSceneManagerService implements OnStart {
	private protectedSceneNames = ["corescene", "mainmenu", "login"];

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

				Bridge.LoadScene(sceneName, false, LoadSceneMode.Additive);
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

		contextbridge.callback<(userId: string, sceneName: string, stacked: boolean) => void>(
			"SceneManager:LoadSceneForPlayer",
			(fromContext, userId, sceneName, stacked) => {
				if (this.IsProtectedSceneName(sceneName)) {
					Debug.LogError("Not allowed to load protected scene: " + sceneName);
					return;
				}

				const player = Airship.players.FindByUserId(userId);
				if (!player) {
					error("Failed to load scene for player. Unable to find player with userId: " + userId);
				}
				Bridge.LoadSceneForConnection(player.networkObject.LocalConnection, sceneName, stacked);
			},
		);

		contextbridge.callback<(userId: string, sceneName: string) => void>(
			"SceneManager:UnloadSceneForPlayer",
			(fromContext, userId, sceneName) => {
				if (this.IsProtectedSceneName(sceneName)) {
					Debug.LogError("Not allowed to load protected scene: " + sceneName);
					return;
				}

				const player = Airship.players.FindByUserId(userId);
				if (!player) {
					error("Failed to load scene for player. Unable to find player with userId: " + userId);
				}
				Bridge.UnloadSceneForConnection(player.networkObject.LocalConnection, sceneName);
			},
		);
	}

	public IsProtectedSceneName(sceneName: string): boolean {
		const s = sceneName.lower();
		return this.protectedSceneNames.includes(sceneName);
	}
}
