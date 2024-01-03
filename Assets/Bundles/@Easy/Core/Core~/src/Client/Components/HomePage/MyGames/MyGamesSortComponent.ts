import inspect from "@easy-games/unity-inspect";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { Bin } from "Shared/Util/Bin";
import { SetTimeout } from "Shared/Util/Timer";
import { DecodeJSON } from "Shared/json";
import { MyGamesDto } from "../API/GamesAPI";
import SortComponent from "../Sort/SortComponent";

export default class MyGamesSortComponent extends AirshipBehaviour {
	private sort!: SortComponent;
	private bin = new Bin();

	public override Awake(): void {
		print("MyGames.OnAwake");
		this.sort = this.gameObject.GetComponent<SortComponent>();
		print("sort: " + this.sort);
	}

	public override OnEnable(): void {
		this.sort.Clear();
		this.FetchGames();
	}

	public FetchGames(): void {
		const res = InternalHttpManager.GetAsync(AirshipUrl.ContentService + "/memberships/games/self");
		if (!res.success) {
			warn("Failed to fetch my games. Retrying in 1s..");
			this.bin.Add(
				SetTimeout(1, () => {
					this.FetchGames();
				}),
			);
			return;
		}

		const data = DecodeJSON<MyGamesDto>(res.data);
		print("My games: " + inspect(data));

		this.sort.SetGames(data);
	}

	override Start(): void {
		this.sort.Init("My Games");
	}

	public OnDisable(): void {
		this.bin.Clean();
	}

	override OnDestroy(): void {}
}
