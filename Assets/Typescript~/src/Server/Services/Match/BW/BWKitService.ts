import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { Kit } from "Shared/Kit/KitMeta";
import { KitType } from "Shared/Kit/KitType";
import { KitUtil } from "Shared/Kit/KitUtil";
import { Network } from "Shared/Network";
import { GameAbilities } from "Shared/Strollers/Match/BW/GameAbilities";
import { MatchService } from "../MatchService";

@Service({})
export class BWKitService implements OnStart {
	constructor(
		private readonly matchService: MatchService,
		private readonly entityService: EntityService,
		private readonly gameAbilities: GameAbilities,
	) {}

	/** Mapping of client id to _currently_ selected kit. */
	private kitMap = new Map<number, KitType>();

	OnStart(): void {
		CoreServerSignals.PlayerJoin.Connect((event) => {
			this.kitMap.set(event.player.clientId, KitType.NONE);
			Network.ServerToClient.KitUpdated.Server.FireAllClients(event.player.clientId, KitType.NONE);
		});

		CoreServerSignals.EntitySpawn.Connect((event) => {
			if (!this.matchService.IsRunning()) return;
			if (!(event.entity instanceof CharacterEntity)) return;
			if (event.entity.ClientId === undefined) return;
			const usingKit = this.kitMap.get(event.entity.ClientId);
			if (usingKit === undefined) return;
			const kitMeta = KitUtil.GetKitMeta(usingKit);
			this.ApplyKitAbilitiesToEntity(event.entity, kitMeta);
		});

		ServerSignals.MatchStart.Connect(() => {
			for (const [clientId, kitType] of this.kitMap) {
				const characterEntity = this.entityService.GetEntityByClientId(clientId);
				if (!characterEntity) return;
				if (!(characterEntity instanceof CharacterEntity)) return;
				const kitMeta = KitUtil.GetKitMeta(kitType);
				this.ApplyKitAbilitiesToEntity(characterEntity, kitMeta);
			}
		});
	}

	/**
	 * Applies the provided kit's abilities to character entity.
	 * @param characterEntity The character entity to give kit abilities to.
	 * @param kitMeta The kit's meta.
	 */
	private ApplyKitAbilitiesToEntity(characterEntity: CharacterEntity, kitMeta: Kit): void {
		for (const activeAbility of kitMeta.activeAbilities) {
			this.gameAbilities.AddAbilityToCharacter(activeAbility, characterEntity);
		}
		for (const passiveAbility of kitMeta.passiveAbilities) {
			this.gameAbilities.AddAbilityToCharacter(passiveAbility, characterEntity);
		}
	}
}
