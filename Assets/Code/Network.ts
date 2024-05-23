import { RemoteEvent } from "@Easy/Core/Shared/Network/RemoteEvent";

export const Network = {
	ClientToServer: {
		BounceBall: new RemoteEvent<[nobId: number]>("BounceBall"),
	},
	ServerToClient: {
		//DEMO SCENE
		KillData: new RemoteEvent<[rank: string, total: number]>("KillData"),
		TopScores: new RemoteEvent<[topKills: { id: string; rank: number; value: string }[]]>("TopScores"),
	},
};
