import { OnStart } from "@Easy/Core/Shared/Flamework";
import { Controller, Service } from "@Easy/Core/Shared/Flamework/flamework";
import { GameData } from "@Easy/Core/Shared/GameData";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";

@Service()
@Controller()
export class GameInfoSingleton implements OnStart {
	OnStart(): void {}

	/** Yields */
	public GetGameData(gameId: string): GameData | undefined {
		const res = InternalHttpManager.GetAsync(AirshipUrl.ContentService + "/games/game-id/" + gameId);
		if (res.success) {
			return DecodeJSON(res.data) as GameData;
		} else {
			warn("Failed to parse game data: " + res.error);
		}
	}
}
