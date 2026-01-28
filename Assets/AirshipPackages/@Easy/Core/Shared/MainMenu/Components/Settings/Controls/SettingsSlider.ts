import { AudioManager } from "@Easy/Core/Shared/Audio/AudioManager";
import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, PointerDirection } from "@Easy/Core/Shared/Util/CanvasAPI";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

export default class SettingsSlider extends AirshipBehaviour {
	public titleText: TMP_Text;
	public inputField: TMP_InputField;
	public slider: GameObject;

	public onChange = new Signal<[val: number]>();
	private lastValue: number;

	private bin = new Bin();

	override Start(): void {}

	public Init(name: string, startingValue: number, min: number, max: number, increment: number = 0.01): void {
		this.titleText.text = name;

		const slider = this.slider.GetComponent<Slider>()!;
		let ignoreNextSliderChange = false;
		let ignoreNextFieldChange = false;

		let valRounded = this.ValidateIncrement(math.floor(startingValue * 100) / 100, increment);

		let textValue = this.FormatValueForDisplay(valRounded, increment);

		slider.maxValue = max;
		slider.minValue = min;
		slider.value = valRounded;
		this.lastValue = valRounded;
		this.inputField.text = textValue;

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnValueChangeEvent(this.inputField.gameObject, () => {
				if (ignoreNextFieldChange) {
					ignoreNextFieldChange = false;
					return;
				}

				const value = tonumber(this.inputField.text);
				if (value === undefined) return;

				let newValue = this.ValidateIncrement(math.floor(value * 100) / 100, increment);
				this.onChange.Fire(newValue);

				ignoreNextSliderChange = true;
				slider.value = newValue;
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnValueChangeEvent(this.slider, (value) => {
				let newValue = this.ValidateIncrement(math.floor(value * 100) / 100, increment);

				if (ignoreNextSliderChange) {
					ignoreNextSliderChange = false;
					return;
				}

				if (Game.IsMobile() && this.lastValue !== newValue) VibrationManager.Play(VibrationFeedbackType.Selection);
				this.lastValue = newValue;
				
				this.onChange.Fire(newValue);

				ignoreNextFieldChange = true;
				this.inputField.text = this.FormatValueForDisplay(newValue, increment);
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

	private FormatValueForDisplay(value: number, increment: number) {
		let sigDigits = 3;
		if (increment > 0) sigDigits = math.ceil(math.log10(1 / increment));
		sigDigits = math.max(sigDigits, 0);

		return string.format(`%.${sigDigits}f`, value);
	}

	private PlaySelectSound() {
		AudioManager.PlayGlobal("AirshipPackages/@Easy/Core/Sound/UI_Select.wav");
	}

	private ValidateIncrement(value: number, increment: number): number {
		return math.round(value / increment) * increment;
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
