import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

export default class SocialNotificationComponent extends AirshipBehaviour {
	public titleText!: TMP_Text;
	public userImage!: RawImage;
	public usernameText!: TMP_Text;
	public acceptButton!: Button;
	public declineButton!: Button;
	public bgImage: Image;
	public bgColorSpeed = 2;
	public bgColor1: Color;
	public bgColor2: Color;

	/**
	 * Fires true if accepted. False if declined.
	 */
	@NonSerialized() public onResult = new Signal<boolean>();

	public bin = new Bin();

	protected Update(dt: number): void {
		this.bgImage.color = Color.Lerp(
			this.bgColor1,
			this.bgColor2,
			math.sin(Time.time * this.bgColorSpeed) * 0.5 + 1,
		);
	}

	override OnEnable(): void {
		// Accept
		{
			const conn = CanvasAPI.OnClickEvent(this.acceptButton.gameObject, () => {
				this.onResult.Fire(true);
			});
			this.bin.Add(() => Bridge.DisconnectEvent(conn));
		}
		// Decline
		{
			const conn = CanvasAPI.OnClickEvent(this.declineButton.gameObject, () => {
				this.onResult.Fire(false);
			});
			this.bin.Add(() => Bridge.DisconnectEvent(conn));
		}

		// animation
		let inner = this.transform.GetChild(0) as RectTransform;
		inner.localScale = Vector3.zero;
		NativeTween.LocalScale(inner, Vector3.one, 0.15).SetEaseBounceOut().SetUseUnscaledTime(true);
	}

	public OnDisable(): void {
		this.onResult.DisconnectAll();
		this.bin.Clean();
	}

	override OnDestroy(): void {}
}
