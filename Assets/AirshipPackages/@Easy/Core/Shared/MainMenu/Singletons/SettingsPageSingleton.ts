import { AssetCache } from "../../AssetCache/AssetCache";
import { CoreRefs } from "../../CoreRefs";
import { OnStart, Singleton } from "../../Flamework";
import { Keyboard } from "../../UserInput";
import { AppManager } from "../../Util/AppManager";
import { Bin } from "../../Util/Bin";

@Singleton({})
export class SettingsPageSingleton implements OnStart {
	public isOpen = false;
	private openBin = new Bin();
	private keyboard = new Keyboard();

	OnStart(): void {}

	public Open(): void {
		if (this.isOpen) return;
		this.isOpen = true;

		const settingsPage = Object.Instantiate(
			AssetCache.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/MainMenu/SettingsPage/SettingsPage.prefab"),
			CoreRefs.protectedTransform,
		);
		settingsPage.transform.localScale = Vector3.one.mul(1.1);
		settingsPage.transform.TweenLocalScale(Vector3.one, 0.12);

		AppManager.OpenCustom(
			() => {
				this.Close();
			},
			{
				addToStack: true,
			},
		);

		this.openBin.Add(() => {
			Object.Destroy(settingsPage);
		});
	}

	public Close(): void {
		this.isOpen = false;
		this.openBin.Clean();
	}
}
