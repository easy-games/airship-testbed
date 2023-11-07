import { Controller, OnStart } from "@easy-games/flamework-core";
import { AbilityDto } from "Shared/Abilities/Ability";
import { AbilitySlot } from "Shared/Abilities/AbilitySlot";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Keyboard } from "Shared/UserInput";
import { AbilityBinding } from "./Class/AbilityBinding";
import { MapUtil } from "Shared/Util/MapUtil";
import { AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";
import { KeySignal } from "Shared/UserInput/Drivers/Signals/KeySignal";

interface BoundAbilitySlot {
	abilityId: string;
	enabled: boolean;
	cooldownTimeEnd: number | undefined;
}

@Controller()
export class AbilitiesController implements OnStart {
	private primaryKeyQueue = [KeyCode.E, KeyCode.R, KeyCode.T];
	private secondaryKeyQueue = [KeyCode.F, KeyCode.G, KeyCode.H];
	private tertiaryKeyQueue = [KeyCode.Z, KeyCode.X, KeyCode.V];

	private readonly abilityBoundKeys = [...this.primaryKeyQueue, ...this.secondaryKeyQueue, ...this.tertiaryKeyQueue];

	public keyCodeAbilitySlot = new Map<KeyCode, AbilitySlot>();
	public abilitySlotBinding = new Map<AbilitySlot, BoundAbilitySlot>();

	public constructor(private readonly abilityRegistry: AbilityRegistry) {}

	/**
	 * Attempts to bind the ability to the next available slot
	 * @param slot The slot kind to bind this ability to
	 * @param ability The ability to bind
	 */
	public BindAbilityToSlot(slot: AbilitySlot, ability: AbilityDto) {}

	private GetBoundAbilityForKeyCode(keyCode: KeyCode) {
		// Get the slot type bound to this keycode
		const abilitySlotForKeyCode = this.keyCodeAbilitySlot.get(keyCode);
		if (!abilitySlotForKeyCode) return;

		// Get the registered binding object for the given slot
		const bindingForAbilitySlot = this.abilitySlotBinding.get(abilitySlotForKeyCode);
		if (!bindingForAbilitySlot) return;

		// Get the bound ability
		const boundAbility = bindingForAbilitySlot;
		if (!boundAbility || !boundAbility.enabled) return;

		return boundAbility;
	}

	// TODO: in future a much friendlier Input API
	private OnKeyboardInputEnded = (event: KeySignal) => {
		const boundAbility = this.GetBoundAbilityForKeyCode(event.KeyCode);
		if (!boundAbility) return;

		const metadata = this.abilityRegistry.GetAbilityById(boundAbility.abilityId);
		if (!metadata) {
			warn(
				`Attempted to fire bound ability by id ${boundAbility.abilityId} with no matching ability on client? ensure you have registered abilities on both server and client`,
			);
			return;
		}

		// TODO: check for cooldowns
		// TODO: if not on cooldown - send to server that we're "casting" this
	};

	public OnStart(): void {
		const keyboard = new Keyboard();

		for (const slot of this.abilityBoundKeys) {
			keyboard.OnKeyUp(slot, this.OnKeyboardInputEnded);
		}

		const abilities = CoreNetwork.ServerToClient.GetAbilities.Client.FireServer();
		for (const ability of abilities) {
		}
	}
}
