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

	public Init(name: string, startingValue: number, min: number, max: number, increment: number): void {
		this.titleText.text = name;

		const slider = this.slider.GetComponent<Slider>()!;
		let ignoreNextSliderChange = false;
		let ignoreNextInputFieldChange = false;

		let valRounded = this.ValidateIncrement(math.clamp(startingValue, min, max), increment);
		let textValue = string.format("%.2f", valRounded);

		slider.maxValue = max;
		slider.minValue = min;
		slider.value = valRounded;
		this.inputField.text = textValue;

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnValueChangeEvent(this.inputField.gameObject, () => {
				if (ignoreNextInputFieldChange) {
					ignoreNextInputFieldChange = false;
					return;
				}
				const value = tonumber(this.inputField.text);
				if (value === undefined) return;
				let newValue = this.ValidateIncrement(value, increment);

				ignoreNextSliderChange = true;
				this.onChange.Fire(value);
				slider.value = newValue;
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnValueChangeEvent(this.slider, (value) => {
				let newValue = this.ValidateIncrement(value, increment);

				if (ignoreNextSliderChange) {
					ignoreNextSliderChange = false;
					return;
				}

				this.onChange.Fire(newValue);
				this.inputField.text = string.format("%.2f", newValue);
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

	private ValidateIncrement(value: number, increment: number): number {
		return math.floor(value / increment + 0.5) * increment; // math.floor works better with negative numbers
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
