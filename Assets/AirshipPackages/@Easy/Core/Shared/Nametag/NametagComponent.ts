import { Airship } from "../Airship";
import { Game } from "../Game";
import { Team } from "../Team/Team";

export default class NametagComponent extends AirshipBehaviour {
	@SerializeField() public teamImage: Image;
	@SerializeField() public backgroundImage: Image;
	@SerializeField() public nametagText: TMP_Text;
	@SerializeField() public canvas: Canvas;
	@SerializeField() public canvasGroup: CanvasGroup;
	/**
	 * Max distance from CameraRig until nametag canvas is disabled.
	 *
	 * Set to -1 to disable distance culling.
	 */
	@SerializeField() public maxDistance: number = 50;

	private cameraTransform: Transform | undefined;
	private isCanvasEnabled = false;

	protected Start(): void {
		this.cameraTransform = Airship.Camera.cameraRig?.transform;
	}

	public SetAlpha(alpha: number) {
		NativeTween.CanvasGroupAlpha(this.canvasGroup, alpha, 0.1).SetUseUnscaledTime(true);
	}

	public SetText(text: string) {
		this.nametagText.text = text;
	}

	public SetTextColor(color: Color) {
		this.nametagText.color = color;
	}

	protected Update(dt: number): void {
		if (!Game.IsClient()) return;
		if (this.maxDistance < 0) return;

		// If this is slow, we should move to a manager to do the check. and less frequently.
		if (this.cameraTransform) {
			const camPos = this.cameraTransform.position;
			const distance = camPos.sub(this.transform.position).magnitude;
			if (distance <= this.maxDistance) {
				if (this.isCanvasEnabled) return;
				this.isCanvasEnabled = true;
				this.canvas.enabled = true;
			} else {
				if (!this.isCanvasEnabled) return;
				this.isCanvasEnabled = false;
				this.canvas.enabled = false;
			}
		}
	}

	public SetTeam(team: Team | undefined) {
		if (team) {
			this.teamImage.color = team.color;
			this.teamImage.enabled = true;
		} else {
			this.teamImage.enabled = false;
		}
	}
}
