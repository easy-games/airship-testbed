import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";

export const Network = {
	ClientToServer: {
		BounceBall: new NetworkSignal<[nobId: number]>("BounceBall"),
		TestServer: new NetworkSignal<[value: boolean]>("TestServer"),
	},
	ServerToClient: {
		//DEMO SCENE
		KillData: new NetworkSignal<[rank: string, total: number]>("KillData"),
		TopScores: new NetworkSignal<[topKills: { id: string; rank: number; value: string }[]]>("TopScores"),
	},
};
