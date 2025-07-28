import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";

@Service({})
export class ProtectedChatService implements OnStart {
	OnStart(): void {
		this.StartupServerChatListener();
	}

	private StartupServerChatListener() {
		CoreNetwork.ClientToServer.SendChatMessage.server.OnClientEvent((player, text) => {
			if (text.size() > 500) return;
			if (player.orgRoleName === undefined) {
				text = this.SanitizeText(text);
			}
			contextbridge.broadcast<(msg: string, fromConnId: number) => void>(
				"ProtectedChat:SendMessage",
				text,
				player.connectionId,
			);
		});
	}

	private SanitizeText(msg: string): string {
		return Bridge.RemoveRichText(msg);
	}
}
