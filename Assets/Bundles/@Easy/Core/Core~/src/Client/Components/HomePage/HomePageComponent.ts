import inspect from "@easy-games/unity-inspect";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { Bin } from "Shared/Util/Bin";
import { SetTimeout } from "Shared/Util/Timer";
import { decode } from "Shared/json";
import { GamesDto } from "./API/GamesAPI";
import SortComponent from "./Sort/SortComponent";
import { SortId } from "./Sort/SortId";

export default class HomePageComponent extends AirshipBehaviour {
	public mainContent!: GameObject;
	public spacerPrefab!: GameObject;
	public sortPrefab!: GameObject;
	public gamePrefab!: GameObject;
	private bin = new Bin();
	private sorts = new Map<SortId, SortComponent>();

	override OnStart(): void {
		print("HomePage.OnStart");

		let toRemove: Transform[] = [];
		print("mainContent: " + this.mainContent);
		for (let i = 1; i < this.mainContent.transform.GetChildCount(); i++) {
			toRemove.push(this.mainContent.transform.GetChild(i));
		}
		for (const t of toRemove) {
			Object.Destroy(t.gameObject);
		}

		this.CreateSort(SortId.POPULAR, "Popular", "featured");
	}

	private CreateSort(sortId: SortId, title: string, backendName: string): void {
		const sortGo = Object.Instantiate(this.sortPrefab, this.mainContent.transform) as GameObject;
		const sortComponent = sortGo.GetComponent<SortComponent>();
		sortComponent.SetTitle(title);
		this.sorts.set(sortId, sortComponent);
	}

	public FetchGames(): void {
		const res = InternalHttpManager.GetAsync(AirshipUrl.GameCoordinator + "/games");
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

	OnDestroy(): void {
		this.bin.Clean();
	}
}
