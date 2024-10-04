export default class DiscordHero extends AirshipBehaviour {
	public canvasGroup: CanvasGroup;
	public scrollRedirect: AirshipRedirectScroll;

	override Start(): void {
		this.canvasGroup.alpha = 0;
		NativeTween.CanvasGroupAlpha(this.canvasGroup, 1, 1).SetEaseQuadOut();
	}

	override OnDestroy(): void {}
}
