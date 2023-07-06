-- Compiled with unity-ts v2.1.0-75
local StringUtils = require("Shared/TS/Util/StringUtil")
local Task = require("Shared/TS/Util/Task").Task
local MAX_DISTANCE = 18
local SoundUtil
do
	SoundUtil = setmetatable({}, {
		__tostring = function()
			return "SoundUtil"
		end,
	})
	SoundUtil.__index = SoundUtil
	function SoundUtil.new(...)
		local self = setmetatable({}, SoundUtil)
		return self:constructor(...) or self
	end
	function SoundUtil:constructor()
	end
	function SoundUtil:Init()
		self.globalSource = GameObject:Find("SoundUtil"):GetComponent("AudioSource")
	end
	function SoundUtil:PlayGlobal(sound, config)
		local clip = self:LoadAudioClip(sound)
		if not clip then
			error("Failed to find sound: " .. sound)
			return nil
		end
		local _fn = self.globalSource
		local _result = config
		if _result ~= nil then
			_result = _result.volumeScale
		end
		local _condition = _result
		if _condition == nil then
			_condition = 1
		end
		_fn:PlayOneShot(clip, _condition)
	end
	function SoundUtil:PlayAtPosition(sound, position, config)
		local audioSource = self:GetAudioSource(position)
		audioSource.maxDistance = MAX_DISTANCE
		audioSource.rolloffMode = 1
		local clip = self:LoadAudioClip(sound)
		if not clip then
			error("Failed to find sound: " .. sound)
			return nil
		end
		local _fn = audioSource
		local _result = config
		if _result ~= nil then
			_result = _result.volumeScale
		end
		local _condition = _result
		if _condition == nil then
			_condition = 1
		end
		_fn:PlayOneShot(clip, _condition)
		Task:Delay(clip.length + 1, function()
			Object:Destroy(audioSource)
		end)
	end
	function SoundUtil:GetAudioSource(position)
		local go = GameObject:CreateAtPos(position)
		local audioSource = go:AddComponent("AudioSource")
		audioSource.spatialBlend = 1
		return audioSource
	end
	function SoundUtil:FriendlyPath(s)
		if not StringUtils.includes(s, ".") then
			s ..= ".ogg"
		end
		return s
	end
	function SoundUtil:LoadAudioClip(sound)
		return AssetBridge:LoadAssetIfExists("Shared/Resources/Sound/" .. self:FriendlyPath(sound))
	end
end
return {
	SoundUtil = SoundUtil,
}
-- ----------------------------------
-- ----------------------------------
