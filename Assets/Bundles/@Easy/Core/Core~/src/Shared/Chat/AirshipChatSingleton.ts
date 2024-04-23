import { ChatService } from "@Easy/Core/Server/Services/Chat/ChatService";
import { AddInventoryCommand } from "@Easy/Core/Server/Services/Chat/Commands/AddInventoryCommand";
import { BotCommand } from "@Easy/Core/Server/Services/Chat/Commands/BotCommand";
import { DamageCommand } from "@Easy/Core/Server/Services/Chat/Commands/DamageCommand";
import { GetVarCommand } from "@Easy/Core/Server/Services/Chat/Commands/DynamicVariables/GetVarCommand";
import { SetVarCommand } from "@Easy/Core/Server/Services/Chat/Commands/DynamicVariables/SetVarCommand";
import { EntityCommand } from "@Easy/Core/Server/Services/Chat/Commands/EntityCommand";
import { FlyCommand } from "@Easy/Core/Server/Services/Chat/Commands/FlyCommand";
import { HealCommand } from "@Easy/Core/Server/Services/Chat/Commands/HealCommand";
import { HelpCommand } from "@Easy/Core/Server/Services/Chat/Commands/HelpCommand";
import { JoinCodeCommand } from "@Easy/Core/Server/Services/Chat/Commands/JoinCodeCommand";
import { KillCommand } from "@Easy/Core/Server/Services/Chat/Commands/KillCommand";
import { LagCommand } from "@Easy/Core/Server/Services/Chat/Commands/LagCommand";
import { SaveWorldCommand } from "@Easy/Core/Server/Services/Chat/Commands/SaveWorldCommand";
import { SetTeamCommand } from "@Easy/Core/Server/Services/Chat/Commands/SetTeamCommand";
import { TeamChatCommand } from "@Easy/Core/Server/Services/Chat/Commands/TeamChatCommand";
import { TeamCommand } from "@Easy/Core/Server/Services/Chat/Commands/TeamCommand";
import { TpAllCommand } from "@Easy/Core/Server/Services/Chat/Commands/TpAllCommand";
import { TpCommand } from "@Easy/Core/Server/Services/Chat/Commands/TpCommand";
import { TpsCommand } from "@Easy/Core/Server/Services/Chat/Commands/TpsCommand";
import { Dependency, OnStart, Singleton } from "Shared/Flamework";
import { Airship } from "../Airship";
import { ChatCommand } from "../Commands/ChatCommand";
import { Game } from "../Game";

@Singleton({})
export class AirshipChatSingleton implements OnStart {
	constructor() {
		Airship.chat = this;
	}

	OnStart(): void {
		this.RegisterCoreCommands();
	}

	/**
	 * Sets chat's visibility.
	 *
	 * @param val Whether or not chat should be visible.
	 */
	public SetUIEnabled(val: boolean): void {
		contextbridge.invoke<(val: boolean) => void>("ClientChatSingleton:SetUIEnabled", LuauContext.Protected, val);
	}

	/**
	 * Registers provided command.
	 *
	 * @param command A command instance.
	 */
	public RegisterCommand(command: ChatCommand): void {
		Dependency<ChatService>().RegisterCommand(command);
	}

	/**
	 * Broadcasts message to entire server, if called from server. Otherwise,
	 * broadcasts message to only local player.
	 *
	 * @param message A message.
	 */
	public BroadcastMessage(message: string): void {
		Game.BroadcastMessage(message);
	}

	private RegisterCoreCommands(): void {
		if (!Game.IsServer()) return;
		this.RegisterCommand(new EntityCommand());
		this.RegisterCommand(new DamageCommand());
		this.RegisterCommand(new JoinCodeCommand());
		this.RegisterCommand(new TeamCommand());
		this.RegisterCommand(new AddInventoryCommand());
		this.RegisterCommand(new KillCommand());
		this.RegisterCommand(new SetTeamCommand());
		this.RegisterCommand(new TpAllCommand());
		this.RegisterCommand(new TpCommand());
		this.RegisterCommand(new TpsCommand());
		this.RegisterCommand(new LagCommand());
		this.RegisterCommand(new SetVarCommand());
		this.RegisterCommand(new GetVarCommand());
		this.RegisterCommand(new HealCommand());
		this.RegisterCommand(new BotCommand());
		this.RegisterCommand(new FlyCommand());
		this.RegisterCommand(new HelpCommand());
		this.RegisterCommand(new TeamChatCommand());
		this.RegisterCommand(new SaveWorldCommand());
	}
}
