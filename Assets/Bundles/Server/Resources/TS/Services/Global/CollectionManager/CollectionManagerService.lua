-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local Network = require("Shared/TS/Network").Network
local CollectionManagerService
do
	CollectionManagerService = setmetatable({}, {
		__tostring = function()
			return "CollectionManagerService"
		end,
	})
	CollectionManagerService.__index = CollectionManagerService
	function CollectionManagerService.new(...)
		local self = setmetatable({}, CollectionManagerService)
		return self:constructor(...) or self
	end
	function CollectionManagerService:constructor()
		self.serverCollectionTable = {}
		self.toReplicateCollectionTable = {}
	end
	function CollectionManagerService:OnStart()
		-- On player join, send snapshot of replication table.
		ServerSignals.PlayerJoin:connect(function(event)
			Network.ServerToClient.CollectionManagerState.Server:FireClient(event.player.clientId, self.toReplicateCollectionTable)
		end)
		-- Listen for `GameObject` replication and manage sync table.
		ServerSignals.NetGameObjectReplicating:Connect(function(_param)
			local nob = _param.nob
			local tag = _param.tag
			self:addNobToReplicationTagSet(nob, tag)
		end)
		-- Listen for `GameObject` despawn and manage sync table.
		ServerSignals.NetGameObjectDespawning:Connect(function(_param)
			local nob = _param.nob
			local tag = _param.tag
			self:removeNobFromReplicationTagSet(nob, tag)
		end)
		-- Listen for local `GameObject` added to collection.
		ServerSignals.CollectionManagerTagAdded:Connect(function(_param)
			local go = _param.go
			local tag = _param.tag
			self:addGameObjectToTagSet(go, tag)
		end)
	end
	function CollectionManagerService:listenForGameObjectDestruction(gameObject, tag)
		-- Add `DestroyWatcher` component to _all_ tagged `GameObject`s.
		if gameObject:GetComponent("DestroyWatcher") == nil then
			local componentRef = gameObject:AddComponent("DestroyWatcher")
			componentRef:OnDestroyedEvent(function()
				self:removeGameObjectFromTagSet(gameObject, tag)
			end)
		end
	end
	function CollectionManagerService:addNobToReplicationTagSet(nob, tag)
		local _toReplicateCollectionTable = self.toReplicateCollectionTable
		local _tag = tag
		local tagSet = _toReplicateCollectionTable[_tag]
		if tagSet then
			local _nob = nob
			tagSet[_nob] = true
		else
			local _toReplicateCollectionTable_1 = self.toReplicateCollectionTable
			local _tag_1 = tag
			local _arg1 = {
				[nob] = true,
			}
			_toReplicateCollectionTable_1[_tag_1] = _arg1
		end
	end
	function CollectionManagerService:removeNobFromReplicationTagSet(nob, tag)
		local _toReplicateCollectionTable = self.toReplicateCollectionTable
		local _tag = tag
		local tagSet = _toReplicateCollectionTable[_tag]
		if not tagSet then
			return nil
		end
		local _nob = nob
		if tagSet[_nob] ~= nil then
			local _nob_1 = nob
			tagSet[_nob_1] = nil
		end
	end
	function CollectionManagerService:addGameObjectToTagSet(gameObject, tag)
		local _serverCollectionTable = self.serverCollectionTable
		local _tag = tag
		local tagSet = _serverCollectionTable[_tag]
		if tagSet then
			local _gameObject = gameObject
			tagSet[_gameObject] = true
		else
			local _serverCollectionTable_1 = self.serverCollectionTable
			local _tag_1 = tag
			local _arg1 = {
				[gameObject] = true,
			}
			_serverCollectionTable_1[_tag_1] = _arg1
		end
		-- Listen for GameObject destroying.
		self:listenForGameObjectDestruction(gameObject, tag)
		-- Fire signal when `GameObject` is added to collection.
		ServerSignals.GameObjectAddedToCollection:Fire({
			go = gameObject,
			tag = tag,
		})
	end
	function CollectionManagerService:removeGameObjectFromTagSet(gameObject, tag)
		local _serverCollectionTable = self.serverCollectionTable
		local _tag = tag
		local tagSet = _serverCollectionTable[_tag]
		if not tagSet then
			return nil
		end
		local _gameObject = gameObject
		if tagSet[_gameObject] ~= nil then
			local _gameObject_1 = gameObject
			tagSet[_gameObject_1] = nil
		end
	end
	function CollectionManagerService:getGameObjectsByTag(tag)
		local collectionGameObjects = {}
		local _serverCollectionTable = self.serverCollectionTable
		local _tag = tag
		local tagSet = _serverCollectionTable[_tag]
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
-- (Flamework) CollectionManagerService metadata
Reflect.defineMetadata(CollectionManagerService, "identifier", "Bundles/Server/Services/Global/CollectionManager/CollectionManagerService@CollectionManagerService")
Reflect.defineMetadata(CollectionManagerService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(CollectionManagerService, "$:flamework@Service", Service, { {
	loadOrder = 0,
} })
return {
	CollectionManagerService = CollectionManagerService,
}
-- ----------------------------------
-- ----------------------------------
