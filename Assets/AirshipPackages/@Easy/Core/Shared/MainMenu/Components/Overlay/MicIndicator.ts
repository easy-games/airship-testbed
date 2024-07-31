import { Airship } from "@Easy/Core/Shared/Airship";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

type VoiceState = "talking" | "silent";

export default class MicIndicator extends AirshipBehaviour {
	@Header("References")
	public canvasGroup!: CanvasGroup;

	private prevState: VoiceState = "silent";
	private bin = new Bin();
	private stateBin = new Bin();

	override OnEnable(): void {}

	protected Start(): void {
		const voiceChat = Bridge.GetAirshipVoiceChatNetwork();
		voiceChat.agent.MuteSelf = true;
		Airship.Input.OnDown("PushToTalk").Connect((event) => {
			voiceChat.agent.MuteSelf = false;
		});
		Airship.Input.OnUp("PushToTalk").Connect((event) => {
			voiceChat.agent.MuteSelf = true;
		});
		this.canvasGroup.alpha = 0;
	}

	public Update(dt: number): void {
		if (Airship.Input.IsDown("PushToTalk")) {
			this.SetState("talking");
		} else {
			this.SetState("silent");
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
