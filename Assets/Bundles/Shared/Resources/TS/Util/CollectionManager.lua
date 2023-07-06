-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Bin = require("Shared/TS/Util/Bin").Bin
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local Task = require("Shared/TS/Util/Task").Task
-- * How often to check if server-owned replication sync table has been reconstructed on client.
local REPLICATION_CHECK_INTERVAL = 0.1
local CollectionManager
do
	CollectionManager = setmetatable({}, {
		__tostring = function()
			return "CollectionManager"
		end,
	})
	CollectionManager.__index = CollectionManager
	function CollectionManager.new(...)
		local self = setmetatable({}, CollectionManager)
		return self:constructor(...) or self
	end
	function CollectionManager:constructor()
	end
	function CollectionManager:WatchCollectionTag(collectionTag, gameObjectCallback)
		local watchBin = Bin.new()
		Task:Spawn(function()
			if RunUtil:IsServer() then
				local _promise = TS.Promise.new(function(resolve)
					resolve(require("Server/TS/ServerSignals"))
				end)
				local _arg0 = function(serverSignalsRef)
					local gameObjectAddedSignal = serverSignalsRef.ServerSignals.GameObjectAddedToCollection
					local existingGameObjects = CollectionManager:GetTagged(collectionTag)
					-- Execute `gameObjectCallback` on ALL existing `GameObject`s with `collectionTag`.
					local _arg0_1 = function(go)
						return gameObjectCallback(go)
					end
					for _k, _v in existingGameObjects do
						_arg0_1(_v, _k - 1, existingGameObjects)
					end
					-- Execute `gameObjectCallback` on ALL new `GameObject`s with `collectionTag`.
					watchBin:Add(gameObjectAddedSignal:Connect(function(event)
						if event.tag == collectionTag then
							gameObjectCallback(event.go)
						end
					end))
				end
				_promise:andThen(_arg0)
			elseif RunUtil:IsClient() then
				local _promise = TS.Promise.new(function(resolve)
					resolve(require("Client/TS/ClientSignals"))
				end)
				local _arg0 = function(clientSignalsRef)
					-- Wait until replication table has been synced and constructed on client.
					while not self.replicationTableSynced do
						wait(REPLICATION_CHECK_INTERVAL)
					end
					local gameObjectAddedSignal = clientSignalsRef.ClientSignals.GameObjectAddedToCollection
					local existingGameObjects = CollectionManager:GetTagged(collectionTag)
					-- Execute `gameObjectCallback` on ALL existing `GameObject`s with `collectionTag`.
					local _arg0_1 = function(go)
						return gameObjectCallback(go)
					end
					for _k, _v in existingGameObjects do
						_arg0_1(_v, _k - 1, existingGameObjects)
					end
					-- Execute `gameObjectCallback` on ALL new `GameObject`s with `collectionTag`.
					watchBin:Add(gameObjectAddedSignal:Connect(function(event)
						if event.tag == collectionTag then
							gameObjectCallback(event.go)
						end
					end))
				end
				_promise:andThen(_arg0)
			end
		end)
		-- Return Bin for listener cleanup.
		return watchBin
	end
	function CollectionManager:GetTagged(collectionTag)
		-- Wrap fetch in promise to conditionally fetch `GameObject`s based on runtime.
		local fetchPromise = TS.Promise.new(function(resolve)
			if RunUtil:IsServer() then
				local _promise = TS.Promise.new(function(resolve)
					resolve(require("Server/TS/Services/Global/CollectionManager/CollectionManagerHelper"))
				end)
				local _arg0 = function(collectionManagerRef)
					local collectionManager = collectionManagerRef.FetchDependency()
					local gameObjects = collectionManager:getGameObjectsByTag(collectionTag)
					resolve(gameObjects)
				end
				_promise:andThen(_arg0)
			elseif RunUtil:IsClient() then
				local _promise = TS.Promise.new(function(resolve)
					resolve(require("Client/TS/Controllers/Global/CollectionManager/CollectionManagerHelper"))
				end)
				local _arg0 = function(collectionManagerRef)
					local collectionManager = collectionManagerRef.FetchDependency()
					local gameObjects = collectionManager:getGameObjectsByTag(collectionTag)
					resolve(gameObjects)
				end
				_promise:andThen(_arg0)
			end
		end)
		-- This **DOES** yield but should be effectively instant.
		return fetchPromise:expect()
	end
	function CollectionManager:AddTag(gameObject, collectionTag)
		if RunUtil:IsServer() then
			local _promise = TS.Promise.new(function(resolve)
				resolve(require("Server/TS/Services/Global/CollectionManager/CollectionManagerHelper"))
			end)
			local _arg0 = function(collectionManagerRef)
				local collectionManager = collectionManagerRef.FetchDependency()
				collectionManager:addGameObjectToTagSet(gameObject, collectionTag)
			end
			_promise:andThen(_arg0)
		elseif RunUtil:IsClient() then
			local _promise = TS.Promise.new(function(resolve)
				resolve(require("Client/TS/Controllers/Global/CollectionManager/CollectionManagerHelper"))
			end)
			local _arg0 = function(collectionManagerRef)
				local collectionManager = collectionManagerRef.FetchDependency()
				collectionManager:addGameObjectToTagSet(gameObject, collectionTag)
			end
			_promise:andThen(_arg0)
		end
	end
	function CollectionManager:RemoveTag(gameObject, collectionTag)
		if RunUtil:IsServer() then
			local _promise = TS.Promise.new(function(resolve)
				resolve(require("Server/TS/Services/Global/CollectionManager/CollectionManagerHelper"))
			end)
			local _arg0 = function(collectionManagerRef)
				local collectionManager = collectionManagerRef.FetchDependency()
				collectionManager:removeGameObjectFromTagSet(gameObject, collectionTag)
			end
			_promise:andThen(_arg0)
		elseif RunUtil:IsClient() then
			local _promise = TS.Promise.new(function(resolve)
				resolve(require("Client/TS/Controllers/Global/CollectionManager/CollectionManagerHelper"))
			end)
			local _arg0 = function(collectionManagerRef)
				local collectionManager = collectionManagerRef.FetchDependency()
				collectionManager:removeGameObjectFromTagSet(gameObject, collectionTag)
			end
			_promise:andThen(_arg0)
		end
	end
	CollectionManager.replicationTableSynced = false
end
return {
	CollectionManager = CollectionManager,
}
-- ----------------------------------
-- ----------------------------------
