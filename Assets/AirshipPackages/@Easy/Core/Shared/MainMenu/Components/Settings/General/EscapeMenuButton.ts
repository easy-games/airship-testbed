import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";

export default class EscapeMenuButton extends AirshipBehaviour {
	public text: TMP_Text;
	public iconImage: Image;
	private bin = new Bin();
	public danger = false;

	override Start(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnHoverEvent(this.gameObject, (hov, data) => {
				if (hov === HoverState.ENTER) {
					if (this.danger) {
						this.text.color = ColorUtil.HexToColor("#EE5F64");
					} else {
						this.text.color = Color.white;
					}
					NativeTween.AnchoredPositionX(this.text.transform, 227, 0.12).SetEaseQuadOut();
				} else {
					this.text.color = ColorUtil.HexToColor("D9D9D9");
					NativeTween.AnchoredPositionX(this.text.transform, 221, 0.12).SetEaseQuadIn();
				}
			}),
		);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
