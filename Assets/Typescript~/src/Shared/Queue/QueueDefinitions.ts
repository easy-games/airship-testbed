import { Theme } from "Shared/Util/Theme";
import { QueueMeta } from "./QueueMeta";
import { QueueType } from "./QueueType";
import { GameMap } from "Server/Services/Match/Map/Maps";

export const Queues: Record<QueueType, QueueMeta> = {
	[QueueType.CLASSIC_SQUADS]: {
		name: "Classic (Squads)",
		teams: [
			{ id: "1", name: "Blue", maxPlayers: 4, color: Theme.Blue },
			{ id: "2", name: "Red", maxPlayers: 4, color: Theme.Red },
			{ id: "3", name: "Green", maxPlayers: 4, color: Theme.Green },
			{ id: "4", name: "Yellow", maxPlayers: 4, color: Theme.Yellow },
		],
		maps: [GameMap.SANCTUM],
	},
};
