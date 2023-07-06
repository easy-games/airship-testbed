-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
-- * Utility for fetching `CollectionManagerService` in a shared context.
local function FetchDependency()
	return Flamework.resolveDependency("Bundles/Server/Services/Global/CollectionManager/CollectionManagerService@CollectionManagerService")
end
return {
	FetchDependency = FetchDependency,
}
-- ----------------------------------
-- ----------------------------------
