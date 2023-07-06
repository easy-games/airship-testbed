-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local Keyboard = require("Shared/TS/UserInput/init").Keyboard
local ColorUtil = require("Shared/TS/Util/ColorUtil").ColorUtil
local TabListController
do
	TabListController = setmetatable({}, {
		__tostring = function()
			return "TabListController"
		end,
	})
	TabListController.__index = TabListController
	function TabListController.new(...)
		local self = setmetatable({}, TabListController)
		return self:constructor(...) or self
	end
	function TabListController:constructor(playerController)
		self.playerController = playerController
		self.tablistGO = GameObject:Find("TabList")
		self.tablistCanvas = self.tablistGO:GetComponent("Canvas")
		self.tablistRefs = self.tablistGO:GetComponent("GameObjectReferences")
		self.tablistContentGO = self.tablistRefs:GetValue("UI", "Content")
		self.tablistEntryPrefab = self.tablistRefs:GetValue("UI", "TabListEntry")
		self.cellsPerRow = 4
		self.rowCount = 13
		self.maxSlots = self.cellsPerRow * self.rowCount
		self.shown = false
		self:Hide(true)
	end
	function TabListController:OnStart()
		self:FullUpdate()
		ClientSignals.PlayerJoin:Connect(function(player)
			self:FullUpdate()
		end)
		ClientSignals.PlayerLeave:Connect(function(player)
			self:FullUpdate()
		end)
		ClientSignals.PlayerChangeTeam:Connect(function(event)
			self:FullUpdate()
		end)
		local keyboard = Keyboard.new()
		keyboard.KeyDown:Connect(function(e)
			if e.Key == 3 and not keyboard:IsEitherKeyDown(53, 57) then
				self:Show()
			end
		end)
		keyboard.KeyUp:Connect(function(e)
			if e.Key == 3 then
				self:Hide()
			end
		end)
		-- Prevent window from staying open once tabbed out.
		-- SetInterval(0.1, () => {
		-- if (this.IsShown() && !Application.isFocused) {
		-- this.Hide();
		-- }
		-- });
		-- Application.OnFocusChanged((focused) => {
		-- if (!focused) {
		-- this.Hide();
		-- }
		-- });
	end
	function TabListController:FullUpdate()
		local players = self.playerController:GetPlayers()
		local contentChildCount = self.tablistContentGO.transform.childCount
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < self.maxSlots) then
					break
				end
				local player
				if i < #players then
					player = players[i + 1]
				end
				local entry
				if player then
					if i < contentChildCount then
						entry = self.tablistContentGO.transform:GetChild(i).gameObject
					else
						entry = Object:Instantiate(self.tablistEntryPrefab, self.tablistContentGO.transform)
					end
				end
				if player and entry then
					self:UpdateEntry(entry, player)
				elseif entry then
					Object:Destroy(entry)
				end
			end
		end
	end
	function TabListController:UpdateEntry(entry, player)
		local refs = entry:GetComponent("GameObjectReferences")
		local usernameText = refs:GetValue("UI", "Username")
		local username = player.username
		local team = player:GetTeam()
		if team then
			local hex = ColorUtil:ColorToHex(team.color)
			username = "<color=" .. (hex .. (">" .. (username .. "</color>")))
		end
		usernameText.text = username
	end
	function TabListController:Show()
		if self.shown then
			return nil
		end
		self.shown = true
		self.tablistCanvas.enabled = true
	end
	function TabListController:Hide(force)
		if force == nil then
			force = false
		end
		if not force then
			if not self.shown then
				return nil
			end
		end
		self.shown = false
		self.tablistCanvas.enabled = false
	end
	function TabListController:IsShown()
		return self.shown
	end
end
-- (Flamework) TabListController metadata
Reflect.defineMetadata(TabListController, "identifier", "Bundles/Client/Controllers/Global/TabList/TabListController@TabListController")
Reflect.defineMetadata(TabListController, "flamework:parameters", { "Bundles/Client/Controllers/Global/Player/PlayerController@PlayerController" })
Reflect.defineMetadata(TabListController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(TabListController, "$:flamework@Controller", Controller, { {} })
return {
	TabListController = TabListController,
}
-- ----------------------------------
-- ----------------------------------
