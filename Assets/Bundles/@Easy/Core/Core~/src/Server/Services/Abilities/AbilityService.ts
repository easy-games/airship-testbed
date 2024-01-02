import { OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Server/CoreServerSignals";
import {
	AbilityCancellationTrigger,
	AbilityChargingState,
	AbilityCooldown,
	ChargingAbilityEndedState,
} from "Shared/Abilities/Ability";
import { AbilityUtil } from "Shared/Abilities/AbilityUtil";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Ability, AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";
import { Bin } from "Shared/Util/Bin";
import { Duration } from "Shared/Util/Duration";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { SetTimeout } from "Shared/Util/Timer";
import { EntityService } from "../Entity/EntityService";

@Service({})
export class AbilityService implements OnStart {
	/** Mapping of **client id** to owned ability ids. */
	private abilityMap = new Map<number, string[]>();
	/** Mapping of **client id** to ability cooldown states. */
	private cooldownMap = new Map<number, Map<string, AbilityCooldown>>();
	/** Mapping of **client id** to ability enabled states. */
	private enabledMap = new Map<number, Map<string, boolean>>();
	/** Mapping of **client id** to ability charging state. */
	private chargingMap = new Map<number, AbilityChargingState>();

	constructor(private readonly abilityRegistry: AbilityRegistry, private readonly entityService: EntityService) {}

	OnStart(): void {
		CoreNetwork.ClientToServer.AbilityActivateRequest.Server.OnClientEvent((clientId, abilityId) => {
			this.UseAbility(clientId, abilityId);
		});
	}

	/**
	 * Attempts use provided ability for client. Ability is successfully used if the ability
	 * exists and `CanUseAbility` validation is successful.
	 *
	 * @param clientId The client using ability.
	 * @param abilityId The ability client is using.
	 */
	private UseAbility(clientId: number, abilityId: string): void {
		if (!this.CanUseAbility(clientId, abilityId)) return;
		const abilityMeta = this.abilityRegistry.GetAbilityById(abilityId);
		if (!abilityMeta) return;
		if (abilityMeta.config.charge) {
			this.HandleChargeAbility(clientId, abilityMeta);
		} else {
			CoreServerSignals.AbilityUsed.Fire({ clientId: clientId, abilityId: abilityId });
			CoreNetwork.ServerToClient.AbilityUsed.Server.FireAllClients(clientId, abilityId);
			this.SetAbilityOnCooldown(clientId, abilityId);
		}
	}

	/**
	 * Begins charging ability for provided client. If the ability completely charges,
	 * the ability is used.
	 *
	 * @param clientId The client using ability.
	 * @param abilityMeta The ability meta of the ability the client is using.
	 */
	private HandleChargeAbility(clientId: number, abilityMeta: Ability): void {
		const chargeMeta = abilityMeta.config.charge;
		if (!chargeMeta) return;
		const chargeTime = chargeMeta.chargeTimeSeconds;
		const chargeText = chargeMeta.displayText ?? `Charging '${abilityMeta.config.name}'...`;
		if (chargeTime === undefined) return;
		const now = TimeUtil.GetServerTime();
		const chargeEndTime = now + chargeTime;
		const chargingAbilityDto = {
			abilityId: abilityMeta.id,
			displayText: chargeText,
			length: chargeMeta.chargeTimeSeconds,
			timeStart: now,
			timeEnd: chargeEndTime,
		};
		CoreNetwork.ServerToClient.AbilityChargeStarted.Server.FireAllClients(clientId, chargingAbilityDto);
		CoreServerSignals.AbilityChargeStarted.Fire({ clientId: clientId, chargingAbilityDto: chargingAbilityDto });

		let triggerBin: Bin | undefined;

		const cancellableAbility = SetTimeout(chargeTime, () => {
			const chargingAbilityEndedDto = {
				abilityId: abilityMeta.id,
				endState: ChargingAbilityEndedState.Finished,
			};
			CoreNetwork.ServerToClient.AbilityChargeEnded.Server.FireAllClients(clientId, chargingAbilityEndedDto);
			CoreServerSignals.AbilityChargeEnded.Fire({
				clientId: clientId,
				chargingAbilityEndedDto: chargingAbilityEndedDto,
			});

			if (triggerBin) triggerBin.Clean();
			CoreServerSignals.AbilityUsed.Fire({ clientId: clientId, abilityId: abilityMeta.id });
			CoreNetwork.ServerToClient.AbilityUsed.Server.FireAllClients(clientId, abilityMeta.id);
			this.chargingMap.delete(clientId);
			if (abilityMeta.config.cooldownTimeSeconds) {
				this.SetAbilityOnCooldown(clientId, abilityMeta.id);
			}
		});

		triggerBin = this.CreateCancellationTriggers(
			clientId,
			abilityMeta.id,
			chargeMeta.cancelTriggers,
			cancellableAbility,
			() => {
				const cancelledChargingAbilityEndedDto = {
					abilityId: abilityMeta.id,
					endState: ChargingAbilityEndedState.Cancelled,
				};
				CoreNetwork.ServerToClient.AbilityChargeEnded.Server.FireAllClients(
					clientId,
					cancelledChargingAbilityEndedDto,
				);
				CoreServerSignals.AbilityChargeEnded.Fire({
					clientId: clientId,
					chargingAbilityEndedDto: cancelledChargingAbilityEndedDto,
				});
				this.chargingMap.delete(clientId);
			},
		);

		this.chargingMap.set(clientId, {
			abilityId: abilityMeta.id,
			cancel: cancellableAbility,
			timeStarted: now,
			timeLength: Duration.FromSeconds(chargeEndTime),
			cancellationTriggers: new ReadonlySet<AbilityCancellationTrigger>(chargeMeta.cancelTriggers),
		});
	}

	/**
	 * Creates cancellation triggers for charge ability. If a cancellation trigger is triggered,
	 * the ability is immediately cancelled, and all trigger connections are cleaned up. Returns
	 * `Bin` that cleans up cancellation triggers if ability is successfully used.
	 *
	 * @param clientId The client using a charge ability.
	 * @param abilityId The id of the ability being charged.
	 * @param cancellationTriggers The triggers that cancel ability.
	 * @param cancelCallback Callback that cancels scheduled ability.
	 * @param chargeEndedCallback Callback that fires charge ended remote and signals.
	 * @returns Bin that cleans up cancellation triggers.
	 */
	private CreateCancellationTriggers(
		clientId: number,
		abilityId: string,
		cancellationTriggers: readonly AbilityCancellationTrigger[],
		cancelCallback: () => void,
		chargeEndedCallback: () => void,
	): Bin {
		const entity = this.entityService.GetEntityByClientId(clientId) as CharacterEntity | undefined;
		if (!entity) cancelCallback();
		const triggerBin = new Bin();
		let cancelled = false;
		const cleanup = () => {
			cancelled = true;
			cancelCallback();
			chargeEndedCallback();
			triggerBin.Clean();
		};

		// We **always** cancel charge abilities on death.
		triggerBin.Add(
			CoreServerSignals.EntityDeath.Connect((event) => {
				if (event.entity.ClientId === clientId) cleanup();
			}),
		);
		// We **always** cancel the charge ability if it is removed.
		triggerBin.Add(
			CoreServerSignals.AbilityRemoved.Connect((event) => {
				if (event.clientId === clientId && event.abilityId === abilityId) cleanup();
			}),
		);
		// We **always** cancel the charge ability if it is disabled.
		triggerBin.Add(
			CoreServerSignals.AbilityDisabled.Connect((event) => {
				if (event.clientId === clientId && event.abilityId === abilityId) cleanup();
			}),
		);

		for (const trigger of cancellationTriggers) {
			if (cancelled) break;
			switch (trigger) {
				case AbilityCancellationTrigger.EntityDamageTaken:
					triggerBin.Add(
						CoreServerSignals.EntityDamage.Connect((event) => {
							if (event.entity.ClientId === clientId) cleanup();
						}),
					);
					break;
				case AbilityCancellationTrigger.EntityMovement:
					if (entity) {
						triggerBin.Add(entity.OnMoveDirectionChanged.Connect(() => cleanup()));
					}
					break;
				case AbilityCancellationTrigger.EntityFiredProjectile:
					triggerBin.Add(
						CoreServerSignals.ProjectileFired.Connect((event) => {
							if (event.shooter.ClientId === clientId) cleanup();
						}),
					);
					break;
			}
		}
		return triggerBin;
	}

	/**
	 * Adds the provided ability to client `clientId`. Returns whether or not ability was successfully added to client.
	 *
	 * @param clientId The client that the provided ability is being added to.
	 * @param abilityId The ability to add to client.
	 * @returns Whether or not ability was successfully added to client.
	 */
	public AddAbilityToClient(clientId: number, abilityId: string): boolean {
		if (this.ClientHasAbility(clientId, abilityId)) return false;
		const abilityMeta = this.abilityRegistry.GetAbilityById(abilityId);
		if (!abilityMeta) return false;

		const clientAbilities = this.abilityMap.get(clientId);
		if (!clientAbilities) {
			this.abilityMap.set(clientId, [abilityId]);
		} else {
			clientAbilities.push(abilityId);
		}
		const abilityDto = AbilityUtil.CreateAbilityDto(abilityId, true);
		if (abilityDto) {
			CoreNetwork.ServerToClient.AbilityAdded.Server.FireAllClients(clientId, abilityDto);
		}
		CoreServerSignals.AbilityAdded.Fire({ clientId: clientId, abilityId: abilityId });
		// Abilities _automatically_ enable on add.
		// TODO: We might want to make this configurable?
		// Use case: An ability is added to a client when they are cc'd or stunned?
		this.SetAbilityEnabledState(clientId, abilityId, true);
		return true;
	}

	/**
	 * Removes the provided ability to client `clientId`. Returns whether or not ability was removed from client.
	 *
	 * @param clientId The client that the provided ability is being removed from.
	 * @param abilityId The ability to remove from to client.
	 * @returns Whether or not ability was removed from client.
	 */
	public RemoveAbilityFromClient(clientId: number, abilityId: string): boolean {
		if (!this.ClientHasAbility(clientId, abilityId)) return false;
		const clientAbilities = this.abilityMap.get(clientId);
		if (!clientAbilities) return false;
		const updatedAbilities = clientAbilities.filter((clientAbilityId) => clientAbilityId !== abilityId);
		this.abilityMap.set(clientId, updatedAbilities);
		CoreServerSignals.AbilityRemoved.Fire({ clientId: clientId, abilityId: abilityId });
		CoreNetwork.ServerToClient.AbilityRemoved.Server.FireAllClients(clientId, abilityId);
		return true;
	}

	/**
	 * Returns whether or not client has provided ability.
	 *
	 * @param clientId The client that is being queried.
	 * @param abilityId The ability that the client is being checked for.
	 * @returns Whether or not client has provided ability.
	 */
	public ClientHasAbility(clientId: number, abilityId: string): boolean {
		const abilityEntries = this.abilityMap.get(clientId);
		if (!abilityEntries) {
			return false;
		}

		return abilityEntries.some((clientAbilityId) => clientAbilityId === abilityId);
	}

	/**
	 * Sets the client's ability on cooldown for the provided duration. Returns whether or not the cooldown was
	 * successfully applied.
	 *
	 * @param clientId The client that ability cooldown is being set for.
	 * @param abilityId The ability to set on cooldown.
	 * @param duration The cooldown duration in **seconds**.
	 * @returns Whether or not the cooldown was successfully applied.
	 */
	public SetAbilityOnCooldown(clientId: number, abilityId: string, duration?: number): boolean {
		if (!this.ClientHasAbility(clientId, abilityId)) return false;
		const abilityMeta = this.abilityRegistry.GetAbilityById(abilityId);
		if (!abilityMeta) return false;
		const cooldownDuration = duration ?? abilityMeta.config.cooldownTimeSeconds;
		if (!cooldownDuration) return false;
		const now = TimeUtil.GetServerTime();
		const cooldownEnd = now + cooldownDuration;
		const abilityCooldown: AbilityCooldown = {
			startTimestamp: now,
			endTimestamp: cooldownEnd,
			length: Duration.FromSeconds(cooldownDuration),
		};
		const clientCooldowns = this.cooldownMap.get(clientId);
		if (!clientCooldowns) {
			const cooldownEntry = new Map<string, AbilityCooldown>([[abilityId, abilityCooldown]]);
			this.cooldownMap.set(clientId, cooldownEntry);
		} else {
			clientCooldowns.set(abilityId, abilityCooldown);
		}
		CoreNetwork.ServerToClient.AbilityCooldownStateChange.Server.FireClient(clientId, {
			abilityId: abilityId,
			timeStart: abilityCooldown.startTimestamp,
			timeEnd: abilityCooldown.endTimestamp,
			length: cooldownDuration,
		});
		return true;
	}

	/**
	 * Sets the client's ability enabled state. Returns whether or not the state was successfully updated.
	 * If this function returns `false` the client either does **not** have the provided ability or the
	 * ability was already in the provided state.
	 *
	 * @param clientId The client that ability enabled state is being set for.
	 * @param abilityId The ability to enabled or disable.
	 * @param enabled The ability's new enabled state.
	 * @returns Whether or not the abillity's state was successfully updated.
	 */
	public SetAbilityEnabledState(clientId: number, abilityId: string, enabled: boolean): boolean {
		if (!this.ClientHasAbility(clientId, abilityId)) return false;
		const clientEnabledStates = this.enabledMap.get(clientId);
		if (!clientEnabledStates) {
			const enabledEntry = new Map<string, boolean>([[abilityId, enabled]]);
			this.enabledMap.set(clientId, enabledEntry);
			CoreNetwork.ServerToClient.AbilityStateChange.Server.FireAllClients(clientId, abilityId, enabled);
			this.FireAbilityEnabledStateUpdateSignal(clientId, abilityId, enabled);

			return true;
		} else {
			const currentEnabledState = clientEnabledStates.get(abilityId);
			if (currentEnabledState === enabled) return false;
			clientEnabledStates.set(abilityId, enabled);
			CoreNetwork.ServerToClient.AbilityStateChange.Server.FireAllClients(clientId, abilityId, enabled);
			this.FireAbilityEnabledStateUpdateSignal(clientId, abilityId, enabled);

			return true;
		}
	}

	/**
	 * Fires either `AbilityEnabled` or `AbilityDisabled` signal based on updated ability
	 * state.
	 *
	 * @param clientId The client whose ability had a state update.
	 * @param abilityId The ability that had a state update.
	 * @param enabled The ability's new enabled state.
	 */
	private FireAbilityEnabledStateUpdateSignal(clientId: number, abilityId: string, enabled: boolean): void {
		if (enabled) {
			CoreServerSignals.AbilityEnabled.Fire({ clientId: clientId, abilityId: abilityId });
		} else {
			CoreServerSignals.AbilityDisabled.Fire({ clientId: clientId, abilityId: abilityId });
		}
	}

	/**
	 * Returns whether- or not the provided ability is disabled for client. If the client does
	 * **not** have the provided ability, this function returns `true`.
	 *
	 * @param clientId The client that is being queried.
	 * @param abilityId The ability that is being queried for enabled state.
	 * @returns Whether or not the provided ability is disabled for client.
	 */
	public IsAbilityDisabled(clientId: number, abilityId: string): boolean {
		if (!this.ClientHasAbility(clientId, abilityId)) return true;
		const clientEnabledStates = this.enabledMap.get(clientId);
		if (!clientEnabledStates) return true;
		const abilityState = clientEnabledStates.get(abilityId);
		if (abilityState === undefined) return true;
		return abilityState === false;
	}

	/**
	 * Returns whether or not the provided ability is on cooldown for client. If the client does
	 * **not** have the provided ability, this function returns `false`.
	 *
	 * @param clientId The client that is being queried.
	 * @param abilityId The ability that is being queried for cooldown.
	 * @returns Whether or not the provided ability on cooldown for client.
	 */
	public IsAbilityOnCooldown(clientId: number, abilityId: string): boolean {
		const abilityMeta = this.abilityRegistry.GetAbilityById(abilityId);
		if (!abilityMeta) return false;
		if (abilityMeta.config.cooldownTimeSeconds === undefined) return false;
		if (!this.ClientHasAbility(clientId, abilityId)) return false;
		const clientCooldowns = this.cooldownMap.get(clientId);
		if (!clientCooldowns) return false;
		const abilityCooldown = clientCooldowns.get(abilityId);
		if (!abilityCooldown) return false;
		const now = TimeUtil.GetServerTime();
		return abilityCooldown.endTimestamp > now;
	}

	/**
	 * Returns whether or not the provided client is **currently** charging an
	 * ability.
	 *
	 * @param clientId The client that is being queried.
	 * @returns Whether or not the client is currently charging an ability.
	 */
	public IsClientChargingAbility(clientId: number): boolean {
		return this.chargingMap.has(clientId);
	}

	/**
	 * Returns whether or not the provided ability is _currently_ usable by the client. An ability
	 * is usable if it is **not** disabled, **not** on cooldown, **not** charging an ability, and an entity **currently** belongs to
	 * `clientId`.
	 *
	 * @param clientId The client that is being queried.
	 * @param abilityId The ability that is being queried.
	 * @returns Whether or not the provided ability is _currently_ usable by the client.
	 */
	public CanUseAbility(clientId: number, abilityId: string): boolean {
		if (!this.ClientHasAbility(clientId, abilityId)) return false;
		return (
			!this.IsAbilityDisabled(clientId, abilityId) &&
			!this.IsAbilityOnCooldown(clientId, abilityId) &&
			!this.IsClientChargingAbility(clientId) &&
			this.entityService.GetEntityByClientId(clientId) !== undefined
		);
	}
}
