import { SceneManager } from "@Easy/Core/Shared/SceneManager";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import { MenuUtil } from "./MenuUtil";
import { SceneEntry } from "./SceneEntry";

export default class SceneEntryComponent extends AirshipBehaviour {
	public title!: TMP_Text;
	public subtitle!: TMP_Text;
	public entry!: SceneEntry;
	public button!: Button;
	public bgImage!: Image;

	public Init(entry: SceneEntry): void {
		this.entry = entry;
		this.title.text = entry.title;
		this.subtitle.text = entry.subtitle;
	}

	private SetColorState(hovered: boolean, immediate?: boolean) {
		if (immediate) {
			this.bgImage.color = hovered ? Theme.primary : ColorUtil.HexToColor("444A4D");
			return;
		}
		NativeTween.GraphicColor(this.bgImage, hovered ? Theme.primary : ColorUtil.HexToColor("444A4D"), 0.12)
	}

	override Start(): void {
		this.SetColorState(false);
		CanvasAPI.OnHoverEvent(this.button.gameObject, (state) => {
			this.SetColorState(state === HoverState.ENTER);
		});
		CanvasAPI.OnClickEvent(this.button.gameObject, () => {
			if (this.entry.clientSided) {
				SceneManager.LoadOfflineScene(this.entry.sceneName);
				return;
			}

			this.SetColorState(false, true);
			const result = MenuUtil.loadGlobalSceneRequest.client.FireServer(this.entry.sceneName);
			if (result) {
				MenuUtil.menu.Hide();
			}
		});
	}

	override OnDestroy(): void {}
}
