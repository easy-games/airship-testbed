import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";

@Service({})
export class ProtectedChatService implements OnStart {
    OnStart(): void {
        this.StartupServerChatListener();
    }

    private StartupServerChatListener() {
		CoreNetwork.ClientToServer.SendChatMessage.server.OnClientEvent((player, text) => {
            contextbridge.broadcast<(msg: string, fromConnId: number) => void>("ProtectedChat:SendMessage", text, player.connectionId);
		});
	}
}
