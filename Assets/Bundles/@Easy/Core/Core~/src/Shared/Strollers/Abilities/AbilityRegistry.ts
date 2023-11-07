import { Controller, OnStart, Service } from "@easy-games/flamework-core";
import { AbilityConfig, AbilityLogicConstructor } from "Shared/Abilities/Ability";
import { AbilityLogic } from "Shared/Abilities/AbilityLogic";
import { AbilitySlot } from "Shared/Abilities/AbilitySlot";
import { Duration } from "Shared/Util/Duration";

export interface Ability {
	/**
	 * The logic class for the ability
	 */
	readonly logic: AbilityLogicConstructor;
	/**
	 * Configuration around the ability
	 */
	readonly config: AbilityConfig;
}

@Service()
@Controller()
export class AbilityRegistry implements OnStart {
	private abilityHandlers = new Map<string, Ability>();

	public RegisterAbilityById<T extends AbilityLogic>(
		id: string,
		abilityLogicClass: AbilityLogicConstructor<T>,
		config: AbilityConfig,
	) {
		print("Registering ability", id);
		this.abilityHandlers.set(id, {
			logic: abilityLogicClass,
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
