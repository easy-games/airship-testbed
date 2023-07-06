-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
-- * Utility for fetching `CollectionManagerController` in a shared context.
local function FetchDependency()
	return Flamework.resolveDependency("Bundles/Client/Controllers/Global/CollectionManager/CollectionManagerController@CollectionManagerController")
end
return {
	FetchDependency = FetchDependency,
}
-- ----------------------------------
-- ----------------------------------
