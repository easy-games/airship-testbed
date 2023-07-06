-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Object = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local Cancellable = require("Shared/TS/Util/Cancellable").Cancellable
local idCounter = 1
local Signal
do
	Signal = setmetatable({}, {
		__tostring = function()
			return "Signal"
		end,
	})
	Signal.__index = Signal
	function Signal.new(...)
		local self = setmetatable({}, Signal)
		return self:constructor(...) or self
	end
	function Signal:constructor()
		self.debugLogging = false
		self.trackYielding = true
		self.connections = {}
	end
	function Signal:Connect(callback)
		return self:ConnectWithPriority(200, callback)
	end
	function Signal:ConnectWithPriority(priority, callback)
		local id = idCounter
		idCounter += 1
		local item = {
			callback = callback,
			id = id,
		}
		local _connections = self.connections
		local _priority = priority
		if _connections[_priority] ~= nil then
			local _connections_1 = self.connections
			local _priority_1 = priority
			table.insert(_connections_1[_priority_1], item)
		else
			local _connections_1 = self.connections
			local _priority_1 = priority
			local _arg1 = { item }
			_connections_1[_priority_1] = _arg1
		end
		return function()
			local _connections_1 = self.connections
			local _arg0 = function(items)
				local _items = items
				local _arg0_1 = function(item, i)
					if item.id == id then
						local _items_1 = items
						local _i = i
						table.remove(_items_1, _i + 1)
						return nil
					end
				end
				for _k, _v in _items do
					_arg0_1(_v, _k - 1, _items)
				end
			end
			for _k, _v in _connections_1 do
				_arg0(_v, _k, _connections_1)
			end
		end
	end
	function Signal:Once(callback)
		local done = false
		local c
		c = self:Connect(function(...)
			local args = { ... }
			if done then
				return nil
			end
			done = true
			c()
			callback(unpack(args))
		end)
		return c
	end
	function Signal:Fire(...)
		local args = { ... }
		if self.debugLogging then
			-- ▼ ReadonlyMap.size ▼
			local _size = 0
			for _ in self.connections do
				_size += 1
			end
			-- ▲ ReadonlyMap.size ▲
			print("key count: " .. tostring(_size))
			local callbackCount = 0
			for _, priority in Object.keys(self.connections) do
				local _connections = self.connections
				local _priority = priority
				for _1, connection in _connections[_priority] do
					callbackCount += 1
				end
			end
			print("callback count: " .. tostring(callbackCount))
		end
		local fireCount = 0
		local _exp = Object.keys(self.connections)
		local _arg0 = function(a, b)
			return a < b
		end
		table.sort(_exp, _arg0)
		local keys = _exp
		local cancelled = false
		local isCancellable = false
		if #args == 1 and TS.instanceof(args[1], Cancellable) then
			isCancellable = true
		end
		for _, priority in keys do
			local _array = {}
			local _length = #_array
			local _connections = self.connections
			local _priority = priority
			local _array_1 = _connections[_priority]
			table.move(_array_1, 1, #_array_1, _length + 1, _array)
			local entries = _array
			for _1, entry in entries do
				fireCount += 1
				local thread = coroutine.create(entry.callback)
				local success, err = coroutine.resume(thread, unpack(args))
				if not success then
					error(err)
				end
				if coroutine.status(thread) ~= "dead" then
					print(debug:traceback(thread, "Signal yielded unexpectedly. This might be an error."))
				end
				if isCancellable then
					local cancellable = args[1]
					if cancellable:IsCancelled() then
						cancelled = true
						break
					end
				end
			end
			if cancelled then
				break
			end
		end
		if self.debugLogging then
			print("fire count: " .. tostring(fireCount))
		end
		return args[1]
	end
	function Signal:Wait()
		local thread = coroutine.running()
		self:Once(function(...)
			local args = { ... }
			local success, err = coroutine.resume(thread, unpack(args))
			if not success then
				error(err)
			end
		end)
		return coroutine.yield()
	end
	function Signal:Proxy(signal)
		return self:Connect(function(...)
			local args = { ... }
			signal:Fire(unpack(args))
		end)
	end
	function Signal:DisconnectAll()
		table.clear(self.connections)
	end
	function Signal:Destroy()
		self:DisconnectAll()
	end
	function Signal:SetDebug(value)
		self.debugLogging = value
		return self
	end
	function Signal:WithYieldTracking(value)
		self.trackYielding = value
		return self
	end
end
return {
	Signal = Signal,
}
-- ----------------------------------
-- ----------------------------------
