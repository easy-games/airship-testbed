-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
print("CoreShared.Main.ts()")
if RunCore:IsClient() then
	TS.Promise.new(function(resolve)
		resolve(require("CoreClient/TS/Main"))
	end)
end
return nil
-- ----------------------------------
-- ----------------------------------
