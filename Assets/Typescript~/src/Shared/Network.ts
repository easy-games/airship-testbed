import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { RemoteEvent } from "@Easy/Core/Shared/Network/RemoteEvent";
import { RemoteFunction } from "@Easy/Core/Shared/Network/RemoteFunction";
import { KitType } from "./Kit/KitType";
import { MatchInfoDto } from "./Match/MatchInfoDto";
import { MatchState } from "./Match/MatchState";
import { PlayerMatchStatsDto } from "./Match/PlayerMatchStats";
import { MatchHUDDto } from "./MatchHUD/MatchHUDDto";
import { StatusEffectDto } from "./StatusEffect/StatusEffectMeta";
import { StatusEffectType } from "./StatusEffect/StatusEffectType";
import { TeamUpgradeStateDto } from "./TeamUpgrade/TeamUpgradeMeta";
import { TeamUpgradeType } from "./TeamUpgrade/TeamUpgradeType";

export const Network = {
	ClientToServer: {
		TeamUpgrade: {
			/** Fired when client attempts to puchase a team upgrade. */
			UpgradeRequest: new RemoteFunction<[upgradeType: TeamUpgradeType, tier: number], boolean>(),
		},
		ItemShop: {
			/** Fired when client attempts to purchase shop item. */
			PurchaseRequest: new RemoteFunction<[itemType: ItemType], boolean>(),
		},
		EnchantTable: {
			/** Fired when enchant table prefab is replicated to client. */
			EnchantTableStateRequest: new RemoteFunction<[nob: number], { teamId: string; unlocked: boolean }>(),
			/** Fired when a user attempts to repair enchant table. */
			EnchantTableRepairRequest: new RemoteEvent<[tableNob: number]>(),
			/** Fired when a user attempts to purchase an enchant. */
			EnchantPurchaseRequest: new RemoteEvent<[tableNob: number]>(),
		},
	},
	ServerToClient: {
		ItemShop: {
			RemoveTierPurchases: new RemoteEvent<[itemTypes: ItemType[]]>(),
			AddNPCs: new RemoteEvent<[entityIds: number[]]>(),
			ItemPurchased: new RemoteEvent<[entityId: number, itemType: ItemType]>(),
		},
		TeamUpgradeShop: {
			AddNPCs: new RemoteEvent<[entityIds: number[]]>(),
		},
		EnchantTable: {
			EnchantTableUnlocked: new RemoteEvent<[tableNob: number]>(),
		},
		/** Fired when match starts. */
		MatchStarted: new RemoteEvent<[]>(),
		/** Fired when match state changes. */
		MatchStateChange: new RemoteEvent<[newState: MatchState, oldState: MatchState]>(),
		/** Fired when match ends. */
		MatchEnded: new RemoteEvent<[winningTeamId?: string]>(),
		MatchInfo: new RemoteEvent<MatchInfoDto>(),
		TeamUpgrade: {
			/** Fired when a user joins late. Sends full team upgrade snapshot for user team. */
			UpgradeSnapshot: new RemoteEvent<[upgradeStateDtos: TeamUpgradeStateDto[]]>(),
			/** Fired when a team upgrade is successfully processed and applied. */
			UpgradeProcessed: new RemoteEvent<
				[purchaserClientId: number, upgradeType: TeamUpgradeType, tier: number]
			>(),
		},
		/** Fired when a player is eliminated. */
		PlayerEliminated: new RemoteEvent<[clientId: number]>(),
		/** Fired when a map is loaded. */
		MapLoaded: new RemoteEvent<[gameMapId: string]>(),
		PlayerMatchStats: new RemoteEvent<[playerMatchStats: PlayerMatchStatsDto[]]>(),
		UpdateHud: new RemoteEvent<[hudDto: MatchHUDDto]>(),

		/** Fired when a player's kit is updated. */
		KitUpdated: new RemoteEvent<[clientId: number, kitType: KitType]>(),

		/** Fired when a late joiner connects, sends over status effect snapshot. */
		StatusEffectSnapshot: new RemoteEvent<[snapshot: StatusEffectDto[]]>(),
		/** Fired when a status effect is added to a player. */
		StatusEffectAdded: new RemoteEvent<[clientId: number, statusEffectType: StatusEffectType, tier: number]>(),
		/** Fired when a status effect is removed from a player. */
		StatusEffectRemoved: new RemoteEvent<[clientId: number, statusEffectType: StatusEffectType]>(),
	},
};

let countClientToServer = 0;
let countServerToClient = 0;
for (const _ of pairs(Network.ClientToServer)) {
	countClientToServer++;
}
for (const _ of pairs(Network.ServerToClient)) {
	countServerToClient++;
}
// print(`NETWORK_COUNT: ClientToServer: ${countClientToServer} | ServerToClient: ${countServerToClient}`);
