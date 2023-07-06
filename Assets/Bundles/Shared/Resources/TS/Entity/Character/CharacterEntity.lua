-- Compiled with unity-ts v2.1.0-75
local Entity = require("Shared/TS/Entity/Entity").Entity
local EntitySerializer = require("Shared/TS/Entity/EntitySerializer").EntitySerializer
local CharacterEntity
do
	local super = Entity
	CharacterEntity = setmetatable({}, {
		__tostring = function()
			return "CharacterEntity"
		end,
		__index = super,
	})
	CharacterEntity.__index = CharacterEntity
	function CharacterEntity.new(...)
		local self = setmetatable({}, CharacterEntity)
		return self:constructor(...) or self
	end
	function CharacterEntity:constructor(id, networkObject, clientId, inventory)
		super.constructor(self, id, networkObject, clientId)
		self.inventory = inventory
	end
	function CharacterEntity:GetInventory()
		return self.inventory
	end
	function CharacterEntity:Encode()
		local _object = {}
		for _k, _v in super.Encode(self) do
			_object[_k] = _v
		end
		_object.serializer = EntitySerializer.CHARACTER
		_object.invId = self.inventory.Id
		return _object
	end
end
return {
	CharacterEntity = CharacterEntity,
}
-- ----------------------------------
-- ----------------------------------
