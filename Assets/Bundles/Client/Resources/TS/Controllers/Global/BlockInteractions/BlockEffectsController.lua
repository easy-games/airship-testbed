-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local _ItemDefinitions = require("Shared/TS/Item/ItemDefinitions")
local GetItemMeta = _ItemDefinitions.GetItemMeta
local GetItemTypeFromBlockId = _ItemDefinitions.GetItemTypeFromBlockId
local RandomUtil = require("Shared/TS/Util/RandomUtil").RandomUtil
local SoundUtil = require("Shared/TS/Util/SoundUtil").SoundUtil
local BlockEffectsController
do
	BlockEffectsController = setmetatable({}, {
		__tostring = function()
			return "BlockEffectsController"
		end,
	})
	BlockEffectsController.__index = BlockEffectsController
	function BlockEffectsController.new(...)
		local self = setmetatable({}, BlockEffectsController)
		return self:constructor(...) or self
	end
	function BlockEffectsController:constructor()
		self.hitSoundDefault = { "Block_Stone_Hit_01", "Block_Stone_Hit_02" }
		self.breakSoundDefault = { "Block_Stone_Break" }
		self.placeSoundDefault = { "Block_Stone_Place_01", "Block_Stone_Place_02", "Block_Stone_Place_03" }
	end
	function BlockEffectsController:OnStart()
		ClientSignals.BlockPlace:Connect(function(event)
			if not event.placer then
				return nil
			end
			local _fn = SoundUtil
			local _fn_1 = RandomUtil
			local _result = event.block.itemMeta
			if _result ~= nil then
				_result = _result.block
				if _result ~= nil then
					_result = _result.placeSound
				end
			end
			local _condition = _result
			if _condition == nil then
				_condition = self.placeSoundDefault
			end
			_fn:PlayAtPosition(_fn_1:FromArray(_condition), event.pos)
		end)
		ClientSignals.AfterBlockHit:Connect(function(event)
			local _result = event.entity
			if _result ~= nil then
				_result = _result:IsLocalCharacter()
			end
			if _result then
				return nil
			end
			local itemType = GetItemTypeFromBlockId(event.blockId)
			if not itemType then
				return nil
			end
			local itemMeta = GetItemMeta(itemType)
			local _fn = SoundUtil
			local _fn_1 = RandomUtil
			local _result_1 = itemMeta
			if _result_1 ~= nil then
				_result_1 = _result_1.block
				if _result_1 ~= nil then
					_result_1 = _result_1.hitSound
				end
			end
			local _condition = _result_1
			if _condition == nil then
				_condition = self.hitSoundDefault
			end
			_fn:PlayAtPosition(_fn_1:FromArray(_condition), event.pos)
		end)
		ClientSignals.BeforeBlockHit:ConnectWithPriority(500, function(event)
			if not event.block.itemMeta then
				return nil
			end
			local _fn = SoundUtil
			local _fn_1 = RandomUtil
			local _result = event.block.itemMeta.block
			if _result ~= nil then
				_result = _result.hitSound
			end
			local _condition = _result
			if _condition == nil then
				_condition = self.hitSoundDefault
			end
			_fn:PlayAtPosition(_fn_1:FromArray(_condition), event.blockPos)
		end)
	end
end
-- (Flamework) BlockEffectsController metadata
Reflect.defineMetadata(BlockEffectsController, "identifier", "Bundles/Client/Controllers/Global/BlockInteractions/BlockEffectsController@BlockEffectsController")
Reflect.defineMetadata(BlockEffectsController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(BlockEffectsController, "$:flamework@Controller", Controller, { {} })
return {
	BlockEffectsController = BlockEffectsController,
}
-- ----------------------------------
-- ----------------------------------
