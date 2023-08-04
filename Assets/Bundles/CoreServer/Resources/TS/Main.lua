-- Compiled with unity-ts v2.1.0
print("CoreServer.Main.ts()")
local autoShutdownBridgeGO = GameObject:Find("AutoShutdownBridge")
if autoShutdownBridgeGO then
	local autoShutdownBridge = autoShutdownBridgeGO:GetComponent("AutoShutdownBridge")
	if autoShutdownBridge then
		autoShutdownBridge:SetBundlesLoaded(true)
	end
end
return nil
-- ----------------------------------
-- ----------------------------------
