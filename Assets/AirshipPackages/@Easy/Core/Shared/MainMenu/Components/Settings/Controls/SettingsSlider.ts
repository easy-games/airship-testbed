import { AudioManager } from "@Easy/Core/Shared/Audio/AudioManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, PointerDirection } from "@Easy/Core/Shared/Util/CanvasAPI";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

export default class SettingsSlider extends AirshipBehaviour {
	public titleText: TMP_Text;
	public inputField: TMP_InputField;
	public slider: GameObject;

	public onChange = new Signal<[val: number]>();

	private bin = new Bin();

	override Start(): void {}

	public Init(name: string, startingValue: number, min: number, max: number): void {
		this.titleText.text = name;

		const slider = this.slider.GetComponent<Slider>()!;

		let valRounded = math.floor(startingValue * 100) / 100;
		slider.value = valRounded;
		this.inputField.text = string.format("%.2f", valRounded);

		slider.maxValue = max;
		slider.minValue = min;

		let ignoreNextSliderChange = false;
		let ignoreNextInputFieldChange = false;

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnValueChangeEvent(this.inputField.gameObject, () => {
				if (ignoreNextInputFieldChange) {
					ignoreNextInputFieldChange = false;
					return;
				}

				const value = tonumber(this.inputField.text);
				if (value === undefined) return;

				ignoreNextSliderChange = true;
				this.onChange.Fire(value);
				slider.value = value;
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnValueChangeEvent(this.slider, (value) => {
				if (ignoreNextSliderChange) {
					ignoreNextSliderChange = false;
					return;
				}

				ignoreNextInputFieldChange = true;
				this.onChange.Fire(value);
				this.inputField.text = math.floor(value * 100) / 100 + "";
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnPointerEvent(this.slider, (direction) => {
				if (direction === PointerDirection.DOWN) {
					this.PlaySelectSound();
				}
			}),
		);
	}

	private PlaySelectSound() {
		AudioManager.PlayGlobal("AirshipPackages/@Easy/Core/Sound/UI_Select.wav");
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
