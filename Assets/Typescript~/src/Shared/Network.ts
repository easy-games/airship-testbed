import { RemoteEvent } from "@Easy/Core/Shared/Network/RemoteEvent";

export const Network = {
	ClientToServer: {},
	ServerToClient: {
		//DEMO SCENE
		KillData: new RemoteEvent<[rank: string, total: number]>(),
		TopScores: new RemoteEvent<[topKills: { id: string; rank: number; value: string }[]]>(),
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
