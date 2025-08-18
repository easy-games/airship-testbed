import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";

export default class ModerationTest extends AirshipBehaviour {
	override Start(): void {
		if (!Game.IsServer()) return;

		print("ModerationTest started on server.");
		Airship.Players.onPlayerJoined.Connect((player) => {
			task.wait(3);
			print(`Player ${player.username} joined the game.`);

			Platform.Server.Moderation.ModerateText(`This is a test message: ${player.username}`).then((response) => {
				print("Moderation response: ", json.encode(response));
				if (response.blocked) {
					print(`Message blocked: ${response.text}`);
				} else {
					print(`Message allowed: ${response.text}`);
				}
			}).catch((err) => {
				print(`Error moderating message: ${err}`);
			});
		});
	}
}
