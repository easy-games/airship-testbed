--[[** Sources

    Jaro similarity implementation from http://rosettacode.org/wiki/Jaro_similarity#Python 
    Jaro winkler implementation from https://www.geeksforgeeks.org/jaro-and-jaro-winkler-similarity/ 
    Config implementation from https://github.com/ogus/jaro-winkler/blob/master/src/jaro-winkler.js
**]]

export type defaultConfigType = {
    caseSensitive: boolean?,
    scalingFactor: number?,
    prefixLength: number?
}

local defaultConfig: defaultConfigType = {
    caseSensitive = false,
    scalingFactor = 0.1,
    prefixLength  = 4
}

local function copyShallow(t)
    local newTable = {}
    for i, v in pairs(t) do 
        newTable[i] = v 
    end
    return newTable
end

--//Filter input
local function setConfig(inputConfig) 
    local config = copyShallow(defaultConfig)
    if inputConfig ~= nil and typeof(inputConfig) == "table" then
        for Key, Value in pairs(config) do
            if inputConfig[Key] ~= nil and typeof(inputConfig[Key]) == typeof(config[Key]) then
                config[Key] = inputConfig[Key]
            end
        end
        config.scalingFactor = math.min(config.scalingFactor, 0.25);
    end
    return config
end

--//Calculate Jaro Similarity
local function JaroSimilarity(s: string, t: string, inputConfig: defaultConfigType?): number
    local config = setConfig(inputConfig)
    if not config.caseSensitive then
        s = string.lower(s)
        t = string.lower(t)
    end
    local s_len = string.len(s)
    local t_len = string.len(t)
    if (s_len == 0 and t_len == 0) or (s == t) then
        return 1
    end
    local match_distance = (math.floor(math.max(s_len, t_len) / 2)) - 1
    local s_matches = {}
    local t_matches = {}
    local matches = 0
    local transpositions = 0
    for i = 1, s_len do
        local _start = math.max(1, i - match_distance)
        local _end = math.min(i + match_distance + 1, t_len)
        for j = _start, _end do
            if t_matches[j] then
                break
            end
            if string.sub(s, i, i) == string.sub(t, j, j) then
                s_matches[i] = true
                t_matches[j] = true
                matches = matches + 1
                break
            end
        end
    end
    if matches == 0 then
        return 0
    end
    local k = 1
    for i = 1, s_len do
        if not s_matches[i] then
            break
        end
        while t_matches[k] == false do
            k = k + 1
        end
        if string.sub(s, i, i) ~= string.sub(t, k, k) then
            transpositions = transpositions + 1
        end
        k = k + 1
    end
    local similarity = ((matches / s_len) + (matches / t_len) + ((matches - transpositions / 2) / matches)) / 3
    return similarity
end

--//Calculate Jaro Distance
local function JaroDistance(s: string, t: string, inputConfig: defaultConfigType?): number
    return 1 - JaroSimilarity(s, t, inputConfig)
end

--//Calculate Jaro winkler
local function JaroWinkler(s: string, t: string, inputConfig: defaultConfigType?): number
    local config = setConfig(inputConfig)
    local jaro_dist = JaroSimilarity(s, t, config)
    if jaro_dist > 0.7 then
        local prefix = 0
        for i = 1, math.min(string.len(s), string.len(t)) do
            if string.sub(s, i, i) == string.sub(t, i, i) then
                prefix = prefix + 1
            else 
                break
            end
        end
        prefix = math.min(config.prefixLength, prefix);
        jaro_dist = jaro_dist + config.scalingFactor * prefix * (1 - jaro_dist);
    end
    return jaro_dist;
end

return {
    JaroSimilarity = JaroSimilarity,
    JaroDistance = JaroDistance,
    JaroWinkler = JaroWinkler,
}


