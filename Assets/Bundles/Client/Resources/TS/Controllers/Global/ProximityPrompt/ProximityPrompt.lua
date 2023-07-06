-- Compiled with unity-ts v2.1.0-75
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local GameObjectBridge = require("Shared/TS/GameObjectBridge").GameObjectBridge
local Signal = require("Shared/TS/Util/Signal").Signal
-- * Proximity Prompt.
local ProximityPrompt
do
	ProximityPrompt = setmetatable({}, {
		__tostring = function()
			return "ProximityPrompt"
		end,
	})
	ProximityPrompt.__index = ProximityPrompt
	function ProximityPrompt.new(...)
		local self = setmetatable({}, ProximityPrompt)
		return self:constructor(...) or self
	end
	function ProximityPrompt:constructor(promptData)
		self.OnActivated = Signal.new()
		self.promptPrefab = AssetBridge:LoadAsset("Client/Resources/Prefabs/ProximityPrompt.prefab")
		local _original = ProximityPrompt.idCounter
		ProximityPrompt.idCounter += 1
		self.id = tostring(_original)
		self.data = promptData
		self:CreatePrompt()
	end
	function ProximityPrompt:CreatePrompt()
		self.promptGameObject = GameObjectBridge:InstantiateAt(self.promptPrefab, self.data.promptPosition, Quaternion.identity)
		-- Prompt starts inactive.
		self.promptGameObject:SetActive(false)
		-- Set activation key, action, and object text.
		local keyCode = self.promptGameObject.transform:Find("Canvas/Background/KeyCodeBackground/KeyCode"):GetComponent("TextMeshProUGUI")
		local textWrapper = self.promptGameObject.transform:Find("Canvas/Background/TextWrapper")
		local bottomText = textWrapper:FindChild("BottomText"):GetComponent("TextMeshProUGUI")
		local topText = textWrapper:FindChild("TopText"):GetComponent("TextMeshProUGUI")
		keyCode.text = self.data.activationKeyString
		bottomText.text = self.data.bottomText
		topText.text = self.data.topText
		-- Notify `ProximityPromptController` that prompt was created.
		ClientSignals.ProximityPromptCreated:Fire({
			prompt = self,
		})
	end
	function ProximityPrompt:ActivatePrompt()
		self.OnActivated:Fire()
	end
	ProximityPrompt.idCounter = 0
end
return {
	ProximityPrompt = ProximityPrompt,
}
-- ----------------------------------
-- ----------------------------------
