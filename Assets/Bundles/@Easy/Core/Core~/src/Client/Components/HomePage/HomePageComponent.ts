import { Dependency } from "@Easy/Core/Shared/Flamework";
import SearchSingleton from "@Easy/Core/Shared/MainMenu/Components/Search/SearchSingleton";
import ObjectUtils from "@easy-games/unity-object-utils";
import MainMenuPageComponent from "Client/MainMenuControllers/MainMenuPageComponent";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { Bin } from "Shared/Util/Bin";
import { SetTimeout } from "Shared/Util/Timer";
import { DecodeJSON } from "Shared/json";
import { GamesDto } from "./API/GamesAPI";
import SortComponent from "./Sort/SortComponent";
import { SortId } from "./Sort/SortId";
import HomePageGameComponent from "./Sort/HomePageGameComponent";

export default class HomePageComponent extends MainMenuPageComponent {
	public mainContent!: Transform;
	public spacerPrefab!: GameObject;
	public sortPrefab!: GameObject;
	public scrollRect!: ScrollRect;
	private bin = new Bin();
	private sorts = new Map<SortId, SortComponent>();
	private loadedGameComponents: HomePageGameComponent[] = [];

	override OpenPage(): void {
		super.OpenPage();
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
		for (let i = 0; i < this.loadedGameComponents.size(); i++) {
			PoolManager.ReleaseObject(this.loadedGameComponents[i].gameObject);
		}

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

		for (let sortId of sorts) {
			const sortComponent = this.sorts.get(sortId)!;

			let games = data[sortId].filter((g) => g.lastVersionUpdate !== undefined);
			sortComponent.SetGames(games);
			this.loadedGameComponents = [...this.loadedGameComponents, ...sortComponent.SetGames(games)];
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
