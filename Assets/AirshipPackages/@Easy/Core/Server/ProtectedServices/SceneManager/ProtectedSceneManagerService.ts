import { OnStart, Service } from "@Easy/Core/Shared/Flamework";

@Service({})
export class ProtectedSceneManagerService implements OnStart {
	OnStart(): void {
		contextbridge.callback<(sceneName: string) => void>(
			"SceneManager:LoadGlobalSceneByName",
			(fromContext, sceneName) => {
				print("Loading scene: " + sceneName);
				Bridge.LoadGlobalSceneByName(sceneName);
				print("loaded!");
			},
		);

		contextbridge.callback<(sceneName: string) => void>(
			"SceneManager:UnloadGlobalSceneByName",
			(fromContext, sceneName) => {
				Bridge.UnloadGlobalSceneByName(sceneName);
			},
		);

		contextbridge.callback("SceneManager:GetActiveSceneName", (fromContext) => {
			return SceneManager.GetActiveScene().name;
		});
	}
}
