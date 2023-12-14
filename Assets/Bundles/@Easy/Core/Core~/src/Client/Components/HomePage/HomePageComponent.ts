import inspect from "@easy-games/unity-inspect";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { Bin } from "Shared/Util/Bin";
import { SetTimeout } from "Shared/Util/Timer";
import { decode } from "Shared/json";
import { GamesDto } from "./API/GamesAPI";
import SortComponent from "./Sort/SortComponent";
import { SortId } from "./Sort/SortId";

export default class HomePageComponent extends AirshipBehaviour {
	public mainContent!: Transform;
	public spacerPrefab!: GameObject;
	public sortPrefab!: GameObject;
	private bin = new Bin();
	private sorts = new Map<SortId, SortComponent>();

	override OnEnabled(): void {
		print("mainContent: " + this.mainContent);
		let toRemove: Transform[] = [];
		for (let i = 1; i < this.mainContent.GetChildCount(); i++) {
			toRemove.push(this.mainContent.GetChild(i));
		}
		for (const t of toRemove) {
			Object.Destroy(t.gameObject);
		}
		this.CreateSort(SortId.POPULAR, "Popular", "featured");

		this.FetchGames();
	}

	private CreateSort(sortId: SortId, title: string, backendName: string): void {
		const sortGo = Object.Instantiate(this.sortPrefab, this.mainContent) as GameObject;
		const sortComponent = sortGo.GetComponent<SortComponent>();
		sortComponent.SetTitle(title);
		this.sorts.set(sortId, sortComponent);
	}

	public FetchGames(): void {
		const res = InternalHttpManager.GetAsync(AirshipUrl.ContentService + "/games");
		if (!res.success) {
			warn("Failed to fetch games. Retrying in 1s..");
			this.bin.Add(
				SetTimeout(1, () => {
					this.FetchGames();
				}),
			);
			return;
		}

		const data = decode<GamesDto>(res.data);
		print("Games data: " + inspect(data));

		// Popular
		{
			const sortComponent = this.sorts.get(SortId.POPULAR)!;
			sortComponent.SetGames(data.featured);
		}
	}

	OnDisabled(): void {
		print("HomePageComponent.OnDisable");
		this.bin.Clean();
	}

	public OnDestroy(): void {
		this.bin.Clean();
	}
}
