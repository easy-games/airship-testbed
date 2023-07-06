-- Compiled with unity-ts v2.1.0-75
local exports = {}
for _k, _v in require("Shared/TS/UserInput/Mouse") or {} do
	exports[_k] = _v
end
for _k, _v in require("Shared/TS/UserInput/Keyboard") or {} do
	exports[_k] = _v
end
for _k, _v in require("Shared/TS/UserInput/Touchscreen") or {} do
	exports[_k] = _v
end
for _k, _v in require("Shared/TS/UserInput/MobileJoystick") or {} do
	exports[_k] = _v
end
for _k, _v in require("Shared/TS/UserInput/Preferred") or {} do
	exports[_k] = _v
end
return exports
-- ----------------------------------
-- ----------------------------------
