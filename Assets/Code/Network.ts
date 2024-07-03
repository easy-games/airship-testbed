import { NetworkSignal } from "@Easy/Core/Shared/Network/RemoteEvent";

export const Network = {
	ClientToServer: {
		BounceBall: new NetworkSignal<[nobId: number]>("BounceBall"),
	},
	ServerToClient: {
		//DEMO SCENE
		KillData: new NetworkSignal<[rank: string, total: number]>("KillData"),
		TopScores: new NetworkSignal<[topKills: { id: string; rank: number; value: string }[]]>("TopScores"),
	},
};
