-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local SoundUtil = require("Shared/TS/Util/SoundUtil").SoundUtil
local DamageIndicatorController
do
	DamageIndicatorController = setmetatable({}, {
		__tostring = function()
			return "DamageIndicatorController"
		end,
	})
	DamageIndicatorController.__index = DamageIndicatorController
	function DamageIndicatorController.new(...)
		local self = setmetatable({}, DamageIndicatorController)
		return self:constructor(...) or self
	end
	function DamageIndicatorController:constructor()
	end
	function DamageIndicatorController:OnStart()
		self.damageIndicatorObject = AssetBridge:LoadAsset("Client/Resources/Prefabs/DamageIndicator.prefab")
		ClientSignals.EntityDamage:Connect(function(event)
			local entityGO = event.entity.networkObject.gameObject
			-- Entity Damage Animation
			local _result = event.entity.anim
			if _result ~= nil then
				_result:PlayTakeDamage(event.amount, event.damageType, entityGO.transform.position, entityGO)
			end
			-- Damage taken sound
			SoundUtil:PlayAtPosition("Damage_Taken.wav", entityGO.transform.position)
			-- Indicator
			-- const indicatorGO = GameObjectBridge.InstantiateAt(
			-- this.damageIndicatorObject!,
			-- entityGO.transform.position.add(new Vector3(math.random(), 1.3, math.random())),
			-- Quaternion.identity,
			-- );
			-- const text = indicatorGO.transform.GetChild(0).GetChild(0).GetComponent<TextMeshProUGUI>();
			-- text.text = `${math.floor(event.amount)}`;
			-- const rb = indicatorGO.transform.GetComponent<Rigidbody2D>();
			-- rb.velocity.x = 10 * MathUtil.RandomSign() + math.random() * 0.2;
			-- rb.velocity.y = 40;
			-- const bin = new Bin();
			-- bin.Add(() => {
			-- GameObjectBridge.Destroy(indicatorGO);
			-- });
		end)
		ClientSignals.EntityDeath:Connect(function(event)
			-- PvP Kill
			local _result = event.fromEntity
			if _result ~= nil then
				_result = _result:IsLocalCharacter()
			end
			local _condition = _result
			if _condition then
				_condition = event.fromEntity ~= event.entity
			end
			if _condition then
				SoundUtil:PlayGlobal("Player_Kill", {
					volumeScale = 0.12,
				})
			end
			-- Local death
			if event.entity:IsLocalCharacter() then
				SoundUtil:PlayGlobal("Death", {
					volumeScale = 0.3,
				})
			end
		end)
	end
end
-- (Flamework) DamageIndicatorController metadata
Reflect.defineMetadata(DamageIndicatorController, "identifier", "Bundles/Client/Controllers/Global/Damage/DamageIndicatorController@DamageIndicatorController")
Reflect.defineMetadata(DamageIndicatorController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(DamageIndicatorController, "$:flamework@Controller", Controller, { {} })
return {
	DamageIndicatorController = DamageIndicatorController,
}
-- ----------------------------------
-- ----------------------------------
