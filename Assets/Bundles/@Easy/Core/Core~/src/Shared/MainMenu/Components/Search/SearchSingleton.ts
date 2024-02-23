import { GameDto, GamesDto } from "@Easy/Core/Client/Components/HomePage/API/GamesAPI";
import { Controller, OnStart, Service } from "@Easy/Core/Shared/Flamework/flamework";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { SetTimeout } from "@Easy/Core/Shared/Util/Timer";
import { DecodeJSON } from "@Easy/Core/Shared/json";
import ObjectUtils from "@easy-games/unity-object-utils";

@Service({ loadOrder: -1000 })
@Controller({ loadOrder: -1000 })
// @Singleton()
export default class SearchSingleton implements OnStart {
	public games: GameDto[] = [];

	OnStart(): void {
		task.spawn(() => {
			this.FetchPopularGames();
		});
	}

	public AddGames(dtos: GameDto[]): void {
		for (let dto of dtos) {
			// update existing
			let existing = this.games.find((g) => g.id === dto.id);
			if (existing) {
				ObjectUtils.assign(existing, dto);
				continue;
			}

			// add new
			this.games.push(dto);
		}
	}

	public FetchPopularGames(): void {
		const res = InternalHttpManager.GetAsync(AirshipUrl.ContentService + "/games");
		if (!res.success) {
			// warn("Failed to fetch games. Retrying in 1s..");
			SetTimeout(1, () => {
				this.FetchPopularGames();
			});
			return;
		}

		const data = DecodeJSON<GamesDto>(res.data);
		task.spawn(() => {
			this.AddGames([...data.recentlyUpdated, ...data.popular]);
		});
	}
}
