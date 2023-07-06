import { Network } from "./Network";
import { Player } from "./Player/Player";

export class Game {
	public static LocalPlayer: Player = new Player(
		undefined as unknown as NetworkObject,
		-1,
		"LocalPlayer",
		"LocalPlayer",
		"null",
	);

	public static BroadcastMessage(message: string): void {
		if (RunCore.IsServer()) {
			Network.ServerToClient.ChatMessage.Server.FireAllClients(message);
		} else {
			Game.LocalPlayer.SendMessage(message);
		}
	}
}
