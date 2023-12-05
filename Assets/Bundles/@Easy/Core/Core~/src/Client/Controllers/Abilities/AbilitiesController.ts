import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AbilityDto } from "Shared/Abilities/Ability";
import { AbilitySlot } from "Shared/Abilities/AbilitySlot";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Game } from "Shared/Game";
import { AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";
import { Keyboard } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { SignalPriority } from "Shared/Util/Signal";
import { EntityController } from "../Entity/EntityController";
import { AbilityBinding, BindingAction, BindingInputState } from "./Class/AbilityBinding";
import { AbilitiesClearedClientSignal } from "./Event/AbilitiesClearedClientSignal";
import { AbilityAddedClientSignal } from "./Event/AbilityAddedClientSignal";
import { AbilityChargeClientSignal } from "./Event/AbilityChargeClientSignal";
import { AbilityChargeEndClientSignal } from "./Event/AbilityChargeEndClientSignal";
import { AbilityRemovedClientSignal } from "./Event/AbilityRemovedClientSignal";
import { AbilityStateUpdateSignal } from "./Event/AbilityStateUpdateSignal";

const primaryKeys: ReadonlyArray<KeyCode> = [KeyCode.R, KeyCode.G];
const secondaryKeys: ReadonlyArray<KeyCode> = [KeyCode.Z, KeyCode.X, KeyCode.V];
const utilityKeys: ReadonlyArray<KeyCode> = [KeyCode.B, KeyCode.N, KeyCode.M];

@Controller()
export class AbilitiesController implements OnStart {
	private readonly keyboard = new Keyboard();

	private primaryAbilitySlots = new Array<AbilityBinding>(primaryKeys.size());
	private secondaryAbilitySlots = new Array<AbilityBinding>(secondaryKeys.size());
	private utilityAbiltySlots = new Array<AbilityBinding>(utilityKeys.size());
	private allSlots;

	public constructor(
		private readonly abilityRegistry: AbilityRegistry,
		private readonly entityController: EntityController,
	) {
		// Set up binding slots
		for (const keyCode of primaryKeys) {
			this.primaryAbilitySlots.push(new AbilityBinding(AbilitySlot.Primary, false, keyCode));
		}

		for (const keyCode of secondaryKeys) {
			this.secondaryAbilitySlots.push(new AbilityBinding(AbilitySlot.Secondary, false, keyCode));
		}

		for (const keyCode of utilityKeys) {
			this.utilityAbiltySlots.push(new AbilityBinding(AbilitySlot.Utility, false, keyCode));
		}

		this.allSlots = [...this.primaryAbilitySlots, ...this.secondaryAbilitySlots, ...this.utilityAbiltySlots];
	}

	private FindNextAvailableSlot(slots: Array<AbilityBinding>) {
		for (const item of slots) {
			if (item.GetBound() === undefined) {
				return item;
			}
		}

		return undefined;
	}

	private RegisterAbility(abilityDto: AbilityDto) {
		if (abilityDto.slot === undefined) return false;
		let nextSlot: AbilityBinding | undefined;
		if (abilityDto.slot === AbilitySlot.Primary) {
			nextSlot = this.FindNextAvailableSlot([
				...this.primaryAbilitySlots,
				...this.secondaryAbilitySlots,
				...this.utilityAbiltySlots,
			]);
		} else if (abilityDto.slot === AbilitySlot.Secondary) {
			nextSlot = this.FindNextAvailableSlot([
				...this.secondaryAbilitySlots,
				...this.primaryAbilitySlots,
				...this.utilityAbiltySlots,
			]);
		} else if (abilityDto.slot === AbilitySlot.Utility) {
			nextSlot = this.FindNextAvailableSlot(this.utilityAbiltySlots);
		}

		if (!nextSlot) return false;

		nextSlot.BindTo(abilityDto);
		nextSlot.BindToAction(this.keyboard, this.OnKeyboardInputEnded);
	}

	private UnregisterAbility(abilityId: string) {
		const matchingSlot = this.allSlots.find((f) => f.GetBound()?.abilityId === abilityId);
		if (matchingSlot) {
			matchingSlot.Unbind();
		}
	}

	// TODO: in future a much friendlier Input API
	private OnKeyboardInputEnded: BindingAction = (state, binding) => {
		const boundAbilityId = binding.GetBound()?.abilityId;

		const character = Game.LocalPlayer.character;
		if (!character) return;
		const abilities = character.GetAbilities();

		if (state === BindingInputState.InputBegan && boundAbilityId) {
			binding.SetActive(true);
			abilities.UseAbilityById(boundAbilityId);
		} else if (state === BindingInputState.InputEnded) {
			binding.SetActive(false);
		}
	};

	public ObserveAbilityBindings(callback: (abilities: ReadonlyArray<AbilityBinding>) => Bin) {
		const bin = new Bin();
		bin.Add(callback([...this.primaryAbilitySlots, ...this.secondaryAbilitySlots, ...this.utilityAbiltySlots]));
		return bin;
	}

	public OnStart(): void {
		CoreClientSignals.EntitySpawn.ConnectWithPriority(SignalPriority.LOWEST, (event) => {
			if (event.entity instanceof CharacterEntity && event.entity.IsLocalCharacter()) {
				this.primaryAbilitySlots.forEach((slot) => slot.Unbind());
				this.secondaryAbilitySlots.forEach((slot) => slot.Unbind());
				this.utilityAbiltySlots.forEach((slot) => slot.Unbind());

				// Run character ability fetch
				const abilities = CoreNetwork.ClientToServer.GetAbilities.Client.FireServer();
				for (const ability of abilities) {
					//this.RegisterAbility(ability);
				}
			}
		});

		CoreClientSignals.AbilityAdded.Connect((event) => {
			const abilities = event.characterEntity.GetAbilities();
			const ability = this.abilityRegistry.GetAbilityById(event.ability.abilityId);
			if (ability) {
				abilities.AddAbilityWithId(event.ability.abilityId, ability);
			}

			if (event.IsLocalPlayer()) {
				//this.RegisterAbility(event.ability);
			}
		});

		CoreClientSignals.AbilityRemoved.Connect((event) => {
			const abilities = event.characterEntity.GetAbilities();
			const ability = this.abilityRegistry.GetAbilityById(event.abilityId);
			if (ability) {
				abilities.RemoveAbilityById(event.abilityId);
			}

			if (event.IsLocalPlayer()) {
				this.UnregisterAbility(event.abilityId);
			}
		});

		CoreClientSignals.AbilitiesCleared.Connect((event) => {
			if (event.IsLocalPlayer()) {
				for (const slot of this.allSlots) {
					slot.Unbind();
				}
			}
		});

		CoreClientSignals.AbilityStateUpdate.Connect((event) => {
			const abilities = event.characterEntity.GetAbilities();
			abilities.SetAbilityEnabledState(event.abilityId, event.enabled);
		});

		CoreNetwork.ServerToClient.AbilityStateChange.Client.OnServerEvent((entityId, abilityId, enabledState) => {
			const entity = this.entityController.GetEntityById(entityId);
			if (entity && entity instanceof CharacterEntity) {
				CoreClientSignals.AbilityStateUpdate.Fire(
					new AbilityStateUpdateSignal(entity, abilityId, enabledState),
				);
			}
		});

		CoreNetwork.ServerToClient.AbilityRemoved.Client.OnServerEvent((entityId, abilityId) => {
			const entity = this.entityController.GetEntityById(entityId);

			if (entity && entity instanceof CharacterEntity) {
				CoreClientSignals.AbilityRemoved.Fire(new AbilityRemovedClientSignal(entity, abilityId));
			}
		});

		CoreNetwork.ServerToClient.AbilitiesCleared.Client.OnServerEvent((entityId) => {
			const entity = this.entityController.GetEntityById(entityId);

			if (entity && entity instanceof CharacterEntity) {
				CoreClientSignals.AbilitiesCleared.Fire(new AbilitiesClearedClientSignal(entity));
			}
		});

		CoreNetwork.ServerToClient.AbilityCooldownStateChange.Client.OnServerEvent((event) => {
			const matchingSlot = this.allSlots.find((f) => f.GetBound()?.abilityId === event.abilityId);
			if (matchingSlot) {
				matchingSlot.SetCooldown({
					startTime: event.timeStart,
					length: event.length,
					endTime: event.timeEnd,
				});
			}
		});

		CoreNetwork.ServerToClient.AbilityAdded.Client.OnServerEvent((entityId, dto) => {
			const entity = this.entityController.GetEntityById(entityId);

			if (entity && entity instanceof CharacterEntity) {
				CoreClientSignals.AbilityAdded.Fire(new AbilityAddedClientSignal(entity, dto));
			}
		});

		CoreNetwork.ServerToClient.AbilityChargeBegan.Client.OnServerEvent((entityId, event) => {
			const entity = this.entityController.GetEntityById(entityId);

			if (!entity || !(entity instanceof CharacterEntity)) return;
			CoreClientSignals.AbilityChargeBegan.Fire(new AbilityChargeClientSignal(entity, event));
		});

		CoreNetwork.ServerToClient.AbilityChargeEnded.Client.OnServerEvent((entityId, event) => {
			const entity = this.entityController.GetEntityById(entityId);

			if (entity && entity instanceof CharacterEntity) {
				CoreClientSignals.AbilityChargeEnded.Fire(new AbilityChargeEndClientSignal(entity, event));
			}
		});
	}
}
