import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { AbilityService } from "@Easy/Core/Server/Services/Abilities/AbilityService";
import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { Kit } from "Shared/Kit/KitMeta";
import { KitType } from "Shared/Kit/KitType";
import { KitUtil } from "Shared/Kit/KitUtil";
import { Network } from "Shared/Network";
import { MatchService } from "../MatchService";

@Service({})
export class BWKitService implements OnStart {
	constructor(
		private readonly matchService: MatchService,
		private readonly entityService: EntityService,
		private readonly abilityService: AbilityService,
	) {}

	/** Mapping of client id to _currently_ selected kit. */
	private kitMap = new Map<number, KitType>();

	OnStart(): void {
		CoreServerSignals.PlayerJoin.Connect((event) => {
			this.kitMap.set(event.player.clientId, KitType.NONE);
			Network.ServerToClient.KitUpdated.server.FireAllClients(event.player.clientId, KitType.NONE);
		});

		CoreServerSignals.EntitySpawn.Connect((event) => {
			if (!this.matchService.IsRunning()) return;
			if (!(event.entity instanceof CharacterEntity)) return;
			if (event.entity.clientId === undefined) return;
			const usingKit = this.kitMap.get(event.entity.clientId);
			if (usingKit === undefined) return;
			const kitMeta = KitUtil.GetKitMeta(usingKit);
			this.ApplyKitAbilitiesToClient(event.entity.clientId, kitMeta);
		});

		ServerSignals.MatchStart.Connect(() => {
			for (const [clientId, kitType] of this.kitMap) {
				const characterEntity = this.entityService.GetEntityByClientId(clientId);
				if (!characterEntity) return;
				if (!(characterEntity instanceof CharacterEntity)) return;
				const kitMeta = KitUtil.GetKitMeta(kitType);
				this.ApplyKitAbilitiesToClient(clientId, kitMeta);
			}
		});
	}

	/**
	 * Applies the provided kit's abilities to client.
	 *
	 * @param characterEntity The character entity to give kit abilities to.
	 * @param kitMeta The kit's meta.
	 */
	private ApplyKitAbilitiesToClient(clientId: number, kitMeta: Kit): void {
		for (const activeAbility of kitMeta.activeAbilities) {
			this.abilityService.AddAbilityToClient(clientId, activeAbility);
		}
		for (const passiveAbility of kitMeta.passiveAbilities) {
			this.abilityService.AddAbilityToClient(clientId, passiveAbility);
		}
	}
}
