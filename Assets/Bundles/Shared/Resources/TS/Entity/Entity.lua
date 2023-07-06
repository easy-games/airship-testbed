-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local GetItemMeta = require("Shared/TS/Item/ItemDefinitions").GetItemMeta
local Network = require("Shared/TS/Network").Network
local NetworkBridge = require("Shared/TS/NetworkBridge").NetworkBridge
local Projectile = require("Shared/TS/Projectile/Projectile").Projectile
local ProjectileUtil = require("Shared/TS/Projectile/ProjectileUtil").ProjectileUtil
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local Signal = require("Shared/TS/Util/Signal").Signal
local TimeUtil = require("Shared/TS/Util/TimeUtil").TimeUtil
local Bin = require("Shared/TS/Util/Bin").Bin
local OnLateUpdate = require("Shared/TS/Util/Timer").OnLateUpdate
local InventoryEntityAnimator = require("Shared/TS/Entity/Animation/InventoryEntityAnimator").InventoryEntityAnimator
local EntitySerializer = require("Shared/TS/Entity/EntitySerializer").EntitySerializer
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local EntityReferences
do
	EntityReferences = setmetatable({}, {
		__tostring = function()
			return "EntityReferences"
		end,
	})
	EntityReferences.__index = EntityReferences
	function EntityReferences.new(...)
		local self = setmetatable({}, EntityReferences)
		return self:constructor(...) or self
	end
	function EntityReferences:constructor(ref)
		local boneKey = "Bones"
		local meshKey = "Meshes"
		local colliderKey = "Colliders"
		local vfxKey = "VFX"
		-- Get the meshes
		local meshesCS = ref:GetAllValues(meshKey)
		self.meshes = table.create(meshesCS.Length)
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < meshesCS.Length) then
					break
				end
				self.meshes[i + 1] = meshesCS:GetValue(i)
			end
		end
		self.fpsMesh = ref:GetValue(meshKey, "FirstPerson")
		-- Get the bones
		self.neckBone = ref:GetValue(boneKey, "Neck")
		self.spineBone3 = ref:GetValue(boneKey, "Spine3")
		self.spineBone2 = ref:GetValue(boneKey, "Spine2")
		self.spineBone1 = ref:GetValue(boneKey, "Spine1")
		self.headBone = ref:GetValue(boneKey, "Head")
		self.root = ref:GetValue(boneKey, "Root")
		self.characterCollider = ref:GetValue(colliderKey, "CharacterController")
		self.animationEvents = ref:GetValue(vfxKey, "AnimationEvents")
	end
end
local Entity
do
	Entity = setmetatable({}, {
		__tostring = function()
			return "Entity"
		end,
	})
	Entity.__index = Entity
	function Entity.new(...)
		local self = setmetatable({}, Entity)
		return self:constructor(...) or self
	end
	function Entity:constructor(id, networkObject, clientId)
		self.health = 100
		self.maxHealth = 100
		self.dead = false
		self.destroyed = false
		self.OnHealthChanged = Signal.new()
		self.OnDespawn = Signal.new()
		self.OnPlayerChanged = Signal.new()
		self.id = id
		self.gameObject = networkObject.gameObject
		self.references = EntityReferences.new(self.gameObject:GetComponent("GameObjectReferences"))
		self.model = self.references.root.gameObject
		self.networkObject = networkObject
		self.anim = InventoryEntityAnimator.new(self, self.model:GetComponent("AnimancerComponent"), self.references)
		self.attributes = self.gameObject:GetComponent("EasyAttributes")
		self.accessoryBuilder = self.gameObject:GetComponent("AccessoryBuilder")
		self.dynamicVariables = self.gameObject:GetComponent("DynamicVariables")
		self.ClientId = clientId
		if self.ClientId ~= nil then
			if RunUtil:IsServer() then
				local player = (Flamework.resolveDependency("Bundles/Server/Services/Global/Player/PlayerService@PlayerService")):GetPlayerFromClientId(self.ClientId)
				self:SetPlayer(player)
			else
				local player = (Flamework.resolveDependency("Bundles/Client/Controllers/Global/Player/PlayerController@PlayerController")):GetPlayerFromClientId(self.ClientId)
				if player then
					print("Found Player that controls this entity. (Player=" .. (player.username .. (", Entity=" .. (tostring(self.id) .. ")"))))
				else
					print("Entity is not controlled by any player. (Entity=" .. (tostring(self.id) .. ")"))
				end
				self:SetPlayer(player)
			end
		end
		self.bin = Bin.new()
		self.bin:Connect(OnLateUpdate, function()
			return self:LateUpdate()
		end)
	end
	function Entity:LateUpdate()
		local _result = self.anim
		if _result ~= nil then
			_result:LateUpdate()
		end
	end
	function Entity:SetPlayer(player)
		local oldPlayer = self.player
		self.player = player
		self.OnPlayerChanged:Fire(player, oldPlayer)
	end
	function Entity:GetHealth()
		return self.health
	end
	function Entity:GetMaxHealth()
		return self.maxHealth
	end
	function Entity:GetEntityDriver()
		return self.gameObject:GetComponent("EntityDriver")
	end
	function Entity:SetHealth(health)
		health = math.clamp(health, 0, self.maxHealth)
		if health == self.health then
			return nil
		end
		local oldHealth = self.health
		self.health = health
		self.OnHealthChanged:Fire(health, oldHealth)
		if RunUtil:IsServer() then
			Network.ServerToClient.Entity.SetHealth.Server:FireAllClients(self.id, self.health)
		end
	end
	function Entity:SetMaxHealth(maxHealth)
		self.maxHealth = maxHealth
	end
	function Entity:Destroy()
		self.bin:Clean()
		self.OnDespawn:Fire()
		self.destroyed = true
		self.anim = nil
		if RunUtil:IsServer() then
			Network.ServerToClient.DespawnEntity.Server:FireAllClients(self.id)
			NetworkBridge:Despawn(self.networkObject.gameObject)
		end
	end
	function Entity:IsDestroyed()
		return self.destroyed
	end
	function Entity:Encode()
		return {
			serializer = EntitySerializer.DEFAULT,
			id = self.id,
			clientId = self.ClientId,
			gameObjectId = self.networkObject.ObjectId,
			health = self.health,
			maxHealth = self.maxHealth,
		}
	end
	function Entity:IsPlayerOwned()
		return self.ClientId ~= nil
	end
	function Entity:IsLocalCharacter()
		return RunUtil:IsClient() and self.ClientId == (Flamework.resolveDependency("Bundles/Client/Controllers/Global/Player/PlayerController@PlayerController")).LocalConnection.ClientId
	end
	function Entity:IsAlive()
		return true
	end
	function Entity:FindById(id)
		if RunUtil:IsServer() then
			return (Flamework.resolveDependency("Bundles/Server/Services/Global/Entity/EntityService@EntityService")):GetEntityById(id)
		else
			return (Flamework.resolveDependency("Bundles/Client/Controllers/Global/Entity/EntityController@EntityController")):GetEntityById(id)
		end
	end
	function Entity:FindByClientId(id)
		if RunUtil:IsServer() then
			return (Flamework.resolveDependency("Bundles/Server/Services/Global/Entity/EntityService@EntityService")):GetEntityByClientId(id)
		else
			return (Flamework.resolveDependency("Bundles/Client/Controllers/Global/Entity/EntityController@EntityController")):GetEntityByClientId(id)
		end
	end
	function Entity:FindByCollider(collider)
		local nb = collider.gameObject:GetComponent("NetworkBehaviour")
		if nb ~= nil then
			local split = string.split(nb.name, "_")
			if #split > 0 then
				local entityId = tonumber(split[2])
				if entityId ~= nil then
					return Entity:FindById(entityId)
				end
			end
		end
		return nil
	end
	function Entity:FindByGameObject(gameObject)
		local split = string.split(gameObject.name, "_")
		if #split > 0 then
			local id = tonumber(split[2])
			if id ~= nil then
				return Entity:FindById(id)
			end
		end
		return nil
	end
	function Entity:SendItemAnimationToClients(useIndex, animationMode, exceptClientId)
		if useIndex == nil then
			useIndex = 0
		end
		if animationMode == nil then
			animationMode = 0
		end
		if RunUtil:IsServer() then
			if exceptClientId ~= nil then
				Network.ServerToClient.PlayEntityItemAnimation.Server:FireExcept(exceptClientId, self.id, useIndex, animationMode)
			else
				Network.ServerToClient.PlayEntityItemAnimation.Server:FireAllClients(self.id, useIndex, animationMode)
			end
		else
			error("Trying to send server event (Item Animation) from client")
		end
	end
	function Entity:HasImmunity()
		local immuneUntilTime = self.attributes:GetNumber("immunity")
		if immuneUntilTime ~= nil then
			return TimeUtil:GetServerTime() < immuneUntilTime
		end
		return false
	end
	function Entity:GetLastDamagedTime()
		local _condition = self.attributes:GetNumber("last_damaged")
		if _condition == nil then
			_condition = 0
		end
		return _condition
	end
	function Entity:TimeSinceLastDamaged()
		return Time.time - self:GetLastDamagedTime()
	end
	function Entity:SetLastDamagedTime(time)
		self.attributes:SetAttribute("last_damaged", time)
	end
	function Entity:GrantImmunity(duration)
		local newTime = TimeUtil:GetServerTime() + duration
		local currentTime = self.attributes:GetNumber("immunity")
		if currentTime ~= nil and currentTime > newTime then
			return nil
		end
		self.attributes:SetAttribute("immunity", newTime)
	end
	function Entity:GetState()
		return self:GetEntityDriver():GetState()
	end
	function Entity:GetHeadPosition()
		local state = self:GetState()
		local offset = Vector3.new(0, 1.5, 0)
		if state == 5 then
			offset = Vector3.new(0, 1, 0)
		elseif state == 4 then
			offset = Vector3.new(0, 0.8, 0)
		end
		local _position = self.model.transform.position
		local _offset = offset
		return _position + _offset
	end
	function Entity:GetMiddlePosition()
		local _position = self.model.transform.position
		local _vector3 = Vector3.new(0, 1.5, 0)
		return _position + _vector3
	end
	function Entity:LocalOffsetToWorldPoint(localOffset)
		local worldDir = self.model.transform:TransformDirection(localOffset)
		local worldPoint = self:GetMiddlePosition() + worldDir
		return worldPoint
	end
	function Entity:GetDisplayName()
		if self.player then
			return self.player.username
		end
		return "entity_" .. tostring(self.id)
	end
	function Entity:Kill()
		if self.dead then
			return nil
		end
		self.dead = true
	end
	function Entity:IsDead()
		return self.dead
	end
	function Entity:GetBlockBelowMeta()
		return WorldAPI:GetMainWorld():GetBlockBelowMeta(self.model.transform.position)
	end
	function Entity:GetAccessoryGameObjects(slot)
		return self:PushToArray(self.accessoryBuilder:GetAccessories(slot))
	end
	function Entity:GetAccessoryMeshes(slot)
		return self:PushToArray(self.accessoryBuilder:GetAccessoryMeshes(slot))
	end
	function Entity:PushToArray(array)
		local results = {}
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < array.Length) then
					break
				end
				local _results = results
				local _arg0 = array:GetValue(i)
				table.insert(_results, _arg0)
			end
		end
		return results
	end
	function Entity:LaunchProjectile(itemType, velocity)
		local itemMeta = GetItemMeta(itemType)
		if not itemMeta.Ammo then
			return error("Tried to launch item that wasn't a projectile: " .. itemType)
		end
		local firstPerson = false
		if self:IsLocalCharacter() then
			firstPerson = (Flamework.resolveDependency("Bundles/Client/Controllers/Global/Character/LocalEntityController@LocalEntityController")):IsFirstPerson()
		end
		local launchPos = ProjectileUtil:GetLaunchPosition(self, firstPerson)
		local projectilePath = "Shared/Resources/Prefabs/Projectiles/Ammo/" .. (itemType .. ".prefab")
		local projectileLauncher = self.gameObject:GetComponent("ProjectileLauncher")
		local easyProjectile = projectileLauncher:ClientFire(projectilePath, itemMeta.ID, launchPos, velocity, itemMeta.Ammo.gravity, 0)
		local projectile = Projectile.new(easyProjectile, itemType, self)
		if RunUtil:IsClient() then
			local clientSignals = TS.Promise.new(function(resolve)
				resolve(require("Client/TS/ClientSignals"))
			end):expect().ClientSignals
			local ProjectileLaunchedClientSignal = TS.Promise.new(function(resolve)
				resolve(require("Client/TS/Controllers/Global/Damage/Projectile/ProjectileLaunchedClientSignal"))
			end):expect().ProjectileLaunchedClientSignal
			clientSignals.ProjectileLaunched:Fire(ProjectileLaunchedClientSignal.new(projectile))
		end
	end
end
return {
	EntityReferences = EntityReferences,
	Entity = Entity,
}
-- ----------------------------------
-- ----------------------------------
