import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreUIController } from "../UI/CoreUIController";
import { AbilityConfig } from "Shared/Strollers/Abilities/AbilityRegistry";

@Controller()
export class AbilitiesUIController implements OnStart {
	private abilitySlots = 9;

	private canvas: Canvas;
	private abilitiesRefs: GameObjectReferences;
	private abilitybarContent: Transform;

	public constructor(public readonly coreUIController: CoreUIController) {
		const go = this.coreUIController.refs.GetValue("Apps", "Abilities");
		this.canvas = go.GetComponent<Canvas>();
		this.canvas.enabled = true; // Enable if using abilities

		this.abilitiesRefs = go.GetComponent<GameObjectReferences>();
		this.abilitybarContent = this.abilitiesRefs.GetValue("UI", "AbilityBarContentGO").transform;
	}

	private UpdateAbilityBarSlot(slotIdx: number, ability: AbilityConfig | undefined) {
		const go = this.abilitybarContent.GetChild(slotIdx).gameObject;
		const contentGO = go.transform.GetChild(0).gameObject;

		contentGO.gameObject.SetActive(ability !== undefined);
		if (ability !== undefined) {
			// Update slot metadata
		}
	}

	private SetupAbilityBar() {
		for (let i = 0; i < this.abilitySlots; i++) {
			this.UpdateAbilityBarSlot(i, undefined); // set undefined for now, TODO: Retrieve from AbilitiesController ?
		}
	}

	public OnStart(): void {
		this.SetupAbilityBar();
	}
}
