import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { GameData } from "@Easy/Core/Shared/GameData";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";

@Service({})
export class GameInfoService implements OnStart {
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
