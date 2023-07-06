-- Compiled with unity-ts v2.1.0-75
local AppManager = require("Shared/TS/Util/AppManager").AppManager
local CanvasAPI = require("Shared/TS/Util/CanvasAPI").CanvasAPI
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local SoundUtil = require("Shared/TS/Util/SoundUtil").SoundUtil
local TimeUtil = require("Shared/TS/Util/TimeUtil").TimeUtil
print("Shared.Main.ts()")
-- Force import of TimeUtil
TimeUtil:GetLifetimeSeconds()
CanvasAPI:Init()
AppManager:Init()
SoundUtil:Init()
local coreCamera = GameObject:Find("CoreCamera")
Object:Destroy(coreCamera)
if RunUtil:IsServer() then
	local server = require("Server/TS/MainServer")
	server.SetupServer()
else
	local client = require("Client/TS/MainClient")
	client.SetupClient()
end
return nil
-- ----------------------------------
-- ----------------------------------
