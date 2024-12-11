import { Bin } from "../../Util/Bin";

export default class JoinDiscordButton extends AirshipBehaviour {
	private bin = new Bin();

	override Start(): void {
		const btn = this.gameObject.GetComponent<Button>()!;
		this.bin.Add(
			btn.onClick.Connect(() => {
				Application.OpenURL("https://discord.gg/CgGFkXbMww");
			}),
		);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
