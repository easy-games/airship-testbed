-- Compiled with unity-ts v2.1.0-75
-- * Describes a match state.
local MatchState
do
	local _inverse = {}
	MatchState = setmetatable({}, {
		__index = _inverse,
	})
	MatchState.SETUP = 0
	_inverse[0] = "SETUP"
	MatchState.PRE = 1
	_inverse[1] = "PRE"
	MatchState.RUNNING = 2
	_inverse[2] = "RUNNING"
	MatchState.POST = 3
	_inverse[3] = "POST"
end
return {
	MatchState = MatchState,
}
-- ----------------------------------
-- ----------------------------------
