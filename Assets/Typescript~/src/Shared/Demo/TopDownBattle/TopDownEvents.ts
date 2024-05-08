import { RemoteEvent } from "@Easy/Core/Shared/Network/RemoteEvent";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { GameMode } from "./TopDownBattleGame";

export const TopDownBattleEvents = {
	//DEMO SCENE
	KillData: new RemoteEvent<[rank: string, total: number]>("KillData"),
	TopScores: new RemoteEvent<[topKills: { id: string; rank: number; value: string }[]]>("TopScores"),

	//Trigger new game modes over the network
	gameModeEvent: new RemoteEvent<[gameMode: GameMode]>("TopDownBattleGameMode"),
	//Notify local scripts of game mode changes
	gameModeSignal: new Signal<[gameMode: GameMode]>(),
};
