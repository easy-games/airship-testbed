import AirshipButton from "../../MainMenu/Components/AirshipButton";

export default class AirshipMobileButton extends AirshipButton {
	/** The icon of this mobile button */
	@Header("Mobile Button")
	public iconImage: Image;

	public SetIconFromSprite(sprite: Sprite) {
		this.iconImage.sprite = sprite;
	}

	public SetIconFromTexture(texture: Texture2D) {
		this.iconImage.sprite = Bridge.MakeDefaultSprite(texture);
	}
}
