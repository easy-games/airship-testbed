-- Compiled with unity-ts v2.1.0-75
local ChangeTeamSignal
do
	ChangeTeamSignal = setmetatable({}, {
		__tostring = function()
			return "ChangeTeamSignal"
		end,
	})
	ChangeTeamSignal.__index = ChangeTeamSignal
	function ChangeTeamSignal.new(...)
		local self = setmetatable({}, ChangeTeamSignal)
		return self:constructor(...) or self
	end
	function ChangeTeamSignal:constructor(Player, Team, OldTeam)
		self.Player = Player
		self.Team = Team
		self.OldTeam = OldTeam
	end
end
return {
	ChangeTeamSignal = ChangeTeamSignal,
}
-- ----------------------------------
-- ----------------------------------
