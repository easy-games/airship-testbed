import { Airship } from "@Easy/Core/Shared/Airship";
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

	private showBin = new Bin();

	public Awake(): void {
		MenuUtil.menu = this;
	}

	public Show(): void {
		this.canvas.gameObject.SetActive(true);
		this.camera.gameObject.SetActive(true);

		const mouse = new Mouse();
		const unlockId = mouse.AddUnlocker();
		this.showBin.Add(() => {
			mouse.RemoveUnlocker(unlockId);
		});
	}

	public Hide(): void {
		this.canvas.gameObject.SetActive(false);
		this.camera.gameObject.SetActive(false);
		this.showBin.Clean();
	}

	override Start(): void {
		Airship.LoadingScreen.FinishLoading();
		this.Show();

		this.content.gameObject.ClearChildren();
		for (let entry of MenuUtil.scenes) {
			const go = Object.Instantiate(this.sceneEntryPrefab, this.content);
			const sceneEntryComp = go.GetAirshipComponent<SceneEntryComponent>();
			sceneEntryComp?.Init(entry);
		}

		if (Game.IsServer()) {
			MenuUtil.loadGlobalSceneRequest.server.SetCallback((player, sceneName) => {
				SceneManager.LoadSceneForPlayer(player, sceneName, true);
				return true;
			});
			MenuUtil.unloadGlobalSceneRequest.server.SetCallback((player, sceneName) => {
				SceneManager.UnloadSceneForPlayer(player, sceneName, "Menu");
				return true;
			});
		}

		const keyboard = new Keyboard();
		keyboard.OnKeyDown(Key.P, (event) => {
			task.spawn(() => {
				MenuUtil.BackToMenu();
			});
		});
	}

	override OnDestroy(): void {
		this.showBin.Clean();
	}
}
