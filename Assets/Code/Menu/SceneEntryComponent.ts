import { Airship } from "@Easy/Core/Shared/Airship";
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

	private SetColorState(hovered: boolean) {
		this.bgImage.TweenGraphicColor(hovered ? Theme.primary : ColorUtil.HexToColor("616365"), 0.12);
	}

	override Start(): void {
		this.SetColorState(false);
		CanvasAPI.OnHoverEvent(this.button.gameObject, (state) => {
			this.SetColorState(state === HoverState.ENTER);
		});
		CanvasAPI.OnClickEvent(this.button.gameObject, () => {
			if (this.entry.clientSided) {
				Airship.sceneManager.LoadClientSidedScene(this.entry.sceneName);
				return;
			}
			const result = MenuUtil.loadGlobalSceneRequest.client.FireServer(this.entry.sceneName);
			if (result) {
				this.SetColorState(false);
				MenuUtil.menu.Hide();
			}
		});
	}

	override OnDestroy(): void {}
}
