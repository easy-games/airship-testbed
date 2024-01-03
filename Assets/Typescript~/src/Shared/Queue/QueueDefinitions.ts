import { Theme } from "@Easy/Core/Shared/Util/Theme";
import { QueueMeta } from "./QueueMeta";
import { QueueType } from "./QueueType";

export const Queues: Record<QueueType, QueueMeta> = {
	[QueueType.CLASSIC_SQUADS]: {
		name: "Classic (Squads)",
		teams: [
			{ id: "1", name: "Blue", maxPlayers: 4, color: Theme.teamColor.Blue },
			{ id: "2", name: "Red", maxPlayers: 4, color: Theme.teamColor.Red },
			{ id: "3", name: "Green", maxPlayers: 4, color: Theme.teamColor.Green },
			{ id: "4", name: "Yellow", maxPlayers: 4, color: Theme.teamColor.Yellow },
		],
		maps: ["Aztec"],
	},
};
