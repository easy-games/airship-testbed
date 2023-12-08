import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AbilityCooldownDto, AbilityDto, AbilityKind } from "Shared/Abilities/Ability";
import { AbilitySlot } from "Shared/Abilities/AbilitySlot";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Game } from "Shared/Game";
import { AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";
import { Keyboard } from "Shared/UserInput/Keyboard";
import { Bin } from "Shared/Util/Bin";
import { AbilityBinding, BindingInputState } from "./Class/AbilityBinding";

/** Primary ability keys. */
const primaryKeys: ReadonlyArray<KeyCode> = [KeyCode.R, KeyCode.G];
/** Secondary ability keys. */
const secondaryKeys: ReadonlyArray<KeyCode> = [KeyCode.Z, KeyCode.X, KeyCode.V];
/** Utility ability keys. */
const utilityKeys: ReadonlyArray<KeyCode> = [KeyCode.B, KeyCode.N, KeyCode.M];

@Controller({})
export class AbilityBindingController implements OnStart {
	/** Ability keyboard instance. */
	private readonly keyboard = new Keyboard();
	/** Primary slot ability bindings. */
	private primaryAbilitySlots = new Array<AbilityBinding>(primaryKeys.size());
	/** Secondary slot ability bindings. */
	private secondaryAbilitySlots = new Array<AbilityBinding>(secondaryKeys.size());
	/** Utility slot ability bindings. */
	private utilityAbiltySlots = new Array<AbilityBinding>(utilityKeys.size());
	/** All slot ability bindings. */
	private combinedSlots = new Array<AbilityBinding>();

	constructor(private readonly abilityRegistry: AbilityRegistry) {
		this.CreateBindingSlots();
		this.combinedSlots = [...this.primaryAbilitySlots, ...this.secondaryAbilitySlots, ...this.utilityAbiltySlots];
	}

	OnStart(): void {
		// If ability was added to the local client AND it's an active ability,
		// bind ability to key.
		CoreNetwork.ServerToClient.AbilityAdded.Client.OnServerEvent((clientId, abilityDto) => {
			const abilityMeta = this.abilityRegistry.GetAbilityById(abilityDto.abilityId);
			if (!abilityMeta) return;
			if (
				clientId === Game.LocalPlayer.clientId &&
				abilityMeta.config.kind === AbilityKind.Active &&
				abilityDto.slot !== undefined
			) {
				this.RegisterLocalAbility(abilityDto);
			}
		});
		// If ability was removed to the local client AND it's an active ability,
		// unbind ability from key.
		CoreNetwork.ServerToClient.AbilityRemoved.Client.OnServerEvent((clientId, abilityId) => {
			const abilityMeta = this.abilityRegistry.GetAbilityById(abilityId);
			if (!abilityMeta) return;
			if (
				clientId === Game.LocalPlayer.clientId &&
				abilityMeta.config.kind === AbilityKind.Active &&
				abilityMeta.config.slot !== undefined
			) {
				this.UnregisterLocalAbility(abilityId);
			}
		});
		// If one of the local client's abilities had a cooldown update, update
		// binding and UI accordingly.
		CoreNetwork.ServerToClient.AbilityCooldownStateChange.Client.OnServerEvent((abilityCooldownDto) => {
			this.UpdateAbilityBindingCooldown(abilityCooldownDto);
		});
	}

	/**
	 * Creates and sets up ability bindings for all keys and slot types.
	 */
	private CreateBindingSlots(): void {
		for (const key of primaryKeys) {
			this.primaryAbilitySlots.push(new AbilityBinding(AbilitySlot.Primary, false, key));
		}
		for (const key of secondaryKeys) {
			this.secondaryAbilitySlots.push(new AbilityBinding(AbilitySlot.Secondary, false, key));
		}
		for (const key of utilityKeys) {
			this.utilityAbiltySlots.push(new AbilityBinding(AbilitySlot.Utility, false, key));
		}
	}

	/**
	 * Registers provided ability for local client. Returns whether or not the local ability
	 * was successfully registered. If this returns `false`, no available slot existed for ability.
	 *
	 * @param abilityDto The added ability's data transfer object representation.
	 * @returns Whether or not the local ability was successfuly registered.
	 */
	private RegisterLocalAbility(abilityDto: AbilityDto): boolean {
		let nextSlot: AbilityBinding | undefined;
		switch (abilityDto.slot) {
			case AbilitySlot.Primary:
				nextSlot = this.FindNextAvailableSlot(this.primaryAbilitySlots);
				break;
			case AbilitySlot.Secondary:
				nextSlot = this.FindNextAvailableSlot(this.secondaryAbilitySlots);
				break;
			case AbilitySlot.Utility:
				nextSlot = this.FindNextAvailableSlot(this.utilityAbiltySlots);
				break;
		}
		if (!nextSlot) return false;
		nextSlot.BindTo(abilityDto);
		nextSlot.BindToAction(this.keyboard, (inputState, abilityBinding) => {
			const boundAbilityId = abilityBinding.GetBound()?.abilityId;
			if (!boundAbilityId) return;
			if (inputState === BindingInputState.InputBegan) {
				abilityBinding.SetActive(true);
				CoreClientSignals.LocalAbilityActivateRequest.Fire({ abilityId: boundAbilityId });
			} else if (inputState === BindingInputState.InputEnded) {
				abilityBinding.SetActive(false);
			}
		});
		return true;
	}

	/**
	 * Unregisters provided ability for local client. Unbinds keybinding associated
	 * with ability.
	 *
	 * @param abilityId The ability being removed.
	 */
	private UnregisterLocalAbility(abilityId: string): void {
		const abilityBinding = this.GetAbilityBindingByAbilityId(abilityId);
		if (!abilityBinding) return;
		abilityBinding.Unbind();
	}

	/**
	 * Updates ability binding for ability associated with provided ability cooldown data,
	 * if binding exists.
	 *
	 * @param abilityCooldownDto The ability cooldown data transfer object representation.
	 */
	private UpdateAbilityBindingCooldown(abilityCooldownDto: AbilityCooldownDto): void {
		const abilityBinding = this.GetAbilityBindingByAbilityId(abilityCooldownDto.abilityId);
		if (!abilityBinding) return;
		abilityBinding.SetCooldown({
			startTime: abilityCooldownDto.timeStart,
			endTime: abilityCooldownDto.timeEnd,
			length: abilityCooldownDto.length,
		});
	}

	/**
	 * Returns the next available slot, if it exists. Searches through provided slots in index order,
	 * if a specific search order is desired, construct the `slots` array accordingly.
	 *
	 * @param slots Slots to search through.
	 * @returns The next available slot, if it exists.
	 */
	private FindNextAvailableSlot(slots: Array<AbilityBinding>): AbilityBinding | undefined {
		for (const slot of slots) {
			if (slot.GetBound() === undefined) return slot;
		}
		return undefined;
	}

	/**
	 * Returns ability binding associated with provided ability id, if it exists.
	 *
	 * @param abilityId The ability id being queried.
	 * @returns Returns ability binding associated with provided ability id, if it exists.
	 */
	private GetAbilityBindingByAbilityId(abilityId: string): AbilityBinding | undefined {
		for (const slot of this.combinedSlots) {
			if (slot.GetBound()?.abilityId === abilityId) return slot;
		}
		return undefined;
	}

	/**
	 * Observe ability bindings for local ability updates. Returns a `Bin` to clean up `BindingStateChanged`
	 * connections.
	 *
	 * @param callback A callback that operates on _all_ ability bindings.
	 * @returns `Bin` to clean up `BindingStateChanged` connections.
	 */
	public ObserveAbilityBindings(callback: (abilities: ReadonlyArray<AbilityBinding>) => Bin) {
		const bin = new Bin();
		bin.Add(callback(this.combinedSlots));
		return bin;
	}
}
