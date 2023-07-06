-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ObjectUtil = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local GameObjectBridge = require("Shared/TS/GameObjectBridge").GameObjectBridge
local NetworkBridge = require("Shared/TS/NetworkBridge").NetworkBridge
local Task = require("Shared/TS/Util/Task").Task
local MathUtil = require("Shared/TS/Util/MathUtil").MathUtil
-- * Generator deny region size.
local DENY_REGION_SIZE = Vector3.new(2, 3, 2)
local ShopkeeperService
do
	ShopkeeperService = setmetatable({}, {
		__tostring = function()
			return "ShopkeeperService"
		end,
	})
	ShopkeeperService.__index = ShopkeeperService
	function ShopkeeperService.new(...)
		local self = setmetatable({}, ShopkeeperService)
		return self:constructor(...) or self
	end
	function ShopkeeperService:constructor(mapService, denyRegionService)
		self.mapService = mapService
		self.denyRegionService = denyRegionService
		self.shopKeeperPrefab = AssetBridge:LoadAsset("Shared/Resources/Entity/HumanEntity/HumanEntity.prefab")
	end
	function ShopkeeperService:OnStart()
		Task:Spawn(function()
			-- Wait map and match started before creating generators.
			self.loadedMap = self.mapService:WaitForMapLoaded()
			ServerSignals.MatchStart:connect(function()
				return self:CreateShopKeepers()
			end)
		end)
	end
	function ShopkeeperService:CreateShopKeepers()
		-- Shop shopkeepers.
		local shops = self.loadedMap:GetAllShopkeepers()
		local _exp = ObjectUtil.values(shops)
		local _arg0 = function(mapPosition)
			local keeper = GameObjectBridge:InstantiateAt(self.shopKeeperPrefab, mapPosition.Position, mapPosition.Rotation)
			NetworkBridge:Spawn(keeper, "item_shop_shopkeeper")
			-- Create deny region around shopkeeper.
			self.denyRegionService:CreateDenyRegion(MathUtil:FloorVec(mapPosition.Position), DENY_REGION_SIZE)
		end
		for _k, _v in _exp do
			_arg0(_v, _k - 1, _exp)
		end
		-- Team upgrade shopkeepers.
		local upgrades = self.loadedMap:GetAllTeamUpgrades()
		local _exp_1 = ObjectUtil.values(upgrades)
		local _arg0_1 = function(mapPosition)
			local keeper = GameObjectBridge:InstantiateAt(self.shopKeeperPrefab, mapPosition.Position, mapPosition.Rotation)
			NetworkBridge:Spawn(keeper, "team_upgrades_shopkeeper")
			-- Create deny region around shopkeeper.
			self.denyRegionService:CreateDenyRegion(MathUtil:FloorVec(mapPosition.Position), DENY_REGION_SIZE)
		end
		for _k, _v in _exp_1 do
			_arg0_1(_v, _k - 1, _exp_1)
		end
	end
end
-- (Flamework) ShopkeeperService metadata
Reflect.defineMetadata(ShopkeeperService, "identifier", "Bundles/Server/Services/Match/ShopkeeperService@ShopkeeperService")
Reflect.defineMetadata(ShopkeeperService, "flamework:parameters", { "Bundles/Server/Services/Match/Map/MapService@MapService", "Bundles/Server/Services/Global/Block/DenyRegionService@DenyRegionService" })
Reflect.defineMetadata(ShopkeeperService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(ShopkeeperService, "$:flamework@Service", Service, { {} })
return {
	ShopkeeperService = ShopkeeperService,
}
-- ----------------------------------
-- ----------------------------------
