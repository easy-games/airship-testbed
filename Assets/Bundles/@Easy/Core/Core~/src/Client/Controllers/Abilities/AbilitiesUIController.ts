import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreUIController } from "../UI/CoreUIController";
import { AbilityConfig } from "Shared/Strollers/Abilities/AbilityRegistry";
import { AbilitySlot } from "Shared/Abilities/AbilitySlot";

interface ClientAbilityState {
	name: string;
	charges: number | undefined;
	keybinding: KeyCode | undefined;
}

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

	private UpdateAbilityBarSlot(slotIdx: number, ability: ClientAbilityState | undefined) {
		const go = this.abilitybarContent.GetChild(slotIdx).gameObject;
		const contentGO = go.transform.GetChild(0).gameObject;

		contentGO.gameObject.SetActive(ability !== undefined);
		if (ability !== undefined) {
			// Update slot metadata
			const refs = go.GetComponent<GameObjectReferences>();
			const image = refs.GetValue<Image>("UI", "Image");
			const amount = refs.GetValue<TMP_Text>("UI", "Chares");
			const name = refs.GetValue<TMP_Text>("UI", "Name");
			const keybinding = refs.GetValue<TMP_Text>("UI", "Keybinding");

			if (ability.keybinding !== undefined) {
			} else {
				keybinding.gameObject.SetActive(false);
			}
		}
	}

	private SetupAbilityBar() {
		for (let i = 0; i < this.abilitySlots; i++) {
			this.UpdateAbilityBarSlot(i, undefined); // set undefined for now, TODO: Retrieve from AbilitiesController ?
		}
	}

	public OnStart(): void {
		this.SetupAbilityBar();

		this.UpdateAbilityBarSlot(0, {
			// configuration: {
			// 	slot: AbilitySlot.Primary1,
			// 	name: "Testing lol",
			// },
			keybinding: KeyCode.Q,
			name: "Recall",
			charges: 0,
		});
	}
}
