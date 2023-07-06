-- Compiled with unity-ts v2.1.0-75
local Network = require("Shared/TS/Network").Network
local Bin = require("Shared/TS/Util/Bin").Bin
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local Signal = require("Shared/TS/Util/Signal").Signal
local CharacterAccessories
do
	CharacterAccessories = setmetatable({}, {
		__tostring = function()
			return "CharacterAccessories"
		end,
	})
	CharacterAccessories.__index = CharacterAccessories
	function CharacterAccessories.new(...)
		local self = setmetatable({}, CharacterAccessories)
		return self:constructor(...) or self
	end
	function CharacterAccessories:constructor(entity)
		self.entity = entity
		self.OnAccessoryRemoved = Signal.new()
		self.OnAccessoryAdded = Signal.new()
		self.accessories = {}
		self.bin = Bin.new()
		self.finishedFirstPass = false
		if RunUtil:IsClient() then
			self.bin:Add(Network.ServerToClient.SetAccessory.Client:OnServerEvent(function(entityId, slot, path)
				if entityId == self.entity.id then
					self:SetAccessory(slot, path)
				end
			end))
			self.bin:Add(Network.ServerToClient.RemoveAccessory.Client:OnServerEvent(function(entityId, slot)
				if entityId == self.entity.id then
					self:RemoveAccessory(slot)
				end
			end))
		end
		self.finishedFirstPass = true
	end
	function CharacterAccessories:SetAccessory(slot, accessoryPath)
	end
	function CharacterAccessories:RemoveAccessory(slot)
	end
	function CharacterAccessories:Unload()
		self.bin:Clean()
	end
	function CharacterAccessories:GetAccessories()
		return {}
		-- return ObjectUtils.values(this.accessories);
	end
end
return {
	CharacterAccessories = CharacterAccessories,
}
-- ----------------------------------
-- ----------------------------------
