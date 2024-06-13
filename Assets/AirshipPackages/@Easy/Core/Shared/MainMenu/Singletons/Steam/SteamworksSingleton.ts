import SteamRichPresence from "@Easy/Core/Client/Airship/Steam/SteamRichPresence";
import { TransferController } from "@Easy/Core/Client/ProtectedControllers/Transfer/TransferController";
import inspect from "@Easy/Core/Shared/Util/Inspect";
import { Dependency, OnStart, Singleton } from "../../../Flamework";
import { Game } from "../../../Game";
import { DecodeJSON, EncodeJSON } from "../../../json";

interface SteamConnectPacket {
	gameId: string;
	serverId: string;
}

@Singleton()
export class SteamworksSingleton implements OnStart {
	OnStart(): void {
		SteamLuauAPI.OnRichPresenceGameJoinRequest((connectionStr, steamId) => {
			const connectInfo = DecodeJSON<SteamConnectPacket>(connectionStr);
			if (!connectInfo || !connectInfo.gameId || !connectInfo.serverId) {
				print("[SteamworksSingleton] Invalid connect info on steam join request: " + inspect(connectInfo));
				print("[SteamworksSingleton] Connection string: " + connectionStr);
				return;
			}
			print("[SteamworksSingleton] Transfer to game: " + inspect(connectionStr));
			Dependency<TransferController>().TransferToGameAsync(connectInfo.gameId, connectInfo.serverId);
		});
		SteamLuauAPI.ProcessPendingJoinRequests();

		task.spawn(() => {
			Game.WaitForGameData();
			SteamLuauAPI.SetRichPresence(
				"connect",
				EncodeJSON(
					identity<SteamConnectPacket>({
						gameId: Game.gameId,
						serverId: Game.serverId,
					}),
				),
			);
		});

		task.spawn(() => {
			Game.WaitForGameData();
			this.UpdateGameRichPresence();
		});
	}

	public UpdateGameRichPresence() {
		const gameName = Game.gameData?.name ?? "Unknown";

		// Set default rich presence
		SteamLuauAPI.SetGameRichPresence(gameName, SteamRichPresence.GetStatus());
	}
}
