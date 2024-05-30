import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import SettingsSidebar from "./SettingsSidebar";

export default class SettingsTabButton extends AirshipBehaviour {
	public tab!: GameObject;
	public bgImage!: Image;
	public text!: TMP_Text;
	public iconImage!: Image;

	private bin = new Bin();
	private sidebar!: SettingsSidebar;
	private selected = false;

	public OnEnable(): void {
		this.sidebar = this.gameObject.transform.parent!.gameObject.GetAirshipComponent<SettingsSidebar>()!;
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				this.sidebar.SetSelectedTab(this);
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnHoverEvent(this.gameObject, (hoverState) => {
				if (this.selected) return;
				if (hoverState === HoverState.ENTER) {
					this.bgImage.color = new Color(1, 1, 1, 0.02);
				} else {
					this.bgImage.color = new Color(1, 1, 1, 0);
				}
			}),
		);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}

	public SetSelected(val: boolean) {
		this.selected = val;
		if (val) {
			this.bgImage.color = Theme.primary;
			this.text.color = new Color(1, 1, 1, 1);
			this.iconImage.color = new Color(1, 1, 1, 1);
		} else {
			this.bgImage.color = new Color(0, 0, 0, 0);
			this.text.color = new Color(1, 1, 1, 0.8);
			this.iconImage.color = new Color(1, 1, 1, 0.8);
		}
	}
}
