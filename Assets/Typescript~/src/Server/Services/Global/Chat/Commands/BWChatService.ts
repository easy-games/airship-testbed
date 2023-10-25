import { ChatService } from "@Easy/Core/Server/Services/Chat/ChatService";
import { OnStart, Service } from "@easy-games/flamework-core";
import { DestroyBedCommand } from "./Match/DestroyBedCommand";
import { MatchStartCommand } from "./Match/MatchStartCommand";

@Service({})
export class BWChatService implements OnStart {
	constructor(private readonly chatService: ChatService) {}
	OnStart(): void {
		this.chatService.RegisterCommand(new MatchStartCommand());
		this.chatService.RegisterCommand(new DestroyBedCommand());
	}
}
