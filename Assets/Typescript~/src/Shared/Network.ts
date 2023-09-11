import { ItemType } from "Imports/Core/Shared/Item/ItemType";
import { RemoteEvent } from "Imports/Core/Shared/Network/RemoteEvent";
import { RemoteFunction } from "Imports/Core/Shared/Network/RemoteFunction";
import { MatchState } from "./Match/MatchState";
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
	},
	ServerToClient: {
		ItemShop: {
			RemoveTierPurchases: new RemoteEvent<[itemTypes: ItemType[]]>(),
			AddNPCs: new RemoteEvent<[entityIds: number[]]>(),
		},
		TeamUpgradeShop: {
			AddNPCs: new RemoteEvent<[entityIds: number[]]>(),
		},
		/** Fired when match starts. */
		MatchStarted: new RemoteEvent<[]>(),
		/** Fired when match state changes. */
		MatchStateChange: new RemoteEvent<[newState: MatchState, oldState: MatchState]>(),
		/** Fired when match ends. */
		MatchEnded: new RemoteEvent<[winningTeamId?: string]>(),
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
