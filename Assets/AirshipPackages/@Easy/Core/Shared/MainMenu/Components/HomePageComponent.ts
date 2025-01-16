import { SocketController } from "@Easy/Core/Client/ProtectedControllers/Socket/SocketController";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import SearchSingleton from "@Easy/Core/Shared/MainMenu/Components/Search/SearchSingleton";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { SetTimeout } from "@Easy/Core/Shared/Util/Timer";
import { GamesDto } from "../../../Client/Components/HomePage/API/GamesAPI";
import SortComponent from "../../../Client/Components/HomePage/Sort/SortComponent";
import { SortId } from "../../../Client/Components/HomePage/Sort/SortId";
import { MainMenuBlockSingleton } from "../../../Client/ProtectedControllers//Settings/MainMenuBlockSingleton";
import { Asset } from "../../Asset";
import DateParser from "../../DateParser";
import inspect from "../../Util/Inspect";
import DiscordHero from "./DiscordHero";
import MainMenuPageComponent from "./MainMenuPageComponent";
import { HttpRetry } from "../../Http/HttpRetry";

export default class HomePageComponent extends MainMenuPageComponent {
	public mainContent!: Transform;
	public spacerPrefab!: GameObject;
	public sortPrefab!: GameObject;
	public scrollRect!: ScrollRect;
	private bin = new Bin();
	private sorts = new Map<SortId, SortComponent>();
	private addedDiscordHero = false;
	// private loadedGameComponents: HomePageGameComponent[] = [];

	protected Awake(): void {
		this.animateInDuration = 0;
	}

	override OpenPage(params?: unknown): void {
		super.OpenPage(params);
		this.ClearSorts();
		this.addedDiscordHero = false;
		this.CreateSort(SortId.RecentlyUpdated, "Recently Updated");
		this.CreateSort(SortId.Popular, "Popular");

		Bridge.UpdateLayout(this.scrollRect.transform, true);
		task.spawn(() => {
			this.FetchGames();
		});

		const socketController = Dependency<SocketController>();
		this.bin.Add(
			socketController.On<{
				games: {
					[key: string]: number;
				};
			}>("homepage-events/update-player-count", (data) => {
				print("update player count: " + inspect(data));
				for (let gameId of ObjectUtils.keys(data.games) as string[]) {
					const playerCount = data.games[gameId];
					for (let sort of ObjectUtils.values(this.sorts)) {
						if (sort.UpdateGamePlayerCount(gameId, playerCount)) {
							break;
						}
					}
				}
			}),
		);
		socketController.Emit("join-room", {
			room: "homepage-events",
		});
		this.bin.Add(() => {
			socketController.Emit("leave-room", {
				room: "homepage-events",
			});
		});

		// const platform = AirshipPlatformUtil.GetLocalPlatform();
		// if (platform === AirshipPlatform.Windows) {
		// 	this.scrollRect.scrollSensitivity = 22;
		// }
	}

	private ClearSorts(): void {
		//Release pooled game cards
		// for (let i = 0; i < this.loadedGameComponents.size(); i++) {
		// 	PoolManager.ReleaseObject(this.loadedGameComponents[i].gameObject);
		// }
		// this.loadedGameComponents.clear();

		//Destroy the sort containers
		this.mainContent.gameObject.ClearChildren();
	}

	private CreateSort(sortId: SortId, title: string): void {
		const sortGo = Object.Instantiate(this.sortPrefab, this.mainContent) as GameObject;
		sortGo.name = "Sort (" + title + ")";
		const sortComponent = sortGo.GetAirshipComponent<SortComponent>()!;
		sortComponent.SetTitle(title);
		sortComponent.pageScrollRect = this.scrollRect;
		this.sorts.set(sortId, sortComponent);
	}

	private CreateSpacer(): void {
		const go = Object.Instantiate(this.spacerPrefab, this.mainContent);
	}

	public FetchGames(): void {
		const res = HttpRetry(
			() => InternalHttpManager.GetAsync(AirshipUrl.ContentService + "/games"),
			{ retryKey: "get/content-service/games" },
		).expect();
		if (!res.success) {
			// warn("Failed to fetch games. Retrying in 1s..");
			this.bin.Add(
				SetTimeout(1, () => {
					this.FetchGames();
				}),
			);
			return;
		}

		const data = json.decode<GamesDto>(res.data);

		let sorts: SortId[];
		sorts = ObjectUtils.keys(this.sorts);

		const blockSingleton = Dependency<MainMenuBlockSingleton>();
		let indexCounter = 0;
		for (let sortId of sorts) {
			const sortComponent = this.sorts.get(sortId)!;

			let games = data[sortId].filter(
				(g) => g.lastVersionUpdate !== undefined && !blockSingleton.IsGameIdBlocked(g.id),
			);
			games = games.filter((g) => {
				if (g.lastVersionUpdate === undefined) return false;
				let timeUpdatedSeconds = DateParser.FromISO(g.lastVersionUpdate) as number;

				// Jul 16, 2024
				if (timeUpdatedSeconds <= 1722442457) {
					return false;
				}

				return true;
			});

			sortComponent.SetGames(games, indexCounter);

			indexCounter += games.size();
		}

		task.spawn(() => {
			Dependency<SearchSingleton>().AddGames([...data.recentlyUpdated, ...data.popular]);
		});

		if (!this.addedDiscordHero) {
			this.addedDiscordHero = true;
			const go = Object.Instantiate(
				Asset.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/MainMenu/HomePage/DiscordHero.prefab"),
				this.mainContent,
			);
			Bridge.UpdateLayout(this.scrollRect.transform.parent, true);
			const discordHero = go.GetAirshipComponent<DiscordHero>()!;
			discordHero.scrollRedirect.redirectTarget = this.scrollRect;
		}
	}

	override OnDisable(): void {
		this.bin.Clean();
	}

	public override OnDestroy(): void {
		this.bin.Clean();
	}
}
