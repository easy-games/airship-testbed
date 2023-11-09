import { Ability } from "Shared/Strollers/Abilities/AbilityRegistry";
import { AbilityLogic } from "./AbilityLogic";
import { AbilitySlot } from "./AbilitySlot";
import { MapUtil } from "Shared/Util/MapUtil";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { CoreNetwork } from "Shared/CoreNetwork";
import { AbilityCancellationTrigger, AbilityConfig, AbilityDto, ChargingAbilityEndedState } from "./Ability";
import { Duration } from "Shared/Util/Duration";
import { Task } from "Shared/Util/Task";
import { SetTimeout } from "Shared/Util/Timer";
import { TimeUtil } from "Shared/Util/TimeUtil";

export interface AbilityCooldown {
	readonly length: Duration;
	readonly startedTimestamp: number;
}

export interface AbiltityChargingState {
	readonly timeStarted: number;
	readonly timeLength: Duration;
	readonly cancellationTriggers: Set<AbilityCancellationTrigger>;
}

interface CancellableAbiltityChargingState extends AbiltityChargingState {
	readonly abilityLogic: AbilityLogic;
	readonly onCancelled: () => void;
}

export class CharacterAbilities {
	private cooldowns = new Map<Ability, AbilityCooldown>();
	private boundAbilities = new Map<AbilitySlot, Map<string, AbilityLogic>>();

	private currentChargingAbilityState: CancellableAbiltityChargingState | undefined; // using promise rn because need cancellation

	public constructor(private entity: CharacterEntity) {}

	private GetAbilities() {
		const arr = new Array<[string, AbilityLogic]>();
		for (const [slot, boundItems] of this.boundAbilities) {
			for (const pair of boundItems) {
				arr.push(pair);
			}
		}

		return arr;
	}

	public HasAbilityWithIdAtSlot(id: string, slot: AbilitySlot): boolean {
		const abilityMap = MapUtil.GetOrCreate(this.boundAbilities, slot, () => new Map<string, AbilityLogic>());
		return abilityMap.has(id);
	}

	/**
	 * Adds the given ability to the character
	 * @param abilityId The ability's unique id
	 * @param slot The slot the ability is bound to
	 * @param logic The logic of the ability
	 *
	 * @server Server-only API
	 */
	public AddAbilityWithIdToSlot(
		abilityId: string,
		slot: AbilitySlot,
		ability: Ability,
		overrideConfig?: AbilityConfig,
	): AbilityLogic {
		assert(RunCore.IsServer(), "AddAbilityWithId should be called by the server");
		const abilityMap = MapUtil.GetOrCreate(this.boundAbilities, slot, () => new Map<string, AbilityLogic>());

		if (abilityMap.has(abilityId)) {
			warn(`Attempting to add duplicate ability '${abilityId}' - you can check using HasAbilityWithIdAtSlot(id)`);
			return abilityMap.get(abilityId)!;
		}

		const logic = new ability.logic(this.entity, abilityId, overrideConfig ?? ability.config);
		abilityMap.set(abilityId, logic);

		if (this.entity.player) {
			CoreNetwork.ServerToClient.AbilityAdded.Server.FireClient(this.entity.player.clientId, logic.Encode());
		}
		return logic;
	}

	/**
	 * Gets the currently charging abiltiy
	 */
	public GetChargingAbility(): AbiltityChargingState | undefined {
		return this.currentChargingAbilityState;
	}

	/**
	 * Gets the ability by the given id
	 * @param id The id of the ability
	 * @returns The ability logic
	 */
	public GetAbilityById(id: string) {
		return this.GetAbilities().find((f) => f[0] === id)?.[1];
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
	 * Use the ability with the given `id`
	 *
	 * @param id The id of the ability to use
	 * @server Server-only API
	 */
	public UseAbilityById(id: string) {
		if (RunCore.IsServer()) {
			const ability = this.GetAbilityById(id);
			if (ability) {
				const config = ability.GetConfiguration();
				if (config.charge) {
					const chargeTime = config.charge.chargeTimeSeconds;

					ability.OnChargeBegan();
					CoreNetwork.ServerToClient.AbilityChargeBegan.Server.FireClient(this.entity.player!.clientId, {
						id,
						timeStart: TimeUtil.GetServerTime(),
						timeEnd: TimeUtil.GetServerTime() + chargeTime,
						length: chargeTime,
					});

					// The current state of what's being 'charged' ability-wise
					this.currentChargingAbilityState = {
						timeStarted: TimeUtil.GetServerTime(),
						timeLength: Duration.fromSeconds(chargeTime),
						abilityLogic: ability,
						cancellationTriggers: new Set(config.charge.cancelTriggers),
						onCancelled: SetTimeout(chargeTime, () => {
							ability.OnTriggered();
							this.currentChargingAbilityState = undefined;
							CoreNetwork.ServerToClient.AbilityChargeEnded.Server.FireClient(
								this.entity.player!.clientId,
								{ id, endState: ChargingAbilityEndedState.Finished },
							);
						}),
					};
				} else {
					ability.OnTriggered();
				}
			}
		} else {
			throw `UseAbilityById can only be used by the server!`;
		}
	}

	/**
	 * Cancel any charging abilities
	 * @returns True if a charging ability was cancelled
	 */
	public CancelChargingAbility(): boolean {
		if (this.currentChargingAbilityState) {
			// Handle the cancellation behaviour
			this.currentChargingAbilityState.onCancelled();
			CoreNetwork.ServerToClient.AbilityChargeEnded.Server.FireClient(this.entity.player!.clientId, {
				id: this.currentChargingAbilityState.abilityLogic.GetId(),
				endState: ChargingAbilityEndedState.Cancelled,
			});
			this.currentChargingAbilityState.abilityLogic.OnChargeCancelled();
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
	public Encode() {
		const items = new Array<AbilityDto>();
		for (const [slot, abilityMap] of this.boundAbilities) {
			for (const [abilityId, abilityLogic] of abilityMap) {
				items.push(abilityLogic.Encode());
			}
		}
		return items;
	}
}
