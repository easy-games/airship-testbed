import { Dependency } from "@Easy/Core/Shared/Flamework";
import SearchSingleton from "@Easy/Core/Shared/MainMenu/Components/Search/SearchSingleton";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import SortComponent from "../Sort/SortComponent";

export default class MyGamesSortComponent extends AirshipBehaviour {
	private sort!: SortComponent;
	private bin = new Bin();

	public override Awake(): void {
		this.sort = this.gameObject.GetAirshipComponent<SortComponent>()!;
	}

	public override OnEnable(): void {
		this.sort.Clear();
		task.spawn(() => {
			this.FetchGames();
		});
	}

	public FetchGames(): void {
		const search = Dependency<SearchSingleton>();
		search.FetchMyGames();
		this.sort.SetGames(search.myGames);
	}

	override Start(): void {
		this.sort.Init("My Games");
	}

	public OnDisable(): void {
		this.bin.Clean();
	}

	override OnDestroy(): void {}
}
