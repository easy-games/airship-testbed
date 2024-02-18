--!strict
type Array<Value> = {Value}
type int = number -- This is just so I have more specific types.

--[[**
	Calculates the Levenshtein distance of two strings. This function is better than most because it takes utf8 characters into account. See the Wikipedia entry for more information.
	@param [t:string] String1 The first string.
	@param [t:string] String2 The second string.
	@returns [t:integer] The distance between the two strings.
**--]]
local function Levenshtein(String1: string, String2: string): int
	if String1 == String2 then
		return 0
	end

	local Length1 = utf8.len(String1) :: number -- I apparently have to do this?
	local Length2 = utf8.len(String2) :: number

	if Length1 == 0 then
		return Length2
	elseif Length2 == 0 then
		return Length1
	end

	local Matrix = {} -- Would love to use table.create for this, but it starts at 0.
	for Index = 0, Length1 do
		Matrix[Index] = {[0] = Index}
	end

	for Index = 0, Length2 do
		Matrix[0][Index] = Index
	end

	local Index = 1
	local IndexSub1

	for _, Code1 in utf8.codes(String1) do
		local Jndex = 1
		local JndexSub1
		local PreviousArray

		for _, Code2 in utf8.codes(String2) do
			local Cost = Code1 == Code2 and 0 or 1
			IndexSub1 = Index - 1
			JndexSub1 = Jndex - 1
			PreviousArray = Matrix[IndexSub1]

			Matrix[Index][Jndex] = math.min(PreviousArray[Jndex] + 1, Matrix[Index][JndexSub1] + 1, PreviousArray[JndexSub1] + Cost)
			Jndex += 1
		end

		Index += 1
	end

	return Matrix[Length1][Length2]
end

return {
    Levenshtein = Levenshtein
}