-- Compiled with unity-ts v2.1.0-75
local ReferenceManagerAssets = require("Shared/TS/Util/ReferenceManagerResources").ReferenceManagerAssets
local BundleReferenceManager
do
	BundleReferenceManager = setmetatable({}, {
		__tostring = function()
			return "BundleReferenceManager"
		end,
	})
	BundleReferenceManager.__index = BundleReferenceManager
	function BundleReferenceManager.new(...)
		local self = setmetatable({}, BundleReferenceManager)
		return self:constructor(...) or self
	end
	function BundleReferenceManager:constructor()
	end
	function BundleReferenceManager:LoadResources(groupId, bundleIndex)
		if bundleIndex == nil then
			bundleIndex = 0
		end
		local _bundleGroups = ReferenceManagerAssets.bundleGroups
		local _groupId = groupId
		local bundleGroup = _bundleGroups[_groupId]
		if bundleGroup == nil then
			return {}
		end
		local _fn = self
		local _bundles = bundleGroup.bundles
		local _bundleIndex = bundleIndex
		return _fn:LoadResourcesFromBundle(_bundles[_bundleIndex])
	end
	function BundleReferenceManager:LoadResource(groupId, bundleIndex, itemKey)
		local _bundleGroups = ReferenceManagerAssets.bundleGroups
		local _groupId = groupId
		local bundleGroup = _bundleGroups[_groupId]
		if bundleGroup == nil then
			return nil
		end
		local _fn = self
		local _bundles = bundleGroup.bundles
		local _bundleIndex = bundleIndex
		return _fn:LoadResourceFromBundle(_bundles[_bundleIndex], itemKey)
	end
	function BundleReferenceManager:LoadResourcesFromBundle(group)
		local _fn = self
		local _result = group
		if _result ~= nil then
			_result = _result.filePaths
		end
		return _fn:LoadResourcesFromMap(_result)
	end
	function BundleReferenceManager:LoadResourceFromBundle(group, itemKey)
		local _fn = self
		local _result = group
		if _result ~= nil then
			_result = _result.filePaths
		end
		return _fn:LoadResourceFromMap(_result, itemKey)
	end
	function BundleReferenceManager:LoadResourcesFromMap(filePaths)
		if not filePaths or next(filePaths) == nil then
			error("Trying to load resources from empty map in ReferenceManager.ts")
			return {}
		end
		local loadedResources = {}
		local _filePaths = filePaths
		local _arg0 = function(filePath, index)
			if filePath == "" then
				loadedResources[index + 1] = nil
			else
				loadedResources[index + 1] = AssetBridge:LoadAsset(filePath)
			end
		end
		for _k, _v in _filePaths do
			_arg0(_v, _k, _filePaths)
		end
		return loadedResources
	end
	function BundleReferenceManager:LoadResourceFromMap(filePaths, itemKey)
		if not filePaths then
			return nil
		end
		local _filePaths = filePaths
		local _itemKey = itemKey
		local path = _filePaths[_itemKey]
		return AssetBridge:LoadAsset(if path ~= "" and path then path else "")
	end
end
return {
	BundleReferenceManager = BundleReferenceManager,
}
-- ----------------------------------
-- ----------------------------------
