import { NetworkChannel } from "@Easy/Core/Shared/Network/NetworkAPI";
import { RemoteEvent } from "@Easy/Core/Shared/Network/RemoteEvent";

export const Network = {
	ClientToServer: {
		BounceBall: new RemoteEvent<[nobId: number]>(NetworkChannel.Reliable, "BounceBall"),
	},
	ServerToClient: {
		//DEMO SCENE
		KillData: new RemoteEvent<[rank: string, total: number]>(NetworkChannel.Reliable, "KillData"),
		TopScores: new RemoteEvent<[topKills: { id: string; rank: number; value: string }[]]>(
			NetworkChannel.Reliable,
			"TopScores",
		),
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
