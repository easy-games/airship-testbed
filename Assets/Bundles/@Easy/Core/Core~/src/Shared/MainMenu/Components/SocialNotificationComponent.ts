import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { Signal } from "Shared/Util/Signal";

export default class SocialNotificationComponent extends AirshipBehaviour {
	public titleText!: TMP_Text;
	public userImage!: Image;
	public usernameText!: TMP_Text;
	public acceptButton!: Button;
	public declineButton!: Button;

	/**
	 * Fires true if accepted. False if declined.
	 */
	@NonSerialized() public onResult = new Signal<boolean>();

	public bin = new Bin();

	override OnEnable(): void {
		// Accept
		{
			const conn = CanvasAPI.OnClickEvent(this.acceptButton.gameObject, () => {
				print("result: true");
				this.onResult.Fire(true);
			});
			this.bin.Add(() => Bridge.DisconnectEvent(conn));
		}
		// Decline
		{
			const conn = CanvasAPI.OnClickEvent(this.declineButton.gameObject, () => {
				print("result: false");
				this.onResult.Fire(false);
			});
			this.bin.Add(() => Bridge.DisconnectEvent(conn));
		}
	}

	public OnDisable(): void {
		this.onResult.DisconnectAll();
		this.bin.Clean();
	}

	override OnDestroy(): void {}
}
