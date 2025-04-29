import { Airship } from "../Airship";
import Character from "../Character/Character";
import { Game } from "../Game";
import { Team } from "../Team/Team";
import { Bin } from "../Util/Bin";

export default class NametagComponent extends AirshipBehaviour {
	@SerializeField() public teamImage: Image;
	@SerializeField() public backgroundImage: Image;
	@SerializeField() public nametagText: TMP_Text;
	@SerializeField() public canvas: Canvas;
	@SerializeField() public canvasGroup: CanvasGroup;
	@SerializeField() public microphoneWrapper: GameObject;
	@SerializeField() public microphoneFillMask: RectMask2D;

	@NonSerialized() public character: Character;
	private currentSpeakingLevel: number = 0;

	private bin = new Bin();

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

	public SetCharacter(character: Character): void {
		this.character = character;
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
				if (!this.isCanvasEnabled) {
					this.isCanvasEnabled = true;
					this.canvas.enabled = true;
				}
			} else {
				if (this.isCanvasEnabled) {
					this.isCanvasEnabled = false;
					this.canvas.enabled = false;
				}
			}
		}

		// Microphone
		if (this.isCanvasEnabled) {
			let speakingLevel = 0;
			const connectionId = this.character.player?.connectionId;
			if (connectionId !== undefined) {
				speakingLevel = contextbridge.invoke("VoiceChat:GetSpeakingLevel", LuauContext.Protected, connectionId);
			}

			// Smooth the the volume level for UI
			const smoothingSpeed = 10; // Higher = snappier, lower = smoother
			this.currentSpeakingLevel = math.lerp(
				this.currentSpeakingLevel,
				speakingLevel,
				Time.deltaTime * smoothingSpeed,
			);

			// print("speaking level: " + speakingLevel);
			if (this.currentSpeakingLevel > 0.01) {
				this.microphoneWrapper.SetActive(true);
				this.microphoneFillMask.padding = new Vector4(0, 0, 0, 400 - this.currentSpeakingLevel * 400);
			} else {
				this.microphoneWrapper.SetActive(false);
			}
		}
	}

	public SetTeam(team: Team | undefined) {
		if (team) {
			let c = new Color(team.color.r, team.color.g, team.color.b, 1);
			this.teamImage.color = c;
			this.teamImage.gameObject.SetActive(true);
		} else {
			this.teamImage.gameObject.SetActive(false);
		}
	}

	protected OnDestroy(): void {
		this.bin.Clean();
	}
}
