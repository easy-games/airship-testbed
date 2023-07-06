-- Compiled with unity-ts v2.1.0-75
local _NetworkAPI = require("Shared/TS/Network/NetworkAPI")
local NetworkAPI = _NetworkAPI.default
local NetworkChannel = _NetworkAPI.NetworkChannel
-- To prevent collisions with RemoteEvent IDs:
local RF_ID_OFFSET = 1000000
local ID_COUNTER = 0
local RemoteFunctionClient
do
	RemoteFunctionClient = setmetatable({}, {
		__tostring = function()
			return "RemoteFunctionClient"
		end,
	})
	RemoteFunctionClient.__index = RemoteFunctionClient
	function RemoteFunctionClient.new(...)
		local self = setmetatable({}, RemoteFunctionClient)
		return self:constructor(...) or self
	end
	function RemoteFunctionClient:constructor(id)
		self.id = id
		self.listening = false
		self.sendId = 0
		self.yieldingThreads = {}
	end
	function RemoteFunctionClient:FireServer(...)
		local args = { ... }
		if not self.listening then
			self:StartListening()
		end
		local _original = self.sendId
		self.sendId += 1
		local sendId = _original
		local _array = { sendId }
		local _length = #_array
		table.move(args, 1, #args, _length + 1, _array)
		local sendArgs = _array
		local thread = coroutine.running()
		self.yieldingThreads[sendId] = thread
		NetworkAPI.fireServer(self.id, sendArgs, NetworkChannel.Reliable)
		return coroutine.yield()
	end
	function RemoteFunctionClient:StartListening()
		if self.listening then
			return nil
		end
		self.listening = true
		NetworkAPI.connect(self.id, function(sendId, ...)
			local args = { ... }
			local _yieldingThreads = self.yieldingThreads
			local _sendId = sendId
			local thread = _yieldingThreads[_sendId]
			local _yieldingThreads_1 = self.yieldingThreads
			local _sendId_1 = sendId
			_yieldingThreads_1[_sendId_1] = nil
			if thread ~= nil then
				local success, err = coroutine.resume(thread, unpack(args))
				if not success then
					print("NETWORK HANDLER ERROR:\n" .. tostring(err))
				end
			end
		end)
	end
end
local RemoteFunctionServer
do
	RemoteFunctionServer = setmetatable({}, {
		__tostring = function()
			return "RemoteFunctionServer"
		end,
	})
	RemoteFunctionServer.__index = RemoteFunctionServer
	function RemoteFunctionServer.new(...)
		local self = setmetatable({}, RemoteFunctionServer)
		return self:constructor(...) or self
	end
	function RemoteFunctionServer:constructor(id)
		self.id = id
	end
	function RemoteFunctionServer:SetCallback(callback)
		if self.disconnect ~= nil then
			self.disconnect()
		end
		self.disconnect = NetworkAPI.connect(self.id, function(clientId, sendId, ...)
			local args = { ... }
			local res = { callback(clientId, unpack(args)) }
			local _array = { sendId }
			local _length = #_array
			table.move(res, 1, #res, _length + 1, _array)
			local argsReturn = _array
			NetworkAPI.fireClient(self.id, clientId, argsReturn, NetworkChannel.Reliable)
		end)
	end
end
local RemoteFunction
do
	RemoteFunction = setmetatable({}, {
		__tostring = function()
			return "RemoteFunction"
		end,
	})
	RemoteFunction.__index = RemoteFunction
	function RemoteFunction.new(...)
		local self = setmetatable({}, RemoteFunction)
		return self:constructor(...) or self
	end
	function RemoteFunction:constructor()
		local id = ID_COUNTER
		ID_COUNTER += 1
		id += RF_ID_OFFSET
		self.Server = RemoteFunctionServer.new(id)
		self.Client = RemoteFunctionClient.new(id)
	end
end
return {
	RemoteFunction = RemoteFunction,
}
-- ----------------------------------
-- ----------------------------------
