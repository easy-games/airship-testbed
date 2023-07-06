-- Compiled with unity-ts v2.1.0-75
local WaitFrame = require("Shared/TS/Util/TimeUtil").WaitFrame
local function TestWait()
	print("beginning test...")
	while true do
		print("wait")
		-- wait();
		WaitFrame()
	end
end
return {
	TestWait = TestWait,
}
-- ----------------------------------
-- ----------------------------------
