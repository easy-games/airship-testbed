-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ObjectUtils = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local Network = require("Shared/TS/Network").Network
local CollectionManager = require("Shared/TS/Util/CollectionManager").CollectionManager
local WaitForNobId = require("Shared/TS/Util/NetworkUtil").WaitForNobId
local CollectionManagerController
do
	CollectionManagerController = setmetatable({}, {
		__tostring = function()
			return "CollectionManagerController"
		end,
	})
	CollectionManagerController.__index = CollectionManagerController
	function CollectionManagerController.new(...)
		local self = setmetatable({}, CollectionManagerController)
		return self:constructor(...) or self
	end
	function CollectionManagerController:constructor()
		self.clientCollectionTable = {}
	end
	function CollectionManagerController:OnStart()
		-- Sync up server replication table with client.
		Network.ServerToClient.CollectionManagerState.Client:OnServerEvent(function(state)
			self:constructClientCollection(state)
		end)
		-- Listen for tagged, replicated `GameObject` instatiation.
		Network.ServerToClient.NetGameObjectReplicating.Client:OnServerEvent(function(networkObjectId, tag)
			local replicatedGameObject = WaitForNobId(networkObjectId).gameObject
			self:addGameObjectToTagSet(replicatedGameObject, tag)
		end)
		-- Listen for local `GameObject` added to collection.
		ClientSignals.CollectionManagerTagAdded:Connect(function(_param)
			local go = _param.go
			local tag = _param.tag
			self:addGameObjectToTagSet(go, tag)
		end)
	end
	function CollectionManagerController:constructClientCollection(syncTable)
		local clientCollectionTable = {}
		-- * Unpack server replication sync table and convert nobs to client-owned `GameObject`s.
		local _exp = ObjectUtils.keys(syncTable)
		local _arg0 = function(collectionTag)
			local _syncTable = syncTable
			local _collectionTag = collectionTag
			local nobSet = _syncTable[_collectionTag]
			if not nobSet then
				return nil
			end
			-- Create tag set.
			local tagSet = {}
			local _arg0_1 = function(nob)
				local gameObject = WaitForNobId(nob).gameObject
				tagSet[gameObject] = true
				-- Listen for destruction on construction.
				self:listenForGameObjectDestruction(gameObject, collectionTag)
			end
			for _v in nobSet do
				_arg0_1(_v, _v, nobSet)
			end
			-- Merge set.
			local _collectionTag_1 = collectionTag
			clientCollectionTable[_collectionTag_1] = tagSet
		end
		for _k, _v in _exp do
			_arg0(_v, _k - 1, _exp)
		end
		self.clientCollectionTable = clientCollectionTable
		-- Let `CollectionManager` know that table was replicated and reconstructed.
		CollectionManager.replicationTableSynced = true
	end
	function CollectionManagerController:listenForGameObjectDestruction(gameObject, tag)
		-- Add `DestroyWatcher` component to _all_ tagged `GameObject`s.
		if gameObject:GetComponent("DestroyWatcher") == nil then
			local componentRef = gameObject:AddComponent("DestroyWatcher")
			componentRef:OnDestroyedEvent(function()
				self:removeGameObjectFromTagSet(gameObject, tag)
			end)
		end
	end
	function CollectionManagerController:addGameObjectToTagSet(gameObject, tag)
		local _clientCollectionTable = self.clientCollectionTable
		local _tag = tag
		local tagSet = _clientCollectionTable[_tag]
		if tagSet then
			local _gameObject = gameObject
			tagSet[_gameObject] = true
		else
			local _clientCollectionTable_1 = self.clientCollectionTable
			local _tag_1 = tag
			local _arg1 = {
				[gameObject] = true,
			}
			_clientCollectionTable_1[_tag_1] = _arg1
		end
		-- Listen for replicated GameObject despawning.
		self:listenForGameObjectDestruction(gameObject, tag)
		-- Fire signal when `GameObject` is added to collection.
		ClientSignals.GameObjectAddedToCollection:Fire({
			go = gameObject,
			tag = tag,
		})
	end
	function CollectionManagerController:removeGameObjectFromTagSet(gameObject, tag)
		local _clientCollectionTable = self.clientCollectionTable
		local _tag = tag
		local tagSet = _clientCollectionTable[_tag]
		if not tagSet then
			return nil
		end
		local _gameObject = gameObject
		if tagSet[_gameObject] ~= nil then
			local _gameObject_1 = gameObject
			tagSet[_gameObject_1] = nil
		end
	end
	function CollectionManagerController:getGameObjectsByTag(tag)
		local collectionGameObjects = {}
		local _clientCollectionTable = self.clientCollectionTable
		local _tag = tag
		local tagSet = _clientCollectionTable[_tag]
		if not tagSet then
			return collectionGameObjects
		end
		-- Convert set to array.
		local _arg0 = function(gameObject)
			local _gameObject = gameObject
			table.insert(collectionGameObjects, _gameObject)
			return #collectionGameObjects
		end
		for _v in tagSet do
			_arg0(_v, _v, tagSet)
		end
		return collectionGameObjects
	end
end
-- (Flamework) CollectionManagerController metadata
Reflect.defineMetadata(CollectionManagerController, "identifier", "Bundles/Client/Controllers/Global/CollectionManager/CollectionManagerController@CollectionManagerController")
Reflect.defineMetadata(CollectionManagerController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(CollectionManagerController, "$:flamework@Controller", Controller, { {
	loadOrder = 0,
} })
return {
	CollectionManagerController = CollectionManagerController,
}
-- ----------------------------------
-- ----------------------------------
