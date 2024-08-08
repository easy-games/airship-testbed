import { ColorUtil } from "../../Util/ColorUtil";

export default class DynamicColor extends AirshipBehaviour {
	@Header("References")
	public colorSetters: MaterialColorURP[];

	@Header("Variables")
	public changeOverTime = true;
	public radialChange = true;
	public changesPerSecond = 1;

	@Header("Radial")
	@Range(0, 1)
	public radialHueIncriment = 0.01;
	public radialSaturation = 1;
	public radialValue = 1;

	@Header("Randomized")
	public rgbRandomMin = new Vector3(0, 0, 0);
	public rgbRandomMax = new Vector3(1, 1, 1);

	private lastChangeTime = 0;
	private currentColor = Color.white;

	protected Start(): void {
		this.CalculateColor();
	}

	protected Update(dt: number): void {
		if (!this.changeOverTime) {
			return;
		}
		if (Time.time - this.lastChangeTime > 1 / this.changesPerSecond) {
			this.CalculateColor();
		}
	}

	private CalculateColor() {
		if (this.radialChange) {
			//Use HSV to radially change HUE
			this.SetColor(
				ColorUtil.HsvToRgb(
					new Vector3(
						(ColorUtil.RgbToHsv(this.currentColor).x + this.radialHueIncriment) % 1,
						this.radialSaturation,
						this.radialValue,
					),
				),
			);
		} else {
			//Randomized color
			this.SetColor(
				ColorUtil.GetRandomColorClampedRGB(
					this.rgbRandomMin.x,
					this.rgbRandomMax.x,
					this.rgbRandomMin.y,
					this.rgbRandomMax.y,
					this.rgbRandomMin.z,
					this.rgbRandomMax.z,
				),
			);
		}
	}

	public SetColor(newColor: Color) {
		this.lastChangeTime = Time.time;
		this.currentColor = newColor;
		this.colorSetters.forEach((colorSetter) => {
			if (!colorSetter) {
				return;
			}
			colorSetter.SetColorOnAll(newColor);
		});
	}
}
