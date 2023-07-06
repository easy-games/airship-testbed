-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local CharacterEntity = require("Shared/TS/Entity/Character/CharacterEntity").CharacterEntity
local ItemStack = require("Shared/TS/Inventory/ItemStack").ItemStack
local ItemType = require("Shared/TS/Item/ItemType").ItemType
local LobbyService
do
	LobbyService = setmetatable({}, {
		__tostring = function()
			return "LobbyService"
		end,
	})
	LobbyService.__index = LobbyService
	function LobbyService.new(...)
		local self = setmetatable({}, LobbyService)
		return self:constructor(...) or self
	end
	function LobbyService:constructor()
		print("LobbyService.constructor()")
	end
	function LobbyService:OnStart()
		print("LobbyService.OnStart()")
		local luauRoot = GameObject:Find("LuauRoot")
		local serverConsole = luauRoot:GetComponent("ServerConsole")
		serverConsole.RemoteLogging = true
		ServerSignals.EntitySpawn:Connect(function(event)
			if TS.instanceof(event.Entity, CharacterEntity) then
				local inv = event.Entity:GetInventory()
				inv:SetItem(0, ItemStack.new(ItemType.STONE_SWORD, 1))
				inv:SetItem(1, ItemStack.new(ItemType.COBBLESTONE, 100))
				inv:SetItem(2, ItemStack.new(ItemType.STONE_PICKAXE, 1))
				inv:SetItem(3, ItemStack.new(ItemType.WOOD_BOW, 1))
				inv:SetItem(4, ItemStack.new(ItemType.TELEPEARL, 100))
				inv:SetItem(6, ItemStack.new(ItemType.FIREBALL, 100))
				inv:SetItem(7, ItemStack.new(ItemType.BED, 15))
				inv:SetItem(8, ItemStack.new(ItemType.WOOD_ARROW, 100))
				inv:SetItem(10, ItemStack.new(ItemType.DIAMOND_ARMOR, 1))
				inv:SetItem(20, ItemStack.new(ItemType.WHITE_WOOL, 100))
				inv:SetItem(21, ItemStack.new(ItemType.STONE_BRICK, 100))
				inv:SetItem(22, ItemStack.new(ItemType.OAK_WOOD_PLANK, 100))
			end
		end)
	end
end
-- (Flamework) LobbyService metadata
Reflect.defineMetadata(LobbyService, "identifier", "Bundles/Server/Services/Lobby/LobbyService@LobbyService")
Reflect.defineMetadata(LobbyService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(LobbyService, "$:flamework@Service", Service, { {} })
return {
	LobbyService = LobbyService,
}
-- ----------------------------------
-- ----------------------------------
