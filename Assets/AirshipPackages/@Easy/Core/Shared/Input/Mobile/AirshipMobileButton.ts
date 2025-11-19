import AirshipButton from "../../MainMenu/Components/AirshipButton";

export default class AirshipMobileButton extends AirshipButton {
	/** The icon of this mobile button */
	@Header("Mobile Button")
	public iconImage: Image;
	private startingImageAlpha: number;
	private startingIconAlpha: number;

	override Start(): void {
		super.Start();
		this.startingImageAlpha = this.image?.color.a ?? 1;
		this.startingIconAlpha = this.iconImage.color.a;
	}

	public SetIconFromSprite(sprite: Sprite) {
		this.iconImage.sprite = sprite;
	}

	public SetIconFromTexture(texture: Texture2D) {
		this.iconImage.sprite = Bridge.MakeDefaultSprite(texture);
	}

	public FadeOut(duration: number = 0.5): void {
		if (this.image && this.iconImage) {
			NativeTween.GraphicAlpha(this.image, 0, duration).SetUseUnscaledTime(true);
			NativeTween.GraphicAlpha(this.iconImage, 0, duration).SetUseUnscaledTime(true);
		}
	}

	public FadeIn(duration: number = 0.5): void {
		if (this.image && this.iconImage && this.startingImageAlpha && this.startingIconAlpha) {
			NativeTween.GraphicAlpha(this.image, this.startingImageAlpha, duration).SetUseUnscaledTime(true);
			NativeTween.GraphicAlpha(this.iconImage, this.startingIconAlpha, duration).SetUseUnscaledTime(true);
		}
	}
}
