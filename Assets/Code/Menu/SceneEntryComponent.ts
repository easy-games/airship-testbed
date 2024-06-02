import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { MenuUtil } from "./MenuUtil";
import { SceneEntry } from "./SceneEntry";

export default class SceneEntryComponent extends AirshipBehaviour {
	public title!: TMP_Text;
	public subtitle!: TMP_Text;
	public entry!: SceneEntry;
	public button!: Button;

	public Init(entry: SceneEntry): void {
		this.entry = entry;
		this.title.text = entry.title;
		this.subtitle.text = entry.subtitle;
	}

	override Start(): void {
		CanvasAPI.OnClickEvent(this.button.gameObject, () => {
			const result = MenuUtil.loadSceneRequest.client.FireServer(this.entry.sceneName);
			if (result) {
				MenuUtil.menu.Hide();
			}
		});
	}

	override OnDestroy(): void {}
}
