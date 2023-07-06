-- Compiled with unity-ts v2.1.0-75
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local NetworkChannel
do
	local _inverse = {}
	NetworkChannel = setmetatable({}, {
		__index = _inverse,
	})
	NetworkChannel.Reliable = 0
	_inverse[0] = "Reliable"
	NetworkChannel.Unreliable = 1
	_inverse[1] = "Unreliable"
end
local MAX_QUEUE = 10000
local callbacksById = {}
local queuedDataById = {}
local function addToQueue(msg)
	local id = tostring(msg.i)
	local queue = queuedDataById[id]
	if queue == nil then
		queue = {}
		local _queue = queue
		queuedDataById[id] = _queue
	end
	if #queue >= MAX_QUEUE then
		print("REMOTE EVENT: MAX REQUEST QUEUE REACHED; DROPPING FUTURE MESSAGES")
		return nil
	end
	local _queue = queue
	local _msg = msg
	table.insert(_queue, _msg)
end
local function InitNet()
	if RunUtil:IsServer() then
		-- Server
		NetworkCore.Net:OnBroadcastFromClientAction(function(clientId, blob)
			local msg = blob:Decode()
			local id = msg.i
			local data = msg.d
			local _arg0 = tostring(id)
			local callbacks = callbacksById[_arg0]
			if callbacks == nil then
				return nil
			end
			for _, callback in callbacks do
				callback.callback(clientId, unpack(data))
			end
		end)
	else
		-- Client
		NetworkCore.Net:OnBroadcastFromServerAction(function(blob)
			local msg = blob:Decode()
			local id = msg.i
			local data = msg.d
			local _arg0 = tostring(id)
			local callbacks = callbacksById[_arg0]
			if callbacks == nil then
				-- Queue data
				addToQueue(msg)
				return nil
			end
			for _, callback in callbacks do
				callback.callback(unpack(data))
			end
		end)
	end
end
local function pack(id, args)
	return BinaryBlob.new({
		i = id,
		d = args,
	})
end
local function fireServer(id, args, channel)
	local msg = pack(id, args)
	NetworkCore.Net:BroadcastToServer(msg, if channel == NetworkChannel.Reliable then 1 else 0)
end
local function fireAllClients(id, args, channel)
	local msg = pack(id, args)
	NetworkCore.Net:BroadcastToAllClients(msg, if channel == NetworkChannel.Reliable then 1 else 0)
end
local function fireClient(id, clientId, args, channel)
	local msg = pack(id, args)
	NetworkCore.Net:BroadcastToClient(clientId, msg, if channel == NetworkChannel.Reliable then 1 else 0)
end
local function fireExcept(id, ignoredClientId, args, channel)
	local msg = pack(id, args)
	NetworkCore.Net:BroadcastToAllExceptClient(ignoredClientId, msg, if channel == NetworkChannel.Reliable then 1 else 0)
end
local function fireClients(id, clientIds, args, channel)
	local msg = pack(id, args)
	NetworkCore.Net:BroadcastToClients(clientIds, msg, if channel == NetworkChannel.Reliable then 1 else 0)
end
local function connect(id, callback)
	local connected = true
	local _arg0 = tostring(id)
	local callbacks = callbacksById[_arg0]
	if callbacks == nil then
		callbacks = {}
		local _arg0_1 = tostring(id)
		local _callbacks = callbacks
		callbacksById[_arg0_1] = _callbacks
	end
	-- Wrap callback in a unique object:
	local callbackItem = {
		callback = callback,
	}
	table.insert(callbacks, callbackItem)
	-- Invoke callback with any queued data:
	local _arg0_1 = tostring(id)
	local queue = queuedDataById[_arg0_1]
	if queue ~= nil then
		for _, msg in queue do
			callback(unpack(msg.d))
		end
		local _arg0_2 = tostring(id)
		queuedDataById[_arg0_2] = nil
	end
	-- Disconnect function
	return function()
		if not connected then
			return nil
		end
		connected = false
		local _arg0_2 = tostring(id)
		local callbacksDisconnect = callbacksById[_arg0_2]
		if callbacksDisconnect == nil then
			return nil
		end
		local index = (table.find(callbacksDisconnect, callbackItem) or 0) - 1
		if index == -1 then
			return nil
		end
		table.remove(callbacksDisconnect, index + 1)
	end
end
local NetworkAPI = {
	fireServer = fireServer,
	fireAllClients = fireAllClients,
	fireClient = fireClient,
	fireClients = fireClients,
	fireExcept = fireExcept,
	connect = connect,
}
-- initNet();
local default = NetworkAPI
return {
	InitNet = InitNet,
	NetworkChannel = NetworkChannel,
	default = default,
}
-- ----------------------------------
-- ----------------------------------
