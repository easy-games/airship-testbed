local StringUtils = {}

function StringUtils.trim(str)
	local from = string.match(str, "^%s*()")
	return from > #str and "" or string.match(str, ".*%S", from)  -- there is no escaping 2n complexity, but we can prevent n^2
end

function StringUtils.trimStart(str)
	local from = string.match(str, "^%s*()")
	return from > #str and "" or string.sub(str, from)
end

function StringUtils.trimEnd(str)
	local _, from = string.find(str, "^%s*") -- checking this prevents quadratic backtracking
	return from == #str and "" or string.match(str, ".*%S") -- there is no escaping 2n/3n complexity, but we can prevent n^2
end

-- https://github.com/tc39/proposal-string-pad-start-end/blob/master/polyfill.js
local function getPadding(str, maxLength, fillString)
	local stringLength = #str
	if maxLength <= stringLength then return str end
	local filler = fillString == nil and " " or fillString
	if filler == "" then return str end
	local fillLen = maxLength - stringLength
	while #filler < fillLen do
		local fLen = #filler
		local remainingCodeUnits = fillLen - fLen
		if fLen > remainingCodeUnits then
			filler = filler .. string.sub(filler, 1, remainingCodeUnits)
		else
			filler = filler .. filler
		end
	end
	return string.sub(filler, 1, fillLen)
end

function StringUtils.padStart(str, maxLength, fillString)
	return getPadding(str, maxLength, fillString) .. str
end

function StringUtils.padEnd(str, maxLength, fillString)
	return str .. getPadding(str, maxLength, fillString)
end

function StringUtils.slice(str, i, j)
	if j ~= nil and j < 0 then j = j - 1 end
	return string.sub(str, i + 1, j)
end

function StringUtils.indexOf(str, searchElement, fromIndex)
	return (string.find(str, searchElement, (fromIndex or 0) + 1, true) or 0) - 1
end

function StringUtils.includes(str, searchElement, fromIndex)
	return string.find(str, searchElement, (fromIndex or 0) + 1, true) ~= nil
end

function StringUtils.startsWith(str1, str2, pos)
	local n1 = #str1
	local n2 = #str2

	if pos == nil or pos ~= pos then
		pos = 0
	else
		pos = math.clamp(pos, 0, n1)
	end

	local last = pos + n2
	return last <= n1 and string.sub(str1, pos + 1, last) == str2
end

function StringUtils.endsWith(str1, str2, pos)
	local n1 = #str1
	local n2 = #str2

	if pos == nil then
		pos = n1
	elseif pos ~= pos then
		pos = 0
	else
		pos = math.clamp(pos, 0, n1)
	end

	local start = pos - n2 + 1
	return start > 0 and string.sub(str1, start, pos) == str2
end

function StringUtils.ncifyVariableName(name: string): string
	if string.find(name, "^_", 1) ~= nil then
		name = string.sub(name, 2)
	elseif string.find(name, "^k", 1) ~= nil then
		name = string.sub(name, 2)
	elseif string.find(name, "^m_", 1) ~= nil then
		name = string.sub(name, 3)
	end

	local newStr = ""
	for i = 1, #name do
		local char = string.sub(name, i, i)
		if i == 1 then
			newStr ..= string.upper(char)
		elseif string.upper(char) == char then
			newStr ..= " " .. char
		else
			newStr ..= char
		end
	end
	return newStr
end

return StringUtils