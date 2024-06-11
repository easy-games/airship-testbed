import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import SettingsSidebar from "./SettingsSidebar";

export default class SettingsTabButton extends AirshipBehaviour {
	public tab?: GameObject;
	public bgImage!: Image;
	public text!: TMP_Text;
	public iconImage!: Image;
	public dangerBtn = false;

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

				let color = this.bgImage.color;
				if (hoverState === HoverState.ENTER) {
					color.a = 0.5;
				} else {
					color.a = 0;
				}
				this.bgImage.color = color;
				if (this.dangerBtn) {
					this.text.color =
						hoverState === HoverState.ENTER ? ColorUtil.HexToColor("#FF6D6D") : new Color(1, 1, 1, 0.8);
					this.iconImage.color =
						hoverState === HoverState.ENTER ? ColorUtil.HexToColor("#FF6D6D") : new Color(1, 1, 1, 0.8);
				}
			}),
		);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}

	public SetSelected(val: boolean) {
		this.selected = val;
		let color = this.bgImage.color;
		if (val) {
			color.a = 1;
			// this.text.color = new Color(1, 1, 1, 1);
			// this.iconImage.color = new Color(1, 1, 1, 1);
		} else {
			color.a = 0;
			// this.text.color = new Color(1, 1, 1, 0.8);
			// this.iconImage.color = new Color(1, 1, 1, 0.8);
		}
		this.bgImage.color = color;
		if (this.dangerBtn) {
			this.text.color = val ? ColorUtil.HexToColor("#FF6D6D") : new Color(1, 1, 1, 0.8);
			this.iconImage.color = val ? ColorUtil.HexToColor("#FF6D6D") : new Color(1, 1, 1, 0.8);
		}
	}
}
