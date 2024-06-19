export default class PartyCard extends AirshipBehaviour {
	public layoutElement!: LayoutElement;
	public gameImage!: RawImage;
	public gameText!: TMP_Text;
	public gameArrow!: Image;
	public gameButton!: Button;

	override Start(): void {}

	public SetPlayingGame() {}

	override OnDestroy(): void {}
}
