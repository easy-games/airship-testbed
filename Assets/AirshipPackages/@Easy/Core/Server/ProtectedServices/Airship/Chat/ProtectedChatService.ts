import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { Player } from "@Easy/Core/Shared/Player/Player";

@Service({})
export class ProtectedChatService implements OnStart {
    OnStart(): void {
        this.StartupServerChatListener();
    }

    private StartupServerChatListener() {
        print("Startup on server: " + contextbridge.current());
		CoreNetwork.ClientToServer.SendChatMessage.server.OnClientEvent((player, text) => {
            print("Found am essage");
            contextbridge.broadcast<(msg: string, from: Player) => void>("ProtectedChat:SendMessage", text, player);
		});
	}
}
