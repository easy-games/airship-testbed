import { Asset } from "../../Asset";
import { CoreRefs } from "../../CoreRefs";
import { Singleton } from "../../Flamework";
import { Keyboard } from "../../UserInput";
import { AppManager } from "../../Util/AppManager";
import { Bin } from "../../Util/Bin";
import SettingsPage from "../Components/Settings/SettingsPage";
import { SettingsTab } from "../Components/Settings/SettingsPageName";

@Singleton({})
export class SettingsPageSingleton {
	public isOpen = false;
	private openBin = new Bin();
	private keyboard = new Keyboard();

	protected OnStart(): void {}

	public Open(tab?: SettingsTab): void {
		if (this.isOpen) return;
		this.isOpen = true;

		const settingsPage = Object.Instantiate(
			Asset.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/MainMenu/SettingsPage/SettingsPage.prefab"),
			CoreRefs.protectedTransform,
		);
		const canvasGroup = settingsPage.GetComponent<CanvasGroup>();
		const wrapper = settingsPage.transform.GetChild(0);
		wrapper.localScale = Vector3.one.mul(1.1);
		NativeTween.LocalScale(wrapper, Vector3.one, 0.07).SetEaseQuadIn().SetUseUnscaledTime(true);

		if (tab) {
			const settingsPageComp = settingsPage.GetAirshipComponent<SettingsPage>()!;
			settingsPageComp.SetTab(tab);
		}

		AppManager.OpenCustom(
			() => {
				this.Close();
			},
			{
				addToStack: true,
			},
		);

		this.openBin.Add(() => {
			NativeTween.LocalScale(wrapper, Vector3.one.mul(1.1), 0.07).SetEaseQuadOut().SetUseUnscaledTime(true);
			if (canvasGroup)
				NativeTween.CanvasGroupAlpha(canvasGroup, 0, 0.07).SetEaseQuadOut().SetUseUnscaledTime(true);
			task.unscaledDelay(0.07, () => {
				Object.Destroy(settingsPage);
			});
		});
	}

	public Close(): void {
		this.isOpen = false;
		this.openBin.Clean();
	}
}
