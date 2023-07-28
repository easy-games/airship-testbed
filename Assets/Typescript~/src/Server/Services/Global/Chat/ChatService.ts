import { OnStart, Service } from "@easy-games/flamework-core";
import { PlayerService } from "Server/Services/Global/Player/PlayerService";
import { Network } from "Shared/Network";
import { ColorUtil } from "Shared/Util/ColorUtil";
import StringUtils from "Shared/Util/StringUtil";
import { AddInventoryCommand } from "./Commands/AddInventoryCommand";
import { ChatCommand } from "../../../Commands/ChatCommand";
import { DamageCommand } from "./Commands/DamageCommand";
import { DestroyBedCommand } from "./Commands/DestroyBedCommand";
import { DieCommand } from "./Commands/DieCommand";
import { SetVarCommand } from "./Commands/DynamicVariables/SetVarCommand";
import { CreateGeneratorCommand } from "./Commands/Generator/CreateGeneratorCommand";
import { SetGeneratorSpawnRateCommand } from "./Commands/Generator/SetGeneratorSpawnRateCommand";
import { HealCommand } from "./Commands/HealCommand";
import { JoinCodeCommand } from "./Commands/JoinCodeCommand";
import { LagCommand } from "./Commands/LagCommand";
import { StartMatchCommand } from "./Commands/Match/MatchStartCommand";
import { SetTeamCommand } from "./Commands/SetTeamCommand";
import { TeamCommand } from "./Commands/TeamCommand";
import { TpAllCommand } from "./Commands/TpAllCommand";
import { TpCommand } from "./Commands/TpCommand";
import { TpsCommand } from "./Commands/TpsCommand";
import { ChatUtil } from "CoreShared/Util/ChatUtil";

@Service({})
export class ChatService implements OnStart {
	private commands = new Map<string, ChatCommand>();

	constructor(private readonly playerService: PlayerService) {
		this.RegisterCommand(new DamageCommand());
		this.RegisterCommand(new JoinCodeCommand());
		this.RegisterCommand(new CreateGeneratorCommand());
		this.RegisterCommand(new SetGeneratorSpawnRateCommand());
		this.RegisterCommand(new StartMatchCommand());
		this.RegisterCommand(new TeamCommand());
		this.RegisterCommand(new AddInventoryCommand());
		this.RegisterCommand(new DieCommand());
		this.RegisterCommand(new SetTeamCommand());
		this.RegisterCommand(new DestroyBedCommand());
		this.RegisterCommand(new TpAllCommand());
		this.RegisterCommand(new TpCommand());
		this.RegisterCommand(new TpsCommand());
		this.RegisterCommand(new LagCommand());
		this.RegisterCommand(new SetVarCommand());
		this.RegisterCommand(new HealCommand());
	}

	public RegisterCommand(command: ChatCommand) {
		this.commands.set(command.commandLabel.lower(), command);
		for (let alias of command.aliases) {
			this.commands.set(alias.lower(), command);
		}
	}

	OnStart(): void {
		Network.ClientToServer.SendChatMessage.Server.OnClientEvent((clientId, text) => {
			const player = this.playerService.GetPlayerFromClientId(clientId);
			if (!player) {
				error("player not found.");
			}

			if (StringUtils.startsWith(text, "/")) {
				const commandData = ChatUtil.ParseCommandData(text);

				if (commandData) {
					const command = this.commands.get(commandData.label);
					if (command) {
						command.Execute(player, commandData.args);
						return;
					}
				}

				player.SendMessage(`Invalid command: ${text}`);
				return;
			}

			let canRichText = true;

			let username = "<b>" + player.username + "</b>";
			const team = player.GetTeam();
			if (team) {
				const hex = ColorUtil.ColorToHex(team.color);
				print("hex: " + hex);
				username = `<color=${hex}>${username}</color>`;
			}
			if (!canRichText) {
				text = "<noparse>" + text + "</noparse>";
			}

			let message = username + ": " + text;
			Network.ServerToClient.ChatMessage.Server.FireAllClients(message);
		});
	}
}
