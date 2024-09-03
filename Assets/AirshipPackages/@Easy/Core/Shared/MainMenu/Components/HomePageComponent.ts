import { Dependency } from "@Easy/Core/Shared/Flamework";
import SearchSingleton from "@Easy/Core/Shared/MainMenu/Components/Search/SearchSingleton";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { SetTimeout } from "@Easy/Core/Shared/Util/Timer";
import { DecodeJSON } from "@Easy/Core/Shared/json";
import { GamesDto } from "../../../Client/Components/HomePage/API/GamesAPI";
import SortComponent from "../../../Client/Components/HomePage/Sort/SortComponent";
import { SortId } from "../../../Client/Components/HomePage/Sort/SortId";
import { MainMenuBlockSingleton } from "../../../Client/ProtectedControllers//Settings/MainMenuBlockSingleton";
import DateParser from "../../DateParser";
import MainMenuPageComponent from "./MainMenuPageComponent";

export default class HomePageComponent extends MainMenuPageComponent {
	public mainContent!: Transform;
	public spacerPrefab!: GameObject;
	public sortPrefab!: GameObject;
	public scrollRect!: ScrollRect;
	private bin = new Bin();
	private sorts = new Map<SortId, SortComponent>();
	// private loadedGameComponents: HomePageGameComponent[] = [];

	protected Awake(): void {
		this.animateInDuration = 0;
	}

	override OpenPage(params?: unknown): void {
		super.OpenPage(params);
		this.ClearSorts();
		this.CreateSort(SortId.RecentlyUpdated, "Recently Updated");
		this.CreateSort(SortId.Popular, "Popular");
		Bridge.UpdateLayout(this.scrollRect.transform, true);
		task.spawn(() => {
			this.FetchGames();
		});

		const platform = AirshipPlatformUtil.GetLocalPlatform();
		if (platform === AirshipPlatform.Windows) {
			this.scrollRect.scrollSensitivity = 22;
		}
	}

	private ClearSorts(): void {
		//Release pooled game cards
		// for (let i = 0; i < this.loadedGameComponents.size(); i++) {
		// 	PoolManager.ReleaseObject(this.loadedGameComponents[i].gameObject);
		// }
		// this.loadedGameComponents.clear();

		//Destroy the sort containers
		let toRemove: Transform[] = [];
		for (let i = 0; i < this.mainContent.GetChildCount(); i++) {
			toRemove.push(this.mainContent.GetChild(i));
		}
		for (const t of toRemove) {
			Object.Destroy(t.gameObject);
		}
	}

	private CreateSort(sortId: SortId, title: string): void {
		const sortGo = Object.Instantiate(this.sortPrefab, this.mainContent) as GameObject;
		const sortComponent = sortGo.GetAirshipComponent<SortComponent>()!;
		sortComponent.SetTitle(title);
		sortComponent.pageScrollRect = this.scrollRect;
		this.sorts.set(sortId, sortComponent);
	}

	private CreateSpacer(): void {
		const go = Object.Instantiate(this.spacerPrefab, this.mainContent);
	}

	public FetchGames(): void {
		const res = InternalHttpManager.GetAsync(AirshipUrl.ContentService + "/games");
		if (!res.success) {
			// warn("Failed to fetch games. Retrying in 1s..");
			this.bin.Add(
				SetTimeout(1, () => {
					this.FetchGames();
				}),
			);
			return;
		}

		const data = DecodeJSON<GamesDto>(res.data);
		// print("Games data: " + inspect(data));

		let sorts: SortId[];
		sorts = ObjectUtils.keys(this.sorts);

		const blockSingleton = Dependency<MainMenuBlockSingleton>();
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

			sortComponent.SetGames(games);
		}

		task.spawn(() => {
			Dependency<SearchSingleton>().AddGames([...data.recentlyUpdated, ...data.popular]);
		});
	}

	override OnDisable(): void {
		this.bin.Clean();
	}

	public override OnDestroy(): void {
		this.bin.Clean();
	}
}
