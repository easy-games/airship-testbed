import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Keyboard } from "Shared/UserInput";
import { AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";
import { AbilityDto } from "Shared/Abilities/Ability";
import { AbilitySlot } from "Shared/Abilities/AbilitySlot";
import { Bin } from "Shared/Util/Bin";
import { AbilityBinding, BindingAction, BindingInputState } from "./Class/AbilityBinding";
import inspect from "@easy-games/unity-inspect";
import { SignalPriority } from "Shared/Util/Signal";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { AbilityChargeClientSignal } from "./Event/AbilityChargeClientSignal";
import { AbilityChargeEndClientSignal } from "./Event/AbilityChargeEndClientSignal";
import { EntityController } from "../Entity/EntityController";
import { AbilityAddedClientSignal } from "./Event/AbilityAddedClientSignal";
import { AbilityRemovedClientSignal } from "./Event/AbilityRemovedClientSignal";
import { AbilitiesClearedClientSignal } from "./Event/AbilitiesClearedClientSignal";

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
		private readonly entityService: EntityController,
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
		const matchingSlot = this.allSlots.find((f) => f.GetBound()?.id === abilityId);
		if (matchingSlot) {
			matchingSlot.Unbind();
		}
	}

	// TODO: in future a much friendlier Input API
	private OnKeyboardInputEnded: BindingAction = (state, binding) => {
		const boundAbilityId = binding.GetBound()?.id;

		if (state === BindingInputState.InputEnded && boundAbilityId) {
			CoreNetwork.ClientToServer.UseAbility.Client.FireServer({
				abilityId: boundAbilityId,
			});
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
					this.RegisterAbility(ability);
				}
			}
		});

		CoreClientSignals.AbilityAdded.Connect((event) => {
			const abilities = event.characterEntity.GetAbilities();
			const ability = this.abilityRegistry.GetAbilityById(event.ability.id);
			if (ability) {
				abilities.AddAbilityWithId(event.ability.id, ability);
			}

			if (event.IsLocalPlayer()) {
				this.RegisterAbility(event.ability);
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

		CoreNetwork.ServerToClient.AbilityRemoved.Client.OnServerEvent((entityId, abilityId) => {
			const entity = this.entityService.GetEntityById(entityId);

			if (entity && entity instanceof CharacterEntity) {
				CoreClientSignals.AbilityRemoved.Fire(new AbilityRemovedClientSignal(entity, abilityId));
			}
		});

		CoreNetwork.ServerToClient.AbilitiesCleared.Client.OnServerEvent((entityId) => {
			const entity = this.entityService.GetEntityById(entityId);

			if (entity && entity instanceof CharacterEntity) {
				CoreClientSignals.AbilitiesCleared.Fire(new AbilitiesClearedClientSignal(entity));
			}
		});

		CoreNetwork.ServerToClient.AbilityCooldownStateChange.Client.OnServerEvent((event) => {
			const matchingSlot = this.allSlots.find((f) => f.GetBound()?.id === event.id);
			if (matchingSlot) {
				matchingSlot.SetCooldown({
					startTime: event.timeStart,
					length: event.length,
					endTime: event.timeEnd,
				});
			}
		});

		CoreNetwork.ServerToClient.AbilityAdded.Client.OnServerEvent((entityId, dto) => {
			const entity = this.entityService.GetEntityById(entityId);

			if (entity && entity instanceof CharacterEntity) {
				CoreClientSignals.AbilityAdded.Fire(new AbilityAddedClientSignal(entity, dto));
			}
		});

		CoreNetwork.ServerToClient.AbilityChargeBegan.Client.OnServerEvent((entityId, event) => {
			const entity = this.entityService.GetEntityById(entityId);

			if (entity && entity instanceof CharacterEntity) {
				CoreClientSignals.AbilityChargeBegan.Fire(new AbilityChargeClientSignal(entity, event));
			}
		});

		CoreNetwork.ServerToClient.AbilityChargeEnded.Client.OnServerEvent((entityId, event) => {
			const entity = this.entityService.GetEntityById(entityId);

			if (entity && entity instanceof CharacterEntity) {
				CoreClientSignals.AbilityChargeEnded.Fire(new AbilityChargeEndClientSignal(entity, event));
			}
		});
	}
}
