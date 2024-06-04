import { GameDto } from "@Easy/Core/Client/Components/HomePage/API/GamesAPI";
import { OnStart } from "@Easy/Core/Shared/Flamework";
import { Singleton } from "@Easy/Core/Shared/Flamework/flamework";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";
import { CoreLogger } from "../../Logger/CoreLogger";

@Singleton()
export class GameInfoSingleton implements OnStart {
	OnStart(): void {}

	/** Yields */
	public GetGameData(gameId: string): GameDto | undefined {
		const res = InternalHttpManager.GetAsync(AirshipUrl.ContentService + "/games/game-id/" + gameId);
		if (res.success) {
			return DecodeJSON(res.data) as GameDto;
		} else {
			CoreLogger.Warn("Failed to parse game data: " + res.error);
		}
	}
}
