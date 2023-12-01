import { CoreNetwork } from "Shared/CoreNetwork";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Ability } from "Shared/Strollers/Abilities/AbilityRegistry";
import { Duration } from "Shared/Util/Duration";
import { MapUtil } from "Shared/Util/MapUtil";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { SetTimeout } from "Shared/Util/Timer";
import {
	AbilityCancellationTrigger,
	AbilityConfig,
	AbilityDto,
	AbilityKind,
	ChargingAbilityEndedState,
} from "./Ability";
import { AbilityLogic } from "./AbilityLogic";
import { AbilitySlot } from "./AbilitySlot";

export interface AbilityCooldown {
	readonly length: Duration;
	readonly startTimestamp: number;
	readonly endTimestamp: number;
}

export interface AbilityChargingState {
	readonly id: string;
	readonly timeStarted: number;
	readonly timeLength: Duration;
	readonly cancellationTriggers: ReadonlySet<AbilityCancellationTrigger>;
}

interface CancellableAbiltityChargingState extends AbilityChargingState {
	readonly abilityLogic: AbilityLogic;
	readonly cancel: () => void;
}

export class CharacterAbilities {
	private abilityIdSlotMap = new Map<string, AbilitySlot>();
	private abilityIdPassiveMap = new Map<string, AbilityLogic>();

	private cooldowns = new Map<string, AbilityCooldown>();
	private boundAbilities = new Map<AbilitySlot, Map<string, AbilityLogic>>();

	private currentChargingAbilityState: CancellableAbiltityChargingState | undefined; // using promise rn because need cancellation

	public constructor(private entity: CharacterEntity) {
		const bin = entity.GetBin();

		if (RunCore.IsServer()) {
			// Server event handling
			bin.Add(
				entity.OnMoveDirectionChanged.Connect((moveDirection) => {
					const currentlyCharging = this.GetChargingAbility();
					if (moveDirection !== Vector3.zero) {
						// If the entity moves, and is charging an ability that cancels on movement - cancel it!
						if (
							currentlyCharging !== undefined &&
							currentlyCharging.cancellationTriggers.has(AbilityCancellationTrigger.EntityMovement)
						) {
							this.CancelChargingAbility();
						}
					}
				}),
			);
			bin.Add(
				entity.OnDeath.Connect(() => {
					this.RemoveAllAbilities();
				}),
			);
		}
	}

	private SetAbilityOnCooldown(id: string, length: number) {
		const time = TimeUtil.GetServerTime();

		this.cooldowns.set(id, {
			startTimestamp: time,
			endTimestamp: time + length,
			length: Duration.fromSeconds(length),
		});

		CoreNetwork.ServerToClient.AbilityCooldownStateChange.Server.FireClient(this.entity.player!.clientId, {
			id,
			timeEnd: time + length,
			length,
			timeStart: time,
		});
	}

	/**
	 * Returns all the abilities registered to this character
	 * @returns A map of the ability id to the ability logics
	 */
	public GetAbilities(): ReadonlyMap<string, AbilityLogic> {
		const arr = new Map<string, AbilityLogic>();
		for (const [slot, boundItems] of this.boundAbilities) {
			for (const [abilityId, ability] of boundItems) {
				arr.set(abilityId, ability);
			}
		}
		for (const [id, logic] of this.abilityIdPassiveMap) {
			arr.set(id, logic);
		}

		return arr;
	}

	/**
	 * Returns whether or not the id matches an ability registered to this character, at the given ability slot
	 * @param id The id to check
	 * @param slot The slot to check against
	 * @returns True if the character has an ability with this id, at the given slot
	 */
	public HasAbilityWithIdAtSlot(id: string, slot: AbilitySlot): boolean {
		const abilityMap = MapUtil.GetOrCreate(this.boundAbilities, slot, () => new Map<string, AbilityLogic>());
		return abilityMap.has(id);
	}

	/**
	 * Returns whether or not the id matches an ability registered to this character
	 * @param id The id to check
	 * @returns True if the character has an ability with this id
	 */
	public HasAbilityWithId(id: string): boolean {
		return this.abilityIdSlotMap.has(id) || this.abilityIdPassiveMap.has(id);
	}

	/**
	 * Adds the given ability to the character
	 *
	 * @param abilityId The ability's unique id
	 * @param ability The ability being given to the character
	 * @return logic The logic of the ability
	 */
	public AddAbilityWithId(abilityId: string, ability: Ability, overrideConfig?: AbilityConfig): AbilityLogic {
		switch (ability.config.kind) {
			case AbilityKind.Active:
				return this.AddActiveAbilityWithId(abilityId, ability, overrideConfig);
			case AbilityKind.Passive:
				return this.AddPassiveAbilityWithId(abilityId, ability, overrideConfig);
		}
	}

	/**
	 * Adds the given **active** ability to the character
	 *
	 * @param abilityId The ability's unique id
	 * @param ability The ability being given to the character
	 * @return logic The logic of the ability
	 */
	private AddActiveAbilityWithId(abilityId: string, ability: Ability, overrideConfig?: AbilityConfig): AbilityLogic {
		if (!ability.config.slot) {
			error(`Attempting to add active ability '${abilityId}' without specifying a slot.`);
		}

		const abilityMap = MapUtil.GetOrCreate(
			this.boundAbilities,
			ability.config.slot,
			() => new Map<string, AbilityLogic>(),
		);

		if (abilityMap.has(abilityId)) {
			warn(`Attempting to add duplicate ability '${abilityId}' - you can check using HasAbilityWithIdAtSlot(id)`);
			return abilityMap.get(abilityId)!;
		}

		if (this.HasAbilityWithId(abilityId)) {
			warn(`Attempting to add duplicate ability '${abilityId}' - you can check using HasAbilityWithIdAtSlot(id)`);
			return this.GetAbilityLogicById(abilityId)!;
		}

		const logic = new ability.logic(this.entity, abilityId, overrideConfig ?? ability.config);
		logic.SetEnabled(true);
		abilityMap.set(abilityId, logic);
		this.abilityIdSlotMap.set(abilityId, ability.config.slot);

		if (RunCore.IsServer() && this.entity.player) {
			CoreNetwork.ServerToClient.AbilityAdded.Server.FireAllClients(this.entity.id, logic.Encode());
		}

		return logic;
	}

	/**
	 * Adds the given **passive** ability to the character
	 *
	 * @param abilityId The ability's unique id
	 * @param ability The ability being given to the character
	 * @return The logic of the ability
	 */
	private AddPassiveAbilityWithId(abilityId: string, ability: Ability, overrideConfig?: AbilityConfig): AbilityLogic {
		if (this.HasAbilityWithId(abilityId)) {
			warn(`Attempting to add duplicate ability '${abilityId}' - you can check using HasAbilityWithIdAtSlot(id)`);
			return this.GetAbilityLogicById(abilityId)!;
		}
		const logic = new ability.logic(this.entity, abilityId, overrideConfig ?? ability.config);
		logic.SetEnabled(true);
		this.abilityIdPassiveMap.set(abilityId, logic);
		if (RunCore.IsServer() && this.entity.player) {
			CoreNetwork.ServerToClient.AbilityAdded.Server.FireAllClients(this.entity.id, logic.Encode());
		}

		return logic;
	}

	/**
	 * Sets the ability state of the given ability
	 * @param abilityId The ability's unique id
	 * @param enabledState The ability's new enabled state
	 * @returns Whether or not the state was sucessfully updated
	 */
	public SetAbilityEnabledState(abilityId: string, enabledState: boolean): boolean {
		const abilityLogic = this.GetAbilityLogicById(abilityId);
		if (!abilityLogic) return false;
		abilityLogic.SetEnabled(enabledState);
		if (RunCore.IsServer() && this.entity.player) {
			CoreNetwork.ServerToClient.AbilityStateChange.Server.FireAllClients(
				this.entity.id,
				abilityId,
				enabledState,
			);
		}
		return true;
	}

	/**
	 * Removes the ability with the given id from this character
	 * @param abilityId The ability id to remove
	 * @returns True if the ability was removed
	 */
	public RemoveAbilityById(abilityId: string): boolean {
		if (!this.HasAbilityWithId(abilityId)) {
			return false;
		}
		const passiveAbility = this.abilityIdPassiveMap.get(abilityId);
		if (passiveAbility) {
			return this.removePassiveAbilityById(abilityId);
		} else {
			return this.removeActiveAbilityById(abilityId);
		}
	}

	/**
	 * Removes the **active** ability with the given id from this character
	 * @param abilityId The ability id to remove
	 * @returns True if the ability was removed
	 */
	private removeActiveAbilityById(abilityId: string): boolean {
		const abilityLogic = this.GetAbilityLogicById(abilityId);
		if (abilityLogic) abilityLogic.SetEnabled(false);

		const abilitySlot = this.abilityIdSlotMap.get(abilityId);
		if (!abilitySlot) return false;

		const boundSlotAbilities = this.boundAbilities.get(abilitySlot);
		if (!boundSlotAbilities) {
			return false;
		}

		if (this.currentChargingAbilityState?.id === abilityId) {
			this.CancelChargingAbility();
		}

		boundSlotAbilities.delete(abilityId);
		this.abilityIdSlotMap.delete(abilityId);

		if (RunCore.IsServer() && this.entity.player) {
			CoreNetwork.ServerToClient.AbilityRemoved.Server.FireAllClients(this.entity.id, abilityId);
		}

		return true;
	}

	/**
	 * Removes the **active** ability with the given id from this character
	 * @param abilityId The ability id to remove
	 * @returns True if the ability was removed
	 */
	private removePassiveAbilityById(abilityId: string): boolean {
		const abilityLogic = this.GetAbilityLogicById(abilityId);
		if (abilityLogic) abilityLogic.SetEnabled(false);

		this.abilityIdPassiveMap.delete(abilityId);
		if (RunCore.IsServer() && this.entity.player) {
			CoreNetwork.ServerToClient.AbilityRemoved.Server.FireAllClients(this.entity.id, abilityId);
		}
		return true;
	}

	/**
	 * Removes all abilities from this character
	 */
	public RemoveAllAbilities() {
		for (const [_id, logic] of this.GetAbilities()) {
			logic.SetEnabled(false);
		}
		this.abilityIdSlotMap.clear();
		this.abilityIdPassiveMap.clear();
		this.boundAbilities.clear();

		if (RunCore.IsServer() && this.entity.player) {
			CoreNetwork.ServerToClient.AbilitiesCleared.Server.FireAllClients(this.entity.id);
		}
	}

	/**
	 * Gets the currently charging abiltiy
	 *
	 * @server Server-only API
	 */
	public GetChargingAbility(): AbilityChargingState | undefined {
		return this.currentChargingAbilityState;
	}

	/**
	 * Gets the ability by the given id
	 * @param id The id of the ability
	 * @returns The ability logic
	 *
	 * @server Server-only API
	 */
	public GetAbilityLogicById(id: string): AbilityLogic | undefined {
		return this.GetAbilities().get(id);
	}

	/**
	 * Gets all abilities bound to the given slot
	 * @param slot The slot
	 * @returns All the abilities bound to this slot
	 */
	public GetAbilitiesBoundToSlot(slot: AbilitySlot): Map<string, AbilityLogic> {
		return this.boundAbilities.get(slot) ?? new Map();
	}

	/**
	 * Returns whether or not the given ability is on cooldown
	 * @param abilityId The ability id to check for cooldown state
	 * @returns True if the ability is on cooldown
	 *
	 * @server Server-only API
	 */
	public IsAbilityOnCooldown(abilityId: string): boolean {
		const cooldown = this.cooldowns.get(abilityId);
		if (cooldown) {
			return cooldown.startTimestamp + cooldown.length.getTotalSeconds() > TimeUtil.GetServerTime();
		} else {
			return false;
		}
	}

	/**
	 * Use the ability with the given `id`
	 *
	 * @param id The id of the ability to use
	 * @server Server-only API
	 */
	public UseAbilityById(id: string) {
		if (this.IsAbilityOnCooldown(id)) {
			return;
		}

		const ability = this.GetAbilityLogicById(id);
		if (!ability?.GetEnabled()) return;

		// can't cast while casting
		if (this.currentChargingAbilityState !== undefined) return;

		if (RunCore.IsServer()) {
			if (ability) {
				const currentTime = TimeUtil.GetServerTime();
				const config = ability.GetConfig();

				// Handle charging, if it's a charge ability otherwise default trigger
				if (config.charge) {
					const chargeTime = config.charge.chargeTimeSeconds;
					const cancellation = config.charge.cancelTriggers;

					// Cancel immediately if moving
					if (
						cancellation.includes(AbilityCancellationTrigger.EntityMovement) &&
						this.entity.GetMoveDirection() !== Vector3.zero
					) {
						return;
					}

					ability.OnServerChargeBegan();

					CoreNetwork.ServerToClient.AbilityChargeBegan.Server.FireAllClients(this.entity.id, {
						id,
						timeStart: currentTime,
						displayText: config.charge.displayText ?? `Charging '${config.name}'...`,
						timeEnd: currentTime + chargeTime,
						length: chargeTime,
					});

					const cancelTimeout = SetTimeout(chargeTime, () => {
						ability.OnServerChargeEnded({
							endState: ChargingAbilityEndedState.Finished,
						});
						ability.Trigger();

						this.currentChargingAbilityState = undefined;
						CoreNetwork.ServerToClient.AbilityChargeEnded.Server.FireAllClients(this.entity.id, {
							id,
							endState: ChargingAbilityEndedState.Finished,
						});

						// Handle setting the cooldown
						if (config.cooldownTimeSeconds) {
							this.SetAbilityOnCooldown(id, config.cooldownTimeSeconds);
						}
					});

					// The current state of what's being 'charged' ability-wise
					this.currentChargingAbilityState = {
						id,
						timeStarted: TimeUtil.GetServerTime(),
						timeLength: Duration.fromSeconds(chargeTime),
						abilityLogic: ability,
						cancellationTriggers: new Set(config.charge.cancelTriggers),
						cancel: () => {
							cancelTimeout();

							ability.OnServerChargeEnded({
								endState: ChargingAbilityEndedState.Cancelled,
							});

							CoreNetwork.ServerToClient.AbilityChargeEnded.Server.FireAllClients(this.entity.id, {
								id,
								endState: ChargingAbilityEndedState.Cancelled,
							});
						},
					};
				} else {
					// Handle setting the cooldown
					if (config.cooldownTimeSeconds) {
						this.SetAbilityOnCooldown(id, config.cooldownTimeSeconds);
					}

					ability.Trigger();
				}
			}
		} else {
			CoreNetwork.ClientToServer.UseAbility.Client.FireServer({
				abilityId: id,
			});
		}
	}

	/**
	 * Cancel any charging abilities
	 * @returns True if a charging ability was cancelled
	 *
	 * @server Server-only API
	 */
	public CancelChargingAbility(): boolean {
		if (this.currentChargingAbilityState) {
			// Handle the cancellation behaviour
			this.currentChargingAbilityState.cancel();
			this.currentChargingAbilityState = undefined;
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Gets all abilities as an array of data transfer objects
	 * @returns The array of data transfer objects
	 */
	public Encode(): AbilityDto[] {
		const items = new Array<AbilityDto>();
		for (const [slot, abilityMap] of this.boundAbilities) {
			for (const [abilityId, abilityLogic] of abilityMap) {
				items.push(abilityLogic.Encode());
			}
		}
		return items;
	}
}
