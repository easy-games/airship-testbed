-- Compiled with unity-ts v2.1.0-75
local CharacterSpawnClientEvent
do
	CharacterSpawnClientEvent = setmetatable({}, {
		__tostring = function()
			return "CharacterSpawnClientEvent"
		end,
	})
	CharacterSpawnClientEvent.__index = CharacterSpawnClientEvent
	function CharacterSpawnClientEvent.new(...)
		local self = setmetatable({}, CharacterSpawnClientEvent)
		return self:constructor(...) or self
	end
	function CharacterSpawnClientEvent:constructor(CharacterGO)
		self.CharacterGO = CharacterGO
	end
end
return {
	CharacterSpawnClientEvent = CharacterSpawnClientEvent,
}
-- ----------------------------------
-- ----------------------------------
