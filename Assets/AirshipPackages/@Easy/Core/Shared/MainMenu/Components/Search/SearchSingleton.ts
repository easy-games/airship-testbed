import { AirshipGame } from "@Easy/Core/Shared/Airship/Types/AirshipGame";
import DateParser from "@Easy/Core/Shared/DateParser";
import { Controller, Service } from "@Easy/Core/Shared/Flamework/flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { ContentServiceClient, ContentServiceGames } from "@Easy/Core/Shared/TypePackages/content-service-types";
import { UnityMakeRequest, UnityMakeRequestError } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { ProtectedUtil } from "@Easy/Core/Shared/Util/ProtectedUtil";

const contentServiceClient = new ContentServiceClient(UnityMakeRequest(AirshipUrl.ContentService));

@Service({ loadOrder: -1000 })
@Controller({ loadOrder: -1000 })
// @Singleton()
export default class SearchSingleton {
	public games: AirshipGame[] = [];
	public myGames: AirshipGame[] = [];
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

	public AddGames(dtos: AirshipGame[]): void {
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
		try {
			let data = contentServiceClient.memberships.getUserGameOwnership({ liveStats: true }).expect();
			data = data.filter((g) => g.lastVersionUpdate !== undefined);
			this.myGames = data;
			this.myGamesIds.clear();
			this.myGames = this.myGames.sort((a, b) => {
				const aTime =
					a.lastVersionUpdate !== undefined ? (DateParser.FromISO(a.lastVersionUpdate) as number) : 0;
				const bTime =
					b.lastVersionUpdate !== undefined ? (DateParser.FromISO(b.lastVersionUpdate) as number) : 0;
				return aTime > bTime;
			});
			for (let g of this.myGames) {
				this.myGamesIds.add(g.id);
			}
		} catch (err: unknown) {
			if (UnityMakeRequestError.IsInstance(err) && 400 <= err.status && err.status < 500) {
				return;
			}

			// this should potentially be moved into http retry
			task.delay(math.min(retryDelay * 2, 30), () => {
				this.FetchMyGames();
			});
		}
	}

	public FetchPopularGames(): void {
		try {
			const data = contentServiceClient.games
				.getGameSorts({
					platform: ProtectedUtil.GetLocalPlatformString() as ContentServiceGames.DeploymentPlatform,
				})
				.expect();

			task.spawn(() => {
				this.AddGames([...data.recentlyUpdated, ...data.popular]);
			});
		} catch (err) {
			if (UnityMakeRequestError.IsInstance(err)) {
				const errorMessage = UnityMakeRequestError.DisplayText(err) ?? "An unknown error occurred";
				warn(`Failed to decode popular games: ${errorMessage}`);
			}

			task.delay(1, () => {
				this.FetchPopularGames();
			});
		}
	}
}
