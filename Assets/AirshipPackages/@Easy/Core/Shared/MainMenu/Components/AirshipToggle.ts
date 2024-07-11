import { Bin } from "../../Util/Bin";
import { CanvasAPI } from "../../Util/CanvasAPI";
import { ColorUtil } from "../../Util/ColorUtil";
import { Signal } from "../../Util/Signal";
import { Theme } from "../../Util/Theme";

export default class AirshipToggle extends AirshipBehaviour {
	public onValueChanged = new Signal<boolean>();

	@Header("Variables")
	public value!: boolean;

	@Header("References")
	public button!: Button;
	public bgImage!: Image;
	public handle!: RectTransform;
	public handleImage!: Image;

	private bin = new Bin();

	public OnEnable(): void {
		this.UpdateVisualValue(this.value, true);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.button.gameObject, () => {
				this.SetValue(!this.value);
			}),
		);
	}

	public GetValue(): boolean {
		return this.value;
	}

	public SetValue(val: boolean, instant?: boolean): void {
		this.value = val;
		this.UpdateVisualValue(this.value, instant);
		this.onValueChanged.Fire(this.value);
	}

	private UpdateVisualValue(val: boolean, instant?: boolean): void {
		NativeTween.GraphicColor(this.bgImage,val ? Theme.primary : ColorUtil.HexToColor("BDC0C5"), instant ? 0 : 0.18 )
		NativeTween.AnchoredPositionX(this.handle, val ? 11 : -11, instant ? 0 : 0.18).SetEaseBounceOut();
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
