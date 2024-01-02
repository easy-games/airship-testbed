import { Controller, OnStart } from "@easy-games/flamework-core";
import { Game } from "Shared/Game";

@Controller({})
export class MapEditController implements OnStart {
	OnStart(): void {
		if (Game.StartingScene !== "MapEdit") {
			return;
		}
	}
}
