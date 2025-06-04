import { Airship } from "@Easy/Core/Shared/Airship";

export default class PlayerRole extends AirshipBehaviour {
	override Start(): void {
		Airship.Players.onPlayerJoined.Connect((player) => {
			if (player.orgRoleName) {
				print(`Player ${player.username} has org role ${player.orgRoleName}`);
			} else {
				print(`Player ${player.username} has no org role.`);
			}
		});
	}

	override OnDestroy(): void {}
}
