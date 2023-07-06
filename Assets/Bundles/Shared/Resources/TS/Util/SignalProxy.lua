-- Compiled with unity-ts v2.1.0-75
local Signal = require("Shared/TS/Util/Signal").Signal
local idCounter = 1
local SignalProxy
do
	local super = Signal
	SignalProxy = setmetatable({}, {
		__tostring = function()
			return "SignalProxy"
		end,
		__index = super,
	})
	SignalProxy.__index = SignalProxy
	function SignalProxy.new(...)
		local self = setmetatable({}, SignalProxy)
		return self:constructor(...) or self
	end
	function SignalProxy:constructor(source)
		super.constructor(self)
		self.source = source
		self.proxyConnections = {}
	end
	function SignalProxy:Connect(callback)
		return self:ConnectWithPriority(200, callback)
	end
	function SignalProxy:ConnectWithPriority(priority, callback)
		local id = idCounter
		idCounter += 1
		local item = {
			callback = callback,
			id = id,
		}
		local _proxyConnections = self.proxyConnections
		local _priority = priority
		if _proxyConnections[_priority] ~= nil then
			local _proxyConnections_1 = self.proxyConnections
			local _priority_1 = priority
			table.insert(_proxyConnections_1[_priority_1], item)
		else
			local _proxyConnections_1 = self.proxyConnections
			local _priority_1 = priority
			local _arg1 = { item }
			_proxyConnections_1[_priority_1] = _arg1
		end
		local disconnect = self.source:ConnectWithPriority(priority, callback)
		return function()
			disconnect()
			local _proxyConnections_1 = self.proxyConnections
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
			for _k, _v in _proxyConnections_1 do
				_arg0(_v, _k, _proxyConnections_1)
			end
		end
	end
	function SignalProxy:DisconnectAll()
		table.clear(self.proxyConnections)
	end
	function SignalProxy:Destroy()
		self:DisconnectAll()
	end
end
return {
	SignalProxy = SignalProxy,
}
-- ----------------------------------
-- ----------------------------------
