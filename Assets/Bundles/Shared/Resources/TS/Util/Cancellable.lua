-- Compiled with unity-ts v2.1.0-75
local Cancellable
do
	Cancellable = {}
	function Cancellable:constructor()
		self.cancelled = false
	end
	function Cancellable:SetCancelled(cancelled)
		self.cancelled = cancelled
	end
	function Cancellable:IsCancelled()
		return self.cancelled
	end
end
return {
	Cancellable = Cancellable,
}
-- ----------------------------------
-- ----------------------------------
