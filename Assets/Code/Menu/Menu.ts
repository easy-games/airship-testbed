import { Game } from "@Easy/Core/Shared/Game";
import { SceneManager } from "@Easy/Core/Shared/SceneManager";
import { Keyboard, Mouse } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { MenuUtil } from "./MenuUtil";
import SceneEntryComponent from "./SceneEntryComponent";

export default class Menu extends AirshipBehaviour {
	public sceneEntryPrefab!: GameObject;
	public content!: RectTransform;
	public canvas!: Canvas;
	public camera!: Camera;
	public scrollRect: ScrollRect;

	private showBin = new Bin();

	public Awake(): void {
		MenuUtil.menu = this;
	}

	public Show(): void {
		this.canvas.gameObject.SetActive(true);
		this.camera.gameObject.SetActive(true);

		this.showBin.Add(Mouse.AddUnlocker());
	}

	public Hide(): void {
		this.canvas.gameObject.SetActive(false);
		this.camera.gameObject.SetActive(false);
		this.showBin.Clean();
	}

	override Start(): void {
		if (Game.IsClient()) {
			this.Show();
			this.content.gameObject.ClearChildren();
			for (let entry of MenuUtil.scenes) {
				const go = Object.Instantiate(this.sceneEntryPrefab, this.content);
				const sceneEntryComp = go.GetAirshipComponent<SceneEntryComponent>();
				sceneEntryComp?.Init(entry);
				const redirectScroll = go.GetComponent<AirshipRedirectScroll>();
				redirectScroll.redirectTarget = this.scrollRect;
			}
		} else {
			this.Hide();
		}

		if (Game.IsServer()) {
			MenuUtil.loadGlobalSceneRequest.server.SetCallback((player, sceneName) => {
				if (Game.IsServer() && !Game.IsClient() && !this.IsSceneLoaded(sceneName)) {
					SceneManager.LoadScene(sceneName);
					SceneManager.SetActiveScene(SceneManager.GetSceneByName(sceneName)!);
				}
				SceneManager.LoadSceneForPlayer(player, sceneName, true);
				return true;
			});
			MenuUtil.unloadGlobalSceneRequest.server.SetCallback((player, sceneName) => {
				SceneManager.UnloadSceneForPlayer(player, sceneName);
				if (Game.IsServer() && !Game.IsClient() && this.IsSceneLoaded(sceneName)) {
					SceneManager.UnloadScene(sceneName);
				}
				return true;
			});
		}

		Keyboard.OnKeyDown(Key.P, (event) => {
			task.spawn(() => {
				MenuUtil.BackToMenu();
			});
		});
	}

	private IsSceneLoaded(sceneName: string): boolean {
		return SceneManager.GetScenes().find((s) => s.name === sceneName) !== undefined;
	}

	override OnDestroy(): void {
		this.showBin.Clean();
	}
}
