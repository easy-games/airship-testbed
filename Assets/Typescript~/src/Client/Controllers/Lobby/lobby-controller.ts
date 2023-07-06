import { Controller, OnStart } from "@easy-games/flamework-core";

@Controller({})
export class LobbyController implements OnStart {
	OnStart(): void {
		print("Lobby controller!");
	}
}
