-- Compiled with unity-ts v2.1.0-75
local Bin = require("Shared/TS/Util/Bin").Bin
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local Signal = require("Shared/TS/Util/Signal").Signal
local TimeUtil = require("Shared/TS/Util/TimeUtil").TimeUtil
local waitingByName = {}
local managed = InstanceFinder.ClientManager.Objects
if RunUtil:IsServer() then
	managed = InstanceFinder.ServerManager.Objects
end
local NetworkObjectAdded = Signal.new()
managed:OnAddedToSpawnedEvent(function(nob)
	NetworkObjectAdded:Fire(nob)
	local _name = nob.gameObject.name
	local _nob = nob
	waitingByName[_name] = _nob
end)
local NetworkUtil
do
	NetworkUtil = setmetatable({}, {
		__tostring = function()
			return "NetworkUtil"
		end,
	})
	NetworkUtil.__index = NetworkUtil
	function NetworkUtil.new(...)
		local self = setmetatable({}, NetworkUtil)
		return self:constructor(...) or self
	end
	function NetworkUtil:constructor()
	end
	function NetworkUtil:GetNetworkObject(objectId)
		if objectId == nil then
			return nil
		end
		if RunUtil:IsClient() then
			if InstanceFinder.ClientManager.Objects.Spawned:ContainsKey(objectId) then
				local _spawned = InstanceFinder.ClientManager.Objects.Spawned
				local _objectId = objectId
				return _spawned[_objectId]
			else
				return nil
			end
		else
			if InstanceFinder.ServerManager.Objects.Spawned:ContainsKey(objectId) then
				local _spawned = InstanceFinder.ServerManager.Objects.Spawned
				local _objectId = objectId
				return _spawned[_objectId]
			else
				return nil
			end
		end
	end
end
--[[
	*
	* Wait for (`timeout`) and fetch `NetworkObject` that corresponds to `objectId`.
	* @param objectId Corresponds to a replicated `NetworkObject`.
	* @param timeout How long in seconds to wait for `objectId` to exist before timing out.
	* @returns `NetworkObject` that corresponds to `objectId`.
]]
local function WaitForNobIdTimeout(objectId, timeout)
	-- Return NetworkObject if it already exists.
	local nob = NetworkUtil:GetNetworkObject(objectId)
	if nob then
		return nob
	end
	-- Return when exists or timeout after `timeout`.
	local elapsed = 0
	local bin = Bin.new()
	bin:Add(NetworkObjectAdded:Connect(function(addedNob)
		if addedNob.ObjectId == objectId then
			nob = addedNob
			bin:Clean()
		end
	end))
	while true do
		wait()
		elapsed += TimeUtil:GetDeltaTime()
		if nob then
			return nob
		end
		if elapsed >= timeout then
			bin:Clean()
			return nil
		end
	end
end
--[[
	*
	* Wait for (`timeout`) and fetch `NetworkObject` that corresponds to `name`.
	* @param objectId Corresponds to a replicated `NetworkObject`.
	* @param timeout How long in seconds to wait for `name` to exist before timing out.
	* @returns `NetworkObject` that corresponds to `name`.
]]
local function WaitForNobTimeout(name, timeout)
	-- If `GameObject` with name already exists, return.
	local gameObject = GameObject:Find(name)
	if gameObject then
		return gameObject:GetComponent("NetworkObject")
	end
	-- Return when exists or timeout after `timeout`.
	local elapsed = 0
	while true do
		wait()
		elapsed += TimeUtil:GetDeltaTime()
		local _name = name
		if waitingByName[_name] ~= nil then
			local _name_1 = name
			return waitingByName[_name_1]
		end
		if elapsed >= timeout then
			return nil
		end
	end
end
--[[
	*
	* Wait for and fetch `NetworkObject` that corresponds to `name`.
	* @param objectId Corresponds to a replicated `NetworkObject`.
	* @returns `NetworkObject` that corresponds to `name`.
]]
local function WaitForNob(name)
	local gameObject = GameObject:Find(name)
	if gameObject then
		return gameObject:GetComponent("NetworkObject")
	end
	while true do
		wait()
		local _name = name
		if waitingByName[_name] ~= nil then
			local _name_1 = name
			return waitingByName[_name_1]
		end
	end
end
--[[
	*
	* Wait for and fetch `NetworkObject` that corresponds to `objectId`.
	* @param objectId Corresponds to a replicated `NetworkObject`.
	* @returns `NetworkObject` that corresponds to `objectId`.
]]
local function WaitForNobId(objectId)
	local nob = NetworkUtil:GetNetworkObject(objectId)
	if nob then
		return nob
	end
	local bin = Bin.new()
	bin:Add(NetworkObjectAdded:Connect(function(addedNob)
		if addedNob.ObjectId == objectId then
			nob = addedNob
			bin:Clean()
		end
	end))
	while true do
		wait()
		if nob then
			return nob
		end
	end
end
return {
	WaitForNobIdTimeout = WaitForNobIdTimeout,
	WaitForNobTimeout = WaitForNobTimeout,
	WaitForNob = WaitForNob,
	WaitForNobId = WaitForNobId,
	NetworkObjectAdded = NetworkObjectAdded,
	NetworkUtil = NetworkUtil,
}
-- ----------------------------------
-- ----------------------------------
