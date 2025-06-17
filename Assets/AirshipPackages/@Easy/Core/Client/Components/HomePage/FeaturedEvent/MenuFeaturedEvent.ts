export default class MenuFeaturedEvent extends AirshipBehaviour {
	@Header("References")
	public eventImg: RawImage;
	public gameThumbnailImg: RawImage;
	public gameName: TMP_Text;
	public eventDescription: TMP_Text;
	public playBtn: Button;
	public playerCountWrapper: GameObject;
	public playerCountText: TMP_Text;
	public endCountdownText: TMP_Text;
	public startCountdownText: TMP_Text;

	public Init(gameId: string, description: string, startTime: number, endTime: number): void {}

	override Start(): void {}

	override OnDestroy(): void {}
}
