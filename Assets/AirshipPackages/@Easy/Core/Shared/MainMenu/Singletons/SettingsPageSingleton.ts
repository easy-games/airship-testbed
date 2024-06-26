import { AssetCache } from "../../AssetCache/AssetCache";
import { CoreRefs } from "../../CoreRefs";
import { Singleton } from "../../Flamework";
import { Keyboard } from "../../UserInput";
import { AppManager } from "../../Util/AppManager";
import { Bin } from "../../Util/Bin";

@Singleton({})
export class SettingsPageSingleton {
	public isOpen = false;
	private openBin = new Bin();
	private keyboard = new Keyboard();

	protected OnStart(): void {}

	public Open(): void {
		if (this.isOpen) return;
		this.isOpen = true;

		const settingsPage = Object.Instantiate(
			AssetCache.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/MainMenu/SettingsPage/SettingsPage.prefab"),
			CoreRefs.protectedTransform,
		);
		const canvasGroup = settingsPage.GetComponent<CanvasGroup>();
		const wrapper = settingsPage.transform.GetChild(0);
		wrapper.localScale = Vector3.one.mul(1.1);
		wrapper.TweenLocalScale(Vector3.one, 0.07).SetEaseQuadIn();

		AppManager.OpenCustom(
			() => {
				this.Close();
			},
			{
				addToStack: true,
			},
		);

		this.openBin.Add(() => {
			wrapper.TweenLocalScale(Vector3.one.mul(1.1), 0.07).SetEaseQuadOut();
			canvasGroup?.TweenCanvasGroupAlpha(0, 0.07).SetEaseQuadOut();
			task.delay(0.07, () => {
				Object.Destroy(settingsPage);
			});
		});
	}

	public Close(): void {
		this.isOpen = false;
		this.openBin.Clean();
	}
}
