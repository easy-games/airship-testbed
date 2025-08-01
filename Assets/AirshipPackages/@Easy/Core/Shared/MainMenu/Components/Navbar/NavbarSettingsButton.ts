import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";
import { SettingsPageSingleton } from "../../Singletons/SettingsPageSingleton";
import { SettingsTab } from "../Settings/SettingsPageName";

export default class NavbarSettingsButton extends AirshipBehaviour {
	public bgImage!: Image;

	private bin = new Bin();

	override Start(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				Dependency<SettingsPageSingleton>().Open(SettingsTab.Account);
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnHoverEvent(this.gameObject, (hov) => {
				this.bgImage.color = hov === HoverState.ENTER ? new Color(1, 1, 1, 0.07) : new Color(1, 1, 1, 0);
			}),
		);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
