-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
-- * Wrapper around `Object` functionality.
local GameObjectBridge
do
	GameObjectBridge = setmetatable({}, {
		__tostring = function()
			return "GameObjectBridge"
		end,
	})
	GameObjectBridge.__index = GameObjectBridge
	function GameObjectBridge.new(...)
		local self = setmetatable({}, GameObjectBridge)
		return self:constructor(...) or self
	end
	function GameObjectBridge:constructor()
	end
	function GameObjectBridge:Instantiate(original, tag)
		-- * Fire `GameObjectInstantiated` event if tagged.
		local go = Object:Instantiate(original)
		if tag then
			GameObjectBridge:FireTaggedGameObjectInstantiatedSignal(go, tag)
		end
		return go
	end
	function GameObjectBridge:InstantiateAt(original, position, rotation, tag)
		-- * Fire `GameObjectInstantiated` event if tagged.
		local go = Object:Instantiate(original, position, rotation)
		if tag then
			GameObjectBridge:FireTaggedGameObjectInstantiatedSignal(go, tag)
		end
		return go
	end
	function GameObjectBridge:InstantiateIn(original, parent, tag)
		-- * Fire `GameObjectInstantiated` event if tagged.
		local go = Object:Instantiate(original, parent)
		if tag then
			GameObjectBridge:FireTaggedGameObjectInstantiatedSignal(go, tag)
		end
		return go
	end
	function GameObjectBridge:Destroy(gameObject, delay)
		if delay ~= nil then
			Object:Destroy(gameObject, delay)
		else
			Object:Destroy(gameObject)
		end
	end
	function GameObjectBridge:FireTaggedGameObjectInstantiatedSignal(gameObject, tag)
		if RunUtil:IsServer() then
			local _promise = TS.Promise.new(function(resolve)
				resolve(require("Server/TS/ServerSignals"))
			end)
			local _arg0 = function(serverSignalsRef)
				local tagAddedSignal = serverSignalsRef.ServerSignals.CollectionManagerTagAdded
				tagAddedSignal:Fire({
					go = gameObject,
					tag = tag,
				})
			end
			_promise:andThen(_arg0)
		elseif RunUtil:IsClient() then
			local _promise = TS.Promise.new(function(resolve)
				resolve(require("Client/TS/ClientSignals"))
			end)
			local _arg0 = function(clientSignalsRef)
				local tagAddedSignal = clientSignalsRef.ClientSignals.CollectionManagerTagAdded
				tagAddedSignal:Fire({
					go = gameObject,
					tag = tag,
				})
			end
			_promise:andThen(_arg0)
		end
	end
end
return {
	GameObjectBridge = GameObjectBridge,
}
-- ----------------------------------
-- ----------------------------------
