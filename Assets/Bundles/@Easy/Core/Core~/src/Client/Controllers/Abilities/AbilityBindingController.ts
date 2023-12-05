import { Controller, OnInit, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AbilityDto } from "Shared/Abilities/Ability";
import { AbilitySlot } from "Shared/Abilities/AbilitySlot";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Game } from "Shared/Game";
import { AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";
import { Keyboard } from "Shared/UserInput/Keyboard";
import { AbilityBinding, BindingInputState } from "./Class/AbilityBinding";

/** Primary ability keys. */
const primaryKeys: ReadonlyArray<KeyCode> = [KeyCode.R, KeyCode.G];
/** Secondary ability keys. */
const secondaryKeys: ReadonlyArray<KeyCode> = [KeyCode.Z, KeyCode.X, KeyCode.V];
/** Utility ability keys. */
const utilityKeys: ReadonlyArray<KeyCode> = [KeyCode.B, KeyCode.N, KeyCode.M];

@Controller({})
export class AbilityBindingController implements OnStart, OnInit {
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

	constructor(private readonly abilityRegistry: AbilityRegistry) {}

	OnInit(): void {
		this.CreateBindingSlots();
		this.combinedSlots = [...this.primaryAbilitySlots, ...this.secondaryAbilitySlots, ...this.utilityAbiltySlots];
	}

	OnStart(): void {
		CoreNetwork.ServerToClient.AbilityAddedNew.Client.OnServerEvent((clientId, abilityDto) => {
			// If this ability was added to the local client AND it's an active ability,
			// bind ability to key.
			if (clientId === Game.LocalPlayer.clientId && abilityDto.slot) {
				print(`BINDING ${abilityDto.abilityId} (0)`);
				this.RegisterLocalAbility(abilityDto);
			}
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
	 * Returns whether or not the local ability was successfully registered. If this
	 * returns `false`, no available slot existed for ability.
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
		print(`BINDING ${abilityDto.abilityId} (1)`);
		nextSlot.BindTo(abilityDto);
		nextSlot.BindToAction(this.keyboard, (inputState, abilityBinding) => {
			const boundAbilityId = abilityBinding.GetBound()?.abilityId;
			if (!boundAbilityId) return;
			if (inputState === BindingInputState.InputBegan) {
				abilityBinding.SetActive(true);
				CoreClientSignals.LocalAbilityUseRequest.Fire({ abilityId: boundAbilityId });
			} else if (inputState === BindingInputState.InputEnded) {
				abilityBinding.SetActive(false);
			}
		});
		return true;
	}

	/**
	 * Returns the next available slot, if it exists. Searches through provided slots in index order,
	 * if a specific search order is desired, construct the `slots` array accordingly.
	 *
	 * @param slots Slots to search through.
	 * @returns The next available slot, if it exists.
	 */
	private FindNextAvailableSlot(slots: Array<AbilityBinding>): AbilityBinding | undefined {
		print(`SLOT SIZE: ${slots.size()}`);
		for (const slot of slots) {
			print(slot.GetBound()?.abilityId);
			if (slot.GetBound() === undefined) return slot;
		}
		return undefined;
	}
}
