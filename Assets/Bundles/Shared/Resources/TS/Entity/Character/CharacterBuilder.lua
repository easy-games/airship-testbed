-- Compiled with unity-ts v2.1.0-75
local GameObjectBridge = require("Shared/TS/GameObjectBridge").GameObjectBridge
local Network = require("Shared/TS/Network").Network
local NetworkBridge = require("Shared/TS/NetworkBridge").NetworkBridge
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local baseCharacters = require("Shared/TS/Entity/Character/BaseCharacters").baseCharacters
local CharacterBuilder
do
	CharacterBuilder = setmetatable({}, {
		__tostring = function()
			return "CharacterBuilder"
		end,
	})
	CharacterBuilder.__index = CharacterBuilder
	function CharacterBuilder.new(...)
		local self = setmetatable({}, CharacterBuilder)
		return self:constructor(...) or self
	end
	function CharacterBuilder:constructor(clientId, characterGameObject, characterDef)
		self.clientId = clientId
		self.characterGameObject = characterGameObject
		self.characterDef = characterDef
	end
	function CharacterBuilder:Build()
		if not RunUtil:IsServer() then
			error("Server only API.")
		end
		-- Get character model prefab:
		local assetPath = baseCharacters[self.characterDef.BaseCharacter]
		local characterModelPrefab
		if CharacterBuilder.prefabCache[assetPath] ~= nil then
			characterModelPrefab = CharacterBuilder.prefabCache[assetPath]
		else
			characterModelPrefab = AssetBridge:LoadAsset(assetPath)
			local _prefabCache = CharacterBuilder.prefabCache
			local _characterModelPrefab = characterModelPrefab
			_prefabCache[assetPath] = _characterModelPrefab
		end
		local existingCharacterModel = self.characterGameObject.transform:Find("CharacterModel")
		if existingCharacterModel then
			Object:Destroy(existingCharacterModel)
		end
		-- Instantiate character model into root character game object:
		local characterModel = GameObjectBridge:InstantiateIn(characterModelPrefab, self.characterGameObject.transform)
		characterModel.transform.name = "Character"
		local _position = characterModel.transform.position
		local _vector3 = Vector3.new(0, -1.08, 0)
		characterModel.transform.position = _position + _vector3
		-- this.AddAttachment({
		-- bone: HumanBodyBones.RightHand,
		-- asset: "Shared/Resources/Prefabs/Items/DevSword.prefab",
		-- });
		if self.clientId ~= nil then
			NetworkBridge:SpawnWithClientOwnership(characterModel, self.clientId)
			local nob = characterModel:GetComponent("NetworkObject")
			Network.ServerToClient.CharacterModelChanged.Server:FireClient(self.clientId, nob.ObjectId)
		else
			NetworkBridge:Spawn(characterModel)
		end
	end
	function CharacterBuilder:AddAttachment(bodyAttachment)
		local prefab = AssetBridge:LoadAsset(bodyAttachment.asset)
		local boneTransform = self.characterGameObject.transform:Find("CharacterModel/Character/character_rig/master_bone/lower_torso_bone/upper_torso_bone/upper_arm_bone.R/lower_arm_bone.R/hand_bone.R")
		-- print("bone transform: " + boneTransform.name);
		local go = Object:Instantiate(prefab, boneTransform)
	end
	CharacterBuilder.prefabCache = {}
end
return {
	CharacterBuilder = CharacterBuilder,
}
-- ----------------------------------
-- ----------------------------------
