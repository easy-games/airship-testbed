import { Controller, Dependency, Flamework, Modding, OnStart, Service } from "@easy-games/flamework-core";
import { AbilityLogic } from "Shared/Abilities/AbilityLogic";
import { AbilitySlot } from "Shared/Abilities/AbilitySlot";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";

export interface AbilityConfig {
	/**
	 * The slot for this ability
	 *
	 * This will bind appropriate bindings on a per-platform basis depending on the slot
	 *
	 * Order:
	 * - Primary (Q, E, R, T)
	 * - Secondary (Q, E, R, T)
	 * - Utility (Z, X, C, V)
	 *
	 * @see {@link AbilitySlot} for more details
	 */
	readonly Slot: AbilitySlot;
	/**
	 * The priority of this ability, will change whether or not this ability
	 */
	readonly Priority?: number;
	/**
	 * The icon for this ability
	 */
	readonly Image?: string;
	/**
	 * The name of this ability
	 */
	readonly Name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AbstractConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (
	...args: infer P
) => infer _
	? P
	: never;

type AbilityFactory<T extends AbilityLogic = AbilityLogic> = new (
	...args: AbstractConstructorParameters<typeof AbilityLogic>
) => T;

export interface Ability {
	/**
	 * @internal
	 */
	factory: AbilityFactory;
	config: AbilityConfig;
}

@Service()
@Controller()
export class AbilityRegistry implements OnStart {
	private abilityHandlers = new Map<string, Ability>();

	public RegisterAbilityById<T extends AbilityLogic>(
		id: string,
		abilityLogicClass: AbilityFactory<T>,
		config: AbilityConfig,
	) {
		print("Registering ability", id);
		this.abilityHandlers.set(id, {
			factory: abilityLogicClass,
			config,
		});
	}

	public GetAbilityById(id: string): Ability | undefined {
		return this.abilityHandlers.get(id);
	}

	public OnStart(): void {
		print("Loaded ability registry for", RunCore.IsServer() ? "SERVER" : "CLIENT");
	}
}
