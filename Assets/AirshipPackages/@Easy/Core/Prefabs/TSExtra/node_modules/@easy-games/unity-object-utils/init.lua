local ObjectUtils = {}

function ObjectUtils.keys(object)
	local result = table.create(#object)
	for key in pairs(object) do
		result[#result + 1] = key
	end
	return result
end

function ObjectUtils.values(object)
	local result = table.create(#object)
	for _, value in pairs(object) do
		result[#result + 1] = value
	end
	return result
end

function ObjectUtils.entries(object)
	local result = table.create(#object)
	for key, value in pairs(object) do
		result[#result + 1] = { key, value }
	end
	return result
end

function ObjectUtils.assign(toObj, ...)
	for i = 1, select("#", ...) do
		local arg = select(i, ...)
		if type(arg) == "table" then
			for key, value in pairs(arg) do
				toObj[key] = value
			end
		end
	end
	return toObj
end

function ObjectUtils.copy(object)
	local result = table.create(#object)
	for k, v in pairs(object) do
		result[k] = v
	end
	return result
end

local function deepCopyHelper(object, encountered)
	local result = table.create(#object)
	encountered[object] = result

	for k, v in pairs(object) do
		if type(k) == "table" then
			k = encountered[k] or deepCopyHelper(k, encountered)
		end

		if type(v) == "table" then
			v = encountered[v] or deepCopyHelper(v, encountered)
		end

		result[k] = v
	end

	return result
end

function ObjectUtils.deepCopy(object)
	return deepCopyHelper(object, {})
end

function ObjectUtils.deepEquals(a, b)
	-- a[k] == b[k]
	for k in pairs(a) do
		local av = a[k]
		local bv = b[k]
		if type(av) == "table" and type(bv) == "table" then
			local result = Object.deepEquals(av, bv)
			if not result then
				return false
			end
		elseif av ~= bv then
			return false
		end
	end

	-- extra keys in b
	for k in pairs(b) do
		if a[k] == nil then
			return false
		end
	end

	return true
end

function ObjectUtils.toString(data)
	return tostring(data)
end

function ObjectUtils.isEmpty(object)
	return next(object) == nil
end

function ObjectUtils.fromEntries(entries)
	local entriesLen = #entries

	local result = table.create(entriesLen)
	if entries then
		for i = 1, entriesLen do
			local pair = entries[i]
			result[pair[1]] = pair[2]
		end
	end
	return result
end

return ObjectUtils
