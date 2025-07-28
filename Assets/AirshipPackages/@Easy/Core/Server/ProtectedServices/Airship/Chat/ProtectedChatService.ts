import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";

const MESSAGES_PER_SECOND = 2;

@Service({})
export class ProtectedChatService implements OnStart {
	private messageCounters = new Map<string, number>();

	OnStart(): void {
		this.StartupServerChatListener();

		SetInterval(1, () => {
			for (let [userId, count] of this.messageCounters) {
				count = math.max(count - MESSAGES_PER_SECOND, 0);
				this.messageCounters.set(userId, count);
			}
		});
	}

	private StartupServerChatListener() {
		CoreNetwork.ClientToServer.SendChatMessage.server.OnClientEvent((player, text) => {
			if (text.size() > 500) return;
			if (player.orgRoleName === undefined) {
				text = this.SanitizeText(text);
			}

			// rate limit
			let counter = this.messageCounters.get(player.userId) ?? 0;
			if (counter >= MESSAGES_PER_SECOND) {
				player.SendMessage(ChatColor.Red("You are sending messages too quickly."));
				return;
			}

			counter++;
			this.messageCounters.set(player.userId, counter);

			contextbridge.broadcast<(msg: string, fromConnId: number) => void>(
				"ProtectedChat:SendMessage",
				text,
				player.connectionId,
			);
		});
	}

	public SanitizeText(msg: string): string {
		msg = Bridge.RemoveRichText(msg);
		msg = string.gsub(msg, "\\%d%d?%d?", "")[0]; // remove any \0 - \255 (ASCII)
		msg = string.gsub(msg, "\\%a", "")[0]; // remove anything like \t, \a, \x etc.
		return msg;
	}
}
