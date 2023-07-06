-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local Network = require("Shared/TS/Network").Network
local ColorUtil = require("Shared/TS/Util/ColorUtil").ColorUtil
local StringUtils = require("Shared/TS/Util/StringUtil")
local AddInventoryCommand = require("Server/TS/Services/Global/Chat/Commands/AddInventoryCommand").AddInventoryCommand
local DamageCommand = require("Server/TS/Services/Global/Chat/Commands/DamageCommand").DamageCommand
local DestroyBedCommand = require("Server/TS/Services/Global/Chat/Commands/DestroyBedCommand").DestroyBedCommand
local DieCommand = require("Server/TS/Services/Global/Chat/Commands/DieCommand").DieCommand
local CreateGeneratorCommand = require("Server/TS/Services/Global/Chat/Commands/Generator/CreateGeneratorCommand").CreateGeneratorCommand
local SetGeneratorSpawnRateCommand = require("Server/TS/Services/Global/Chat/Commands/Generator/SetGeneratorSpawnRateCommand").SetGeneratorSpawnRateCommand
local JoinCodeCommand = require("Server/TS/Services/Global/Chat/Commands/JoinCodeCommand").JoinCodeCommand
local LagCommand = require("Server/TS/Services/Global/Chat/Commands/LagCommand").LagCommand
local StartMatchCommand = require("Server/TS/Services/Global/Chat/Commands/Match/MatchStartCommand").StartMatchCommand
local SetTeamCommand = require("Server/TS/Services/Global/Chat/Commands/SetTeamCommand").SetTeamCommand
local TeamCommand = require("Server/TS/Services/Global/Chat/Commands/TeamCommand").TeamCommand
local TpAllCommand = require("Server/TS/Services/Global/Chat/Commands/TpAllCommand").TpAllCommand
local TpCommand = require("Server/TS/Services/Global/Chat/Commands/TpCommand").TpCommand
local TpsCommand = require("Server/TS/Services/Global/Chat/Commands/TpsCommand").TpsCommand
local ChatService
do
	ChatService = setmetatable({}, {
		__tostring = function()
			return "ChatService"
		end,
	})
	ChatService.__index = ChatService
	function ChatService.new(...)
		local self = setmetatable({}, ChatService)
		return self:constructor(...) or self
	end
	function ChatService:constructor(playerService)
		self.playerService = playerService
		self.commands = {}
		self:RegisterCommand(DamageCommand.new())
		self:RegisterCommand(JoinCodeCommand.new())
		self:RegisterCommand(CreateGeneratorCommand.new())
		self:RegisterCommand(SetGeneratorSpawnRateCommand.new())
		self:RegisterCommand(StartMatchCommand.new())
		self:RegisterCommand(TeamCommand.new())
		self:RegisterCommand(AddInventoryCommand.new())
		self:RegisterCommand(DieCommand.new())
		self:RegisterCommand(SetTeamCommand.new())
		self:RegisterCommand(DestroyBedCommand.new())
		self:RegisterCommand(TpAllCommand.new())
		self:RegisterCommand(TpCommand.new())
		self:RegisterCommand(TpsCommand.new())
		self:RegisterCommand(LagCommand.new())
	end
	function ChatService:RegisterCommand(command)
		local _commands = self.commands
		local _arg0 = string.lower(command.commandLabel)
		local _command = command
		_commands[_arg0] = _command
		for _, alias in command.aliases do
			local _commands_1 = self.commands
			local _arg0_1 = string.lower(alias)
			local _command_1 = command
			_commands_1[_arg0_1] = _command_1
		end
	end
	function ChatService:OnStart()
		Network.ClientToServer.SendChatMessage.Server:OnClientEvent(function(clientId, text)
			local player = self.playerService:GetPlayerFromClientId(clientId)
			if not player then
				error("player not found.")
			end
			if StringUtils.startsWith(text, "/") then
				text = StringUtils.slice(text, 1, #text)
				local split = string.split(text, " ")
				local commandLabel = string.lower(table.remove(split, 1))
				local command = self.commands[commandLabel]
				if command then
					command:Execute(player, split)
					return nil
				end
				player:SendMessage("Invalid command: /" .. text)
				return nil
			end
			local canRichText = true
			local username = "<b>" .. player.username .. "</b>"
			local team = player:GetTeam()
			if team then
				local hex = ColorUtil:ColorToHex(team.color)
				print("hex: " .. hex)
				username = "<color=" .. (hex .. (">" .. (username .. "</color>")))
			end
			if not canRichText then
				text = "<noparse>" .. text .. "</noparse>"
			end
			local message = username .. ": " .. text
			Network.ServerToClient.ChatMessage.Server:FireAllClients(message)
		end)
	end
end
-- (Flamework) ChatService metadata
Reflect.defineMetadata(ChatService, "identifier", "Bundles/Server/Services/Global/Chat/ChatService@ChatService")
Reflect.defineMetadata(ChatService, "flamework:parameters", { "Bundles/Server/Services/Global/Player/PlayerService@PlayerService" })
Reflect.defineMetadata(ChatService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(ChatService, "$:flamework@Service", Service, { {} })
return {
	ChatService = ChatService,
}
-- ----------------------------------
-- ----------------------------------
