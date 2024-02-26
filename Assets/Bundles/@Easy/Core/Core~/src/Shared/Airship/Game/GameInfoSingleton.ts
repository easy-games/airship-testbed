import { GameDto } from "@Easy/Core/Client/Components/HomePage/API/GamesAPI";
import { OnStart } from "@Easy/Core/Shared/Flamework";
import { Controller, Service } from "@Easy/Core/Shared/Flamework/flamework";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";

@Service()
@Controller()
export class GameInfoSingleton implements OnStart {
	OnStart(): void {}

	/** Yields */
	public GetGameData(gameId: string): GameDto | undefined {
		const res = InternalHttpManager.GetAsync(AirshipUrl.ContentService + "/games/game-id/" + gameId);
		if (res.success) {
			return DecodeJSON(res.data) as GameDto;
		} else {
			warn("Failed to parse game data: " + res.error);
		}
	}
}
