import { Controller, OnStart } from "@easy-games/flamework-core";
import { SpectateController } from "./SpectateController";

@Controller({})
export class SpectateUIController implements OnStart {
	private canvas: Canvas;
	private targetNameTMP: TMP_Text;

	constructor(private readonly spectateController: SpectateController) {
		const go = GameObject.Find("Spectate");
		this.canvas = go.GetComponent<Canvas>();
		this.canvas.enabled = false;

		const refs = go.GetComponent<GameObjectReferences>();
		this.targetNameTMP = refs.GetValue("UI", "TargetName");
	}

	OnStart(): void {
		this.spectateController.ObserveSpectatorTarget((entity) => {
			if (!entity) {
				this.canvas.enabled = false;
				return;
			}

			this.targetNameTMP.text = entity.GetDisplayName();
			this.canvas.enabled = true;
		});
	}
}
