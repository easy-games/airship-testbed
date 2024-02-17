import SteamRichPresence from "@Easy/Core/Client/Airship/Steam/SteamRichPresence";
import { TransferController } from "@Easy/Core/Client/MainMenuControllers/Transfer/TransferController";
import inspect from "@easy-games/unity-inspect";
import { CoreNetwork } from "../../CoreNetwork";
import { Controller, Dependency, OnStart, Service } from "../../Flamework";
import { Game } from "../../Game";
import { DecodeJSON, EncodeJSON } from "../../json";

interface SteamConnectPacket {
	gameId: string;
	serverId: string;
}

@Controller({})
@Service({})
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

		CoreNetwork.ServerToClient.ServerInfo.client.OnServerEvent((gameId, serverId, organizationId) => {
			Game.gameId = gameId;
			Game.serverId = serverId;
			Game.organizationId = organizationId;

			SteamLuauAPI.SetRichPresence(
				"connect",
				EncodeJSON(
					identity<SteamConnectPacket>({
						gameId,
						serverId,
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
