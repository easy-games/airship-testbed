import { Dependency } from "@Easy/Core/Shared/Flamework";
import SearchSingleton from "@Easy/Core/Shared/MainMenu/Components/Search/SearchSingleton";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import SortComponent from "../Sort/SortComponent";

/** @internal */
export default class MyGamesSortComponent extends AirshipBehaviour {
	@Tooltip("If true this sort automatically fetches games.")
	public fetchMyGames = true;
	@HideInInspector()
	public sort!: SortComponent;
	private bin = new Bin();

	public override Awake(): void {
		this.sort = this.gameObject.GetAirshipComponent<SortComponent>()!;
	}

	public override OnEnable(): void {
		this.sort.Clear();
		task.spawn(() => {
			const search = Dependency<SearchSingleton>();
			if (this.fetchMyGames) {
				search.FetchMyGames();
			}
			this.sort.SetGames(search.myGames, 0);
		});
	}

	override Start(): void {
		this.sort.Init("My Games");
	}

	public OnDisable(): void {
		this.bin.Clean();
	}

	override OnDestroy(): void {}
}
