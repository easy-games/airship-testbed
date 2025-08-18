import MenuFeaturedEvent from "@Easy/Core/Client/Components/HomePage/FeaturedEvent/MenuFeaturedEvent";
import { SocketController } from "@Easy/Core/Client/ProtectedControllers/Socket/SocketController";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import SearchSingleton from "@Easy/Core/Shared/MainMenu/Components/Search/SearchSingleton";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { SetTimeout } from "@Easy/Core/Shared/Util/Timer";
import SortComponent from "../../../Client/Components/HomePage/Sort/SortComponent";
import { SortId } from "../../../Client/Components/HomePage/Sort/SortId";
import { MainMenuBlockSingleton } from "../../../Client/ProtectedControllers//Settings/MainMenuBlockSingleton";
import { Asset } from "../../Asset";
import DateParser from "../../DateParser";
import { Game } from "../../Game";
import { ContentServiceGames } from "../../TypePackages/content-service-types";
import { UnityMakeRequest } from "../../TypePackages/UnityMakeRequest";
import inspect from "../../Util/Inspect";
import { ProtectedUtil } from "../../Util/ProtectedUtil";
import { MainMenuSingleton } from "../Singletons/MainMenuSingleton";
import DiscordHero from "./DiscordHero";
import MainMenuPageComponent from "./MainMenuPageComponent";

const gamesClient = new ContentServiceGames.Client(UnityMakeRequest(AirshipUrl.ContentService));

export default class HomePageComponent extends MainMenuPageComponent {
	@Header("References")
	public mainContent!: Transform;
	public mainSortedContentLayoutGroup: VerticalLayoutGroup;
	public scrollRect!: ScrollRect;
	public verticalLayoutGroup: VerticalLayoutGroup;

	@Header("Prefabs")
	public spacerPrefab!: GameObject;
	public sortPrefab!: GameObject;
	public featuredEventPrefab: GameObject;

	private bin = new Bin();
	private sorts = new Map<SortId, SortComponent>();
	private addedDiscordHero = false;
	// private loadedGameComponents: HomePageGameComponent[] = [];

	protected Awake(): void {
		this.animateInDuration = 0;
	}

	protected Start(): void {
		const mainMenu = Dependency<MainMenuSingleton>();
		mainMenu.ObserveScreenSize((st) => {
			if (Game.IsMobile() && st === "sm") {
				this.mainSortedContentLayoutGroup.padding.top = 20;

				// this.verticalLayoutGroup.padding.left = 4;
				// this.verticalLayoutGroup.padding.right = 4;
			}
		});
		if (Game.IsMobile()) {
			this.scrollRect.movementType = MovementType.Elastic;
		}
	}

	override OpenPage(params?: unknown): void {
		super.OpenPage(params);
		this.ClearSorts();
		this.addedDiscordHero = false;

		this.CreateFeaturedEvent(
			"47c5fdbd-bf3f-4a5b-9ad3-dea11a52a762",
			"Early access playtest of BedWars 2.\nWelcome to Airship!",
			1755363600,
			1755374400,
		);

		this.CreateSort(SortId.Popular, "Popular");

		// show user games on mobile for now, only need the sort if the user actually has games
		if (Game.IsMobile()) {
			const searchSingleton = Dependency<SearchSingleton>();

			if (searchSingleton.myGames.isEmpty()) {
				searchSingleton.FetchMyGames();
			}

			if (!searchSingleton.myGames.isEmpty()) {
				this.CreateSort(SortId.DeveloperGames, "My Games");
			}
		}

		this.CreateSort(SortId.RecentlyUpdated, "Recently Updated");

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

	private CreateFeaturedEvent(gameId: string, description: string, startTime: number, endTime: number): void {
		const go = Instantiate(this.featuredEventPrefab, this.mainContent);
		const featuredEvent = go.GetAirshipComponent<MenuFeaturedEvent>()!;
		featuredEvent.Init(gameId, description, startTime, endTime);
	}

	private CreateSpacer(): void {
		const go = Object.Instantiate(this.spacerPrefab, this.mainContent);
	}

	public FetchGames(): void {
		let res;
		try {
			res = gamesClient
				.getGameSorts({
					platform: ProtectedUtil.GetLocalPlatformString() as ContentServiceGames.DeploymentPlatform,
				})
				.expect();
		} catch {
			// warn("Failed to fetch games. Retrying in 1s..");
			this.bin.Add(
				SetTimeout(1, () => {
					this.FetchGames();
				}),
			);
			return;
		}

		let sorts: SortId[];
		sorts = ObjectUtils.keys(this.sorts);

		const blockSingleton = Dependency<MainMenuBlockSingleton>();
		const searchSingleton = Dependency<SearchSingleton>();

		let indexCounter = 0;
		for (let sortId of sorts) {
			const sortComponent = this.sorts.get(sortId);

			if (sortId === SortId.DeveloperGames) {
				if (!sortComponent) continue;

				if (searchSingleton.myGames.isEmpty()) {
					searchSingleton.FetchMyGames();
				}

				const developerGames = searchSingleton.myGames.filter((f) =>
					f.platforms.includes(
						ProtectedUtil.GetLocalPlatformString() as ContentServiceGames.DeploymentPlatform,
					),
				);
				sortComponent.SetGames(developerGames, indexCounter);
				indexCounter += developerGames.size();
			} else {
				let games = res[sortId as keyof typeof res].filter(
					(g) => g.lastVersionUpdate !== undefined && !blockSingleton.IsGameIdBlocked(g.id),
				);
				games = games.filter((g) => {
					if (g.lastVersionUpdate === undefined) return false;
					let timeUpdatedSeconds = DateParser.FromISO(g.lastVersionUpdate) as number;

					// Jan 6, 2025
					if (timeUpdatedSeconds <= 1736205525) {
						return false;
					}

					return true;
				});

				sortComponent!.SetGames(games, indexCounter);
				indexCounter += games.size();
			}
		}

		task.spawn(() => {
			const search = Dependency<SearchSingleton>();

			search.AddGames([...res.recentlyUpdated, ...res.popular]);
		});

		if (!this.addedDiscordHero && !Game.IsMobile()) {
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
