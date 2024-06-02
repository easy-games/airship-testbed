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
	}

	public IsProtectedSceneName(sceneName: string): boolean {
		const s = sceneName.lower();
		return this.protectedSceneNames.includes(sceneName);
	}
}
