import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { OnUpdate } from "@Easy/Core/Shared/Util/Timer";

type VoiceState = "talking" | "silent";

export default class MicIndicator extends AirshipBehaviour {
	@Header("References")
	public canvasGroup!: CanvasGroup;
	public microphoneWrapper: GameObject;
	public microphoneFillMask: RectMask2D;

	private prevState: VoiceState = "silent";
	private bin = new Bin();
	private stateBin = new Bin();

	private currentSpeakingLevel: number = 0;

	private errorMsgTime = 0;

	override OnEnable(): void {}

	protected Start(): void {
		if (!Game.IsClient()) {
			this.enabled = false;
			return;
		}

		this.microphoneWrapper.SetActive(false);

		// Disable voice entirely without this flag
		if (!Game.playerFlags.has("CompressVOIPAudio")) {
			this.enabled = false;
			return;
		}

		task.spawn(() => {
			while (!Bridge.IsVoiceSetup()) {
				task.unscaledWait();
			}

			Bridge.SetMicInputEnabled(false);

			Airship.Input.OnDown("PushToTalk").Connect((event) => {
				if (event.uiProcessed) return;

				if (!Protected.Settings.data.microphoneEnabled) {
					if (Time.time - this.errorMsgTime > 4) {
						this.errorMsgTime = Time.time;
						Game.localPlayer.SendMessage(
							ChatColor.Red(
								"You tried to use voice chat when microphone was disabled. Enable it in settings.",
							),
						);
					}
					return;
				};

				
				if (!Protected.Settings.data.voiceToggleEnabled) {
					// If the user wants Push-To-Talk
					Bridge.SetMicInputEnabled(true);
				} else {
					// The user wants the mic to toggle
					Bridge.SetMicInputEnabled(!Bridge.IsMicInputEnabled());
				};
			});
			Airship.Input.OnUp("PushToTalk").Connect((event) => {
				if (!Protected.Settings.data.voiceToggleEnabled) {
					Bridge.SetMicInputEnabled(false);
				};
			});
		});
	}

	public Update(dt: number): void {
		if (!Game.playerFlags.has("CompressVOIPAudio")) return;

		if (Bridge.IsMicInputEnabled()) {
			this.SetState("talking");
		} else {
			this.SetState("silent");
		}
	}

	private SetState(state: VoiceState): void {
		if (state === this.prevState) return;
		this.stateBin.Clean();

		if (state === "talking") {
			this.microphoneWrapper.SetActive(true);
			// const t1 = NativeTween.LocalScale(this.transform, new Vector3(1.14, 1.14, 1), 0.38)
			// 	.SetPingPong()
			// 	.SetEase(EaseType.QuadOut)
			// 	.SetLoopCount(100)
			// 	.SetUseUnscaledTime(true);
			// this.stateBin.Add(() => {
			// 	t1.Cancel();
			// 	this.transform.localScale = Vector3.one;
			// });

			const connectionId = Game.localPlayer.connectionId;
			const UpdateFill = () => {
				let speakingLevel: number = contextbridge.invoke(
					"VoiceChat:GetSpeakingLevel",
					LuauContext.Protected,
					connectionId,
				);
				const smoothingSpeed = 10; // Higher = snappier, lower = smoother
				this.currentSpeakingLevel = math.lerpClamped(
					this.currentSpeakingLevel,
					speakingLevel,
					Time.deltaTime * smoothingSpeed,
				);

				this.microphoneFillMask.padding = new Vector4(0, 0, 0, 34 - this.currentSpeakingLevel * 34);
			};
			UpdateFill();
			this.stateBin.Add(
				OnUpdate.Connect(() => {
					UpdateFill();
				}),
			);
		} else if (state === "silent") {
			this.microphoneWrapper.SetActive(false);
		}

		this.prevState = state;
	}

	override OnDisable(): void {}
}
