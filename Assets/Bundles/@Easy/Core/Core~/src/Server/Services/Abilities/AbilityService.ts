import { OnStart, Service } from "@easy-games/flamework-core";
import { AbilityUtil } from "Shared/Abilities/AbilityUtil";
import { AbilityCooldown } from "Shared/Abilities/CharacterAbilities";
import { CoreNetwork } from "Shared/CoreNetwork";
import { AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";
import { Duration } from "Shared/Util/Duration";
import { TimeUtil } from "Shared/Util/TimeUtil";

@Service({})
export class AbilityService implements OnStart {
	/** Mapping of **client id** to owned ability ids. */
	private abilityMap = new Map<number, string[]>();
	/** Mapping of **client id** to ability cooldown states. */
	private cooldownMap = new Map<number, Map<string, AbilityCooldown>>();
	/** Mapping of **client id** to ability enabled states. */
	private enabledMap = new Map<number, Map<string, boolean>>();

	constructor(private readonly abilityRegistry: AbilityRegistry) {}

	OnStart(): void {
		// CoreServerSignals.AbilityAdded.Connect(({ clientId, ability }) => {
		// 	this.AddAbilityToClient(clientId, ability);
		// });
		CoreNetwork.ClientToServer.UseAbility.Server.OnClientEvent((clientId, request) => {
			print(clientId);
			print(request);
		});
	}

	/**
	 * Adds the provided ability to client `clientId`. Returns whether or not ability was successfully added to client.
	 *
	 * @param clientId The client that the provided ability is being added to.
	 * @param abilityId The ability to add to client.
	 * @returns Whether or not ability was successfully added to client.
	 */
	public AddAbilityToClient(clientId: number, abilityId: string): boolean {
		print(`AddAbilityToClient (0)`);
		if (this.ClientHasAbility(clientId, abilityId)) return false;
		print(`AddAbilityToClient (1)`);
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
			print(`AddAbilityToClient (2)`);
			CoreNetwork.ServerToClient.AbilityAddedNew.Server.FireAllClients(clientId, abilityDto);
		}
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
		if (!abilityEntries) return false;
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
	public SetAbilityOnCooldown(clientId: number, abilityId: string, duration: number): boolean {
		if (!this.ClientHasAbility(clientId, abilityId)) return false;
		const now = TimeUtil.GetServerTime();
		const cooldownEnd = now + duration;
		const abilityCooldown: AbilityCooldown = {
			startTimestamp: now,
			endTimestamp: cooldownEnd,
			length: Duration.fromSeconds(duration),
		};
		const clientCooldowns = this.cooldownMap.get(clientId);
		if (!clientCooldowns) {
			const cooldownEntry = new Map<string, AbilityCooldown>([[abilityId, abilityCooldown]]);
			this.cooldownMap.set(clientId, cooldownEntry);
		} else {
			clientCooldowns.set(abilityId, abilityCooldown);
		}
		CoreNetwork.ServerToClient.AbilityCooldownStateChangeNew.Server.FireClient(clientId, {
			abilityId: abilityId,
			timeStart: abilityCooldown.startTimestamp,
			timeEnd: abilityCooldown.endTimestamp,
			length: duration,
		});
		return true;
	}

	/**
	 * Sets the client's ability enabled state. Returns whether or not the state was successfully updated.
	 * Returns whether or not the ability's state was updated. If this function returns `false` the client
	 * either does **not** have the provided ability or the ability was already in the provided state.
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
			CoreNetwork.ServerToClient.AbilityStateChangeNew.Server.FireAllClients(clientId, abilityId, enabled);
			return true;
		} else {
			const currentEnabledState = clientEnabledStates.get(abilityId);
			if (currentEnabledState === enabled) return false;
			clientEnabledStates.set(abilityId, enabled);
			CoreNetwork.ServerToClient.AbilityStateChangeNew.Server.FireAllClients(clientId, abilityId, enabled);
			return true;
		}
	}

	/**
	 * Returns whether or not the provided ability is disabled for client. If the client does
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
		return abilityState === undefined ? true : abilityState;
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
	 * Returns whether or not the provided ability is _currently_ usable by the client. An ability
	 * is usable if it is **not** disabled and **not** on cooldown.
	 *
	 * @param clientId The client that is being queried.
	 * @param abilityId The ability that is being queried.
	 * @returns Whether or not the provided ability is _currently_ usable by the client.
	 */
	public CanUseAbility(clientId: number, abilityId: string): boolean {
		if (!this.ClientHasAbility(clientId, abilityId)) return false;
		return !this.IsAbilityDisabled(clientId, abilityId) && !this.IsAbilityOnCooldown(clientId, abilityId);
	}
}
