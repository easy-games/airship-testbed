import { GameDto, GamesDto, MyGamesDto } from "@Easy/Core/Client/Components/HomePage/API/GamesAPI";
import { Controller, Service } from "@Easy/Core/Shared/Flamework/flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { HttpRetry } from "@Easy/Core/Shared/Http/HttpRetry";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";

@Service({ loadOrder: -1000 })
@Controller({ loadOrder: -1000 })
// @Singleton()
export default class SearchSingleton {
	public games: GameDto[] = [];
	public myGames: GameDto[] = [];
	public myGamesIds = new Set<string>();

	protected OnStart(): void {
		if (Game.IsClient()) {
			task.spawn(() => {
				this.FetchPopularGames();
			});
			task.spawn(() => {
				this.FetchMyGames();
			});
		}
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

	public FetchMyGames(retryDelay = 1): void {
		const res = HttpRetry(
			() => InternalHttpManager.GetAsync(AirshipUrl.ContentService + "/memberships/games/self?liveStats=true"),
			{ retryKey: "get/content-service/memberships/games/self" },
		).expect();
		if (!res.success) {
			if (400 <= res.statusCode && res.statusCode < 500) {
				warn("Failed to fetch my games: " + res.error);
				return;
			}

			// warn("Failed to fetch my games. Retrying in 1s..");
			task.delay(math.min(retryDelay * 2, 30), () => {
				this.FetchMyGames();
			});
			return;
		}

		try {
			let data = json.decode<MyGamesDto>(res.data);
			data = data.filter((g) => g.lastVersionUpdate !== undefined);
			this.myGames = data;
			this.myGamesIds.clear();
			for (let g of this.myGames) {
				this.myGamesIds.add(g.id);
			}
		} catch (err) {
			warn("Failed to decode my games: " + res.error);
			task.delay(math.min(retryDelay * 2, 30), () => {
				this.FetchMyGames();
			});
			return;
		}
	}

	public FetchPopularGames(): void {
		const res = HttpRetry(
			() => InternalHttpManager.GetAsync(AirshipUrl.ContentService + "/games"),
			{ retryKey: "get/content-service/games" },
		).expect();
		if (!res.success) {
			// warn("Failed to fetch games. Retrying in 1s..");
			task.delay(1, () => {
				this.FetchPopularGames();
			});
			return;
		}

		try {
			const data = json.decode<GamesDto>(res.data);
			task.spawn(() => {
				this.AddGames([...data.recentlyUpdated, ...data.popular]);
			});
		} catch (err) {
			warn("Failed to decode popular games: " + res.error);

			task.delay(1, () => {
				this.FetchPopularGames();
			});
		}
	}
}
