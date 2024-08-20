import SteamRichPresence from "@Easy/Core/Client/Airship/Steam/SteamRichPresence";
import { TransferController } from "@Easy/Core/Client/ProtectedControllers/Transfer/TransferController";
import inspect from "@Easy/Core/Shared/Util/Inspect";
import { Dependency, Singleton } from "../../../Flamework";
import { Game } from "../../../Game";
import { DecodeJSON, EncodeJSON } from "../../../json";

interface SteamConnectPacket {
	gameId: string;
	serverId: string;
}

@Singleton()
export class SteamworksSingleton {
	protected OnStart(): void {
		SteamLuauAPI.OnRichPresenceGameJoinRequest((connectionStr, steamId) => {
			const connectInfo = DecodeJSON<Partial<SteamConnectPacket>>(connectionStr);
			if (!connectInfo || !connectInfo.gameId) {
				print("[SteamworksSingleton] Invalid connect info on steam join request: " + inspect(connectInfo));
				print("[SteamworksSingleton] Connection string: " + connectionStr);
				return;
			}

			print("[SteamworksSingleton] Transfer to game: " + inspect(connectionStr));
			Dependency<TransferController>().TransferToGameAsync(connectInfo.gameId, connectInfo.serverId);
		});
		SteamLuauAPI.OnNewLaunchParams((gameId, serverId, custom) => {
			print("New launch params: gameId=" + gameId + " serverId=" + serverId + " custom=" + custom);
			if (gameId.size() === 0) return;
			
			Dependency<TransferController>().TransferToGameAsync(gameId, serverId.size() > 0 ? serverId : undefined);
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
