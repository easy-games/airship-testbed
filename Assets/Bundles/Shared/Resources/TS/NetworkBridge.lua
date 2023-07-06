-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Network = require("Shared/TS/Network").Network
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
-- * Wrapper around `NetworkCore` to allow for easy capturing of replicated GameObjects.
local NetworkBridge
do
	NetworkBridge = setmetatable({}, {
		__tostring = function()
			return "NetworkBridge"
		end,
	})
	NetworkBridge.__index = NetworkBridge
	function NetworkBridge.new(...)
		local self = setmetatable({}, NetworkBridge)
		return self:constructor(...) or self
	end
	function NetworkBridge:constructor()
	end
	function NetworkBridge:Spawn(gameObject, tag)
		NetworkCore:Spawn(gameObject)
		-- If tagged, notify _all_ clients of replicating GO.
		if tag then
			-- Map GameObject to tag for lookup on despawn.
			local networkObjectId = (gameObject:GetComponent("NetworkObject")).ObjectId
			-- Insert into tag lookup table to find tag on despawn.
			local _tagLookup = NetworkBridge.tagLookup
			local _tag = tag
			_tagLookup[networkObjectId] = _tag
			if RunUtil:IsServer() then
				local _promise = TS.Promise.new(function(resolve)
					resolve(require("Server/TS/ServerSignals"))
				end)
				local _arg0 = function(serverSignalsRef)
					local netGameObjectReplicatingSignal = serverSignalsRef.ServerSignals.NetGameObjectReplicating
					Network.ServerToClient.NetGameObjectReplicating.Server:FireAllClients(networkObjectId, tag)
					netGameObjectReplicatingSignal:Fire({
						nob = networkObjectId,
						tag = tag,
					})
				end
				_promise:andThen(_arg0)
			end
		end
	end
	function NetworkBridge:SpawnWithClientOwnership(gameObject, clientId, tag)
		NetworkCore:Spawn(gameObject, clientId)
		-- If tagged, notify `clientId` of replicating GO.
		if tag then
			local networkObjectId = (gameObject:GetComponent("NetworkObject")).ObjectId
			if RunUtil:IsServer() then
				Network.ServerToClient.NetGameObjectReplicating.Server:FireClient(clientId, networkObjectId, tag)
			end
		end
	end
	function NetworkBridge:Despawn(gameObject)
		local networkObjectId = (gameObject:GetComponent("NetworkObject")).ObjectId
		local tag = NetworkBridge.tagLookup[networkObjectId]
		-- If tagged, remove from lookup table and fire despawn notifier signal.
		if tag then
			NetworkBridge.tagLookup[networkObjectId] = nil
			if RunUtil:IsServer() then
				local _promise = TS.Promise.new(function(resolve)
					resolve(require("Server/TS/ServerSignals"))
				end)
				local _arg0 = function(serverSignalsRef)
					local netGameObjectDespawning = serverSignalsRef.ServerSignals.NetGameObjectDespawning
					netGameObjectDespawning:Fire({
						nob = networkObjectId,
						tag = tag,
					})
				end
				_promise:andThen(_arg0)
			end
		end
		NetworkCore:Despawn(gameObject)
	end
	NetworkBridge.tagLookup = {}
end
return {
	NetworkBridge = NetworkBridge,
}
-- ----------------------------------
-- ----------------------------------
