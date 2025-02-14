import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";

type VoiceState = "talking" | "silent";

export default class MicIndicator extends AirshipBehaviour {
	@Header("References")
	public canvasGroup!: CanvasGroup;

	private prevState: VoiceState = "silent";
	private bin = new Bin();
	private stateBin = new Bin();

	private voiceChat = Bridge.GetAirshipVoiceChatNetwork();
	private agent: ChatroomAgent = this.voiceChat.agent;

	private errorMsgTime = 0;

	override OnEnable(): void {}

	protected Start(): void {
		task.spawn(() => {
			while (!this.voiceChat.gameObject.activeInHierarchy || !this.agent) {
				task.unscaledWait();
			}
			this.agent.MuteSelf = true;
			Airship.Input.OnDown("PushToTalk").Connect((event) => {
				if (event.uiProcessed) return;

				if (!Protected.settings.data.microphoneEnabled) {
					if (Time.time - this.errorMsgTime > 4) {
						this.errorMsgTime = Time.time;
						Game.localPlayer.SendMessage(
							ChatColor.Red(
								"You tried to use voice chat when microphone was disabled. Enable it in settings.",
							),
						);
					}
					return;
				}
				this.agent.MuteSelf = false;
			});
			Airship.Input.OnUp("PushToTalk").Connect((event) => {
				this.agent.MuteSelf = true;
			});
		});
		this.canvasGroup.alpha = 0;
	}

	public Update(dt: number): void {
		if (this.agent.MuteSelf) {
			this.SetState("silent");
		} else {
			this.SetState("talking");
		}
	}

	private SetState(state: VoiceState): void {
		if (state === this.prevState) return;
		this.stateBin.Clean();

		if (state === "talking") {
			this.canvasGroup.alpha = 1;
			const t1 = NativeTween.LocalScale(this.transform, new Vector3(1.14, 1.14, 1), 0.38)
				.SetPingPong()
				.SetEase(EaseType.QuadOut)
				.SetLoopCount(100)
				.SetUseUnscaledTime(true);
			this.stateBin.Add(() => {
				t1.Cancel();
				this.transform.localScale = Vector3.one;
			});
		} else if (state === "silent") {
			this.canvasGroup.alpha = 0;
		}

		this.prevState = state;
	}

	override OnDisable(): void {}
}
