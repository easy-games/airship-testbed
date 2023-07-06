-- Compiled with unity-ts v2.1.0-75
local FN_MARKER = "__bin_fn_marker__"
local THREAD_MARKER = "__bin_thread_marker__"
local function getObjCleanupFn(obj, cleanupMethod)
	local _obj = obj
	local t = typeof(_obj)
	if t == "function" then
		return FN_MARKER
	elseif t == "thread" then
		return THREAD_MARKER
	end
	if cleanupMethod ~= nil then
		return cleanupMethod
	end
	if t == "userdata" then
		return "Destroy"
	elseif t == "table" then
		if obj.Destroy ~= nil then
			return "Destroy"
		elseif obj.Disconnect ~= nil then
			return "Disconnect"
		elseif obj.destroy ~= nil then
			return "destroy"
		elseif obj.disconnect ~= nil then
			return "disconnect"
		end
	end
	local _obj_1 = obj
	error("failed to get cleanup function for object " .. (typeof(_obj_1) .. (": " .. tostring(obj))), 3)
end
--[[
	*
	* Class for tracking and cleaning up resources.
]]
local Bin
do
	Bin = setmetatable({}, {
		__tostring = function()
			return "Bin"
		end,
	})
	Bin.__index = Bin
	function Bin.new(...)
		local self = setmetatable({}, Bin)
		return self:constructor(...) or self
	end
	function Bin:constructor()
		self.objects = {}
		self.cleaning = false
	end
	function Bin:Add(obj, cleanupMethod)
		if self.cleaning then
			error("cannot call bin.Add() while cleaning", 2)
		end
		local cleanup = getObjCleanupFn(obj, cleanupMethod)
		local _objects = self.objects
		local _arg0 = {
			obj = obj,
			cleanup = cleanup,
		}
		table.insert(_objects, _arg0)
		return obj
	end
	function Bin:Connect(signal, handler)
		if self.cleaning then
			error("cannot call bin.Connect() while cleaning", 2)
		end
		return self:Add(signal:Connect(handler))
	end
	function Bin:Extend()
		if self.cleaning then
			error("cannot call bin.Extend() while cleaning", 2)
		end
		return self:Add(Bin.new())
	end
	function Bin:Clean()
		if self.cleaning then
			return nil
		end
		self.cleaning = true
		local _objects = self.objects
		local _arg0 = function(obj)
			return self:cleanupObj(obj)
		end
		for _k, _v in _objects do
			_arg0(_v, _k - 1, _objects)
		end
		table.clear(self.objects)
		self.cleaning = false
	end
	function Bin:Destroy()
		self:Clean()
	end
	function Bin:cleanupObj(track)
		if track.cleanup == FN_MARKER then
			track.obj()
		elseif track.cleanup == THREAD_MARKER then
			coroutine.close(track.obj)
		else
			(track.obj)[track.cleanup](track.obj)
		end
	end
end
return {
	Bin = Bin,
}
-- ----------------------------------
-- ----------------------------------
