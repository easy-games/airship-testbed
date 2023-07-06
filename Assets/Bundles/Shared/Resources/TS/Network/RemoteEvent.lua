-- Compiled with unity-ts v2.1.0-75
local _NetworkAPI = require("Shared/TS/Network/NetworkAPI")
local NetworkAPI = _NetworkAPI.default
local NetworkChannel = _NetworkAPI.NetworkChannel
local ID_COUNTER = 0
local RemoteEventServer
do
	RemoteEventServer = setmetatable({}, {
		__tostring = function()
			return "RemoteEventServer"
		end,
	})
	RemoteEventServer.__index = RemoteEventServer
	function RemoteEventServer.new(...)
		local self = setmetatable({}, RemoteEventServer)
		return self:constructor(...) or self
	end
	function RemoteEventServer:constructor(id, channel)
		if channel == nil then
			channel = NetworkChannel.Reliable
		end
		self.id = id
		self.channel = channel
	end
	function RemoteEventServer:FireAllClients(...)
		local args = { ... }
		NetworkAPI.fireAllClients(self.id, args, self.channel)
	end
	function RemoteEventServer:FireExcept(ignoredClientId, ...)
		local args = { ... }
		NetworkAPI.fireExcept(self.id, ignoredClientId, args, self.channel)
	end
	function RemoteEventServer:FireClient(clientId, ...)
		local args = { ... }
		NetworkAPI.fireClient(self.id, clientId, args, self.channel)
	end
	function RemoteEventServer:FireClients(clientIds, ...)
		local args = { ... }
		NetworkAPI.fireClients(self.id, clientIds, args, self.channel)
	end
	function RemoteEventServer:OnClientEvent(callback)
		return NetworkAPI.connect(self.id, callback)
	end
end
local RemoteEventClient
do
	RemoteEventClient = setmetatable({}, {
		__tostring = function()
			return "RemoteEventClient"
		end,
	})
	RemoteEventClient.__index = RemoteEventClient
	function RemoteEventClient.new(...)
		local self = setmetatable({}, RemoteEventClient)
		return self:constructor(...) or self
	end
	function RemoteEventClient:constructor(id, channel)
		if channel == nil then
			channel = NetworkChannel.Reliable
		end
		self.id = id
		self.channel = channel
	end
	function RemoteEventClient:FireServer(...)
		local args = { ... }
		NetworkAPI.fireServer(self.id, args, self.channel)
	end
	function RemoteEventClient:OnServerEvent(callback)
		return NetworkAPI.connect(self.id, callback)
	end
end
local RemoteEvent
do
	RemoteEvent = setmetatable({}, {
		__tostring = function()
			return "RemoteEvent"
		end,
	})
	RemoteEvent.__index = RemoteEvent
	function RemoteEvent.new(...)
		local self = setmetatable({}, RemoteEvent)
		return self:constructor(...) or self
	end
	function RemoteEvent:constructor(channel)
		if channel == nil then
			channel = NetworkChannel.Reliable
		end
		local _original = ID_COUNTER
		ID_COUNTER += 1
		local id = _original
		self.Server = RemoteEventServer.new(id, channel)
		self.Client = RemoteEventClient.new(id, channel)
	end
end
return {
	RemoteEvent = RemoteEvent,
}
-- ----------------------------------
-- ----------------------------------
