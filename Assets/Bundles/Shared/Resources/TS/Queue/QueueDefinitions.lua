-- Compiled with unity-ts v2.1.0-75
local Theme = require("Shared/TS/Util/Theme").Theme
local QueueType = require("Shared/TS/Queue/QueueType").QueueType
local GameMap = require("Server/TS/Services/Match/Map/Maps").GameMap
local Queues = {
	[QueueType.CLASSIC_SQUADS] = {
		name = "Classic (Squads)",
		teams = { {
			id = "1",
			name = "Blue",
			maxPlayers = 4,
			color = Theme.Blue,
		}, {
			id = "2",
			name = "Red",
			maxPlayers = 4,
			color = Theme.Red,
		}, {
			id = "3",
			name = "Green",
			maxPlayers = 4,
			color = Theme.Green,
		}, {
			id = "4",
			name = "Yellow",
			maxPlayers = 4,
			color = Theme.Yellow,
		} },
		maps = { GameMap.SANCTUM },
	},
}
return {
	Queues = Queues,
}
-- ----------------------------------
-- ----------------------------------
