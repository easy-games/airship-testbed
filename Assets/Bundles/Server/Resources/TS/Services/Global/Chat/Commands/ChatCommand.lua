-- Compiled with unity-ts v2.1.0-75
local ChatCommand
do
	ChatCommand = {}
	function ChatCommand:constructor(commandLabel, aliases)
		if aliases == nil then
			aliases = {}
		end
		self.commandLabel = commandLabel
		self.aliases = aliases
	end
end
return {
	ChatCommand = ChatCommand,
}
-- ----------------------------------
-- ----------------------------------
