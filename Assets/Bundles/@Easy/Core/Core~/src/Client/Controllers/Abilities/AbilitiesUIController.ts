import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreUIController } from "../UI/CoreUIController";
import { AbilityConfig } from "Shared/Strollers/Abilities/AbilityRegistry";
import { AbilitySlot } from "Shared/Abilities/AbilitySlot";
import { InputUtils } from "Shared/Util/InputUtils";

interface ClientAbilityState {
	name: string;
	icon: string | undefined;
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
			const amount = refs.GetValue<TMP_Text>("UI", "Charges");
			const name = refs.GetValue<TMP_Text>("UI", "Name");
			const keybinding = refs.GetValue<TMP_Text>("UI", "Keybinding");

			if (ability.keybinding !== undefined) {
				keybinding.enabled = true;
				keybinding.text = InputUtils.GetStringForKeyCode(ability.keybinding) ?? "??";
			} else {
				keybinding.enabled = false;
			}

			if (ability.charges !== undefined && ability.charges > 0) {
				amount.enabled = true;
				amount.text = tostring(ability.charges);
			} else {
				amount.enabled = false;
			}

			const texture2d = ability.icon
				? AssetBridge.Instance.LoadAssetIfExists<Texture2D>(ability.icon)
				: undefined;
			if (texture2d) {
				image.sprite = Bridge.MakeSprite(texture2d);
				image.enabled = true;
				name.enabled = false;
			} else {
				name.text = ability.name;
				image.enabled = false;
				name.enabled = true;
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
			keybinding: KeyCode.Z,
			name: "Recall",
			icon: undefined,
			charges: 0,
		});
	}
}
