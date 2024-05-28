import { GameDto } from "@Easy/Core/Client/Components/HomePage/API/GamesAPI";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { MobileGameList } from "@Easy/Core/Shared/Util/MobileGameList";
import { OnFixedUpdate, OnLateUpdate } from "@Easy/Core/Shared/Util/Timer";
import { DecodeJSON } from "@Easy/Core/Shared/json";
import { MainMenuSingleton } from "../../Singletons/MainMenuSingleton";
import GameSearchResult from "./GameSearchResult";
import { SearchResultDto } from "./SearchAPI";
import SearchResult from "./SearchResult";
import SearchSingleton from "./SearchSingleton";

export default class SearchFocused extends AirshipBehaviour {
	@Header("References")
	public inputField!: TMP_InputField;
	public resultsWrapper!: Transform;
	public background!: GameObject;
	public cancelButton!: Button;
	public content!: RectTransform;

	@Header("Prefabs")
	public gameResultPrefab!: GameObject;
	public noResultsPrefab!: GameObject;

	@Header("Variables")
	public queryInputDelay = 0.1;
	public queryCooldown = 0.1;

	private lastQueryTime = 0;
	private lastInputTime = 0;
	private inputDirty = false;

	private index = 0;
	private resultsCount = 0;
	private activeResult: SearchResult | undefined;

	private queryId = 0;

	private bin = new Bin();

	public OnEnable(): void {
		const rect = this.transform as RectTransform;
		if (Game.IsPortrait()) {
			rect.offsetMax = new Vector2(0, -Game.GetNotchHeight());
		}

		this.bin.Add(
			Dependency<MainMenuSingleton>().ObserveScreenSize((st, size) => {
				if (st === "lg") {
					this.content.offsetMin = new Vector2(250, this.content.offsetMin.y);
					this.content.offsetMax = new Vector2(-180, this.content.offsetMax.y);
				} else if (st === "md") {
					this.content.offsetMin = new Vector2(50, this.content.offsetMin.y);
					this.content.offsetMax = new Vector2(0, this.content.offsetMax.y);
				} else {
					this.content.offsetMin = new Vector2(Game.IsInGame() ? 50 : 0, this.content.offsetMin.y);
					this.content.offsetMax = new Vector2(0, this.content.offsetMax.y);
				}
			}),
		);

		this.resultsWrapper.gameObject.ClearChildren();
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnValueChangeEvent(this.inputField.gameObject, () => {
				this.lastInputTime = Time.time;
				this.inputDirty = true;
			}),
		);
		this.inputField.text = "";
		task.delay(0, () => {
			this.inputField.Select();
		});

		this.bin.Add(
			OnFixedUpdate.Connect(() => {
				const now = Time.time;
				if (
					this.inputDirty &&
					now - this.lastInputTime > this.queryInputDelay &&
					now - this.lastQueryTime > this.queryCooldown
				) {
					this.inputDirty = false;
					this.lastQueryTime = now;
					task.spawn(() => {
						this.Query();
					});
				}
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.background, () => {
				AppManager.Close();
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.cancelButton.gameObject, () => {
				AppManager.Close();
			}),
		);

		const keyboard = new Keyboard();
		this.bin.Add(keyboard);

		keyboard.OnKeyDown(Key.UpArrow, () => {
			this.SetIndex(this.index - 1);
		});
		keyboard.OnKeyDown(Key.DownArrow, (event) => {
			this.SetIndex(this.index + 1);
		});
		keyboard.OnKeyDown(Key.Enter, () => {
			this.activeResult?.OnSubmit();
		});

		task.spawn(() => {
			this.Query();
		});
	}

	private SetIndex(index: number): void {
		if (this.resultsCount === 0) return;

		if (index < 0) {
			index = math.max(this.resultsCount - 1, 0);
		} else if (index >= this.resultsCount) {
			index = 0;
		}
		this.index = index;

		if (this.activeResult) {
			this.activeResult.SetActive(false);
		}

		if (this.index >= this.resultsCount) return;

		const searchResultGo = this.resultsWrapper.GetChild(this.index).gameObject;
		const searchResult = searchResultGo.GetAirshipComponent<GameSearchResult>();
		if (searchResult) {
			searchResult.SetActive(true);
		}
		this.activeResult = searchResult;
	}

	public Query(): void {
		let text = this.inputField.text;

		this.queryId++;
		let thisQuery = this.queryId;
		const res = InternalHttpManager.GetAsync(AirshipUrl.ContentService + "/games/autocomplete?name=" + text);
		if (thisQuery !== this.queryId) return;
		let games: GameDto[];
		if (res.success) {
			games = DecodeJSON<GameDto[]>(res.data);
			if (games.size() === 0) {
				games = [...Dependency<SearchSingleton>().games];
			}
		} else {
			Debug.LogError("Search error: " + res.error);
			games = [...Dependency<SearchSingleton>().games];
		}

		if (!Game.IsEditor() && Game.IsMobile()) {
			games = games.filter((g) => MobileGameList.includes(g.id));
		}

		this.activeResult = undefined;

		// const search = Dependency<SearchSingleton>();
		// let allGames = [...search.games];

		// let games = new Array<GameDto>();
		// for (const gameDto of allGames) {
		// 	const fullUsername = `${gameDto.name.lower()}`;
		// 	if (fullUsername.find(text.lower(), 1, true)[0] !== undefined) {
		// 		games.push(gameDto);
		// 	}
		// }

		// if (text === "") {
		// 	games.sort((g1, g2) => (g1.liveStats?.playerCount ?? 0) > (g2.liveStats?.playerCount ?? 0));
		// } else {
		// 	games.sort((g1, g2) => JaroDistance(`${g1.name.lower()}`, text) < JaroDistance(`${g2.name.lower()}`, text));
		// }

		let results: SearchResultDto[] = games.map((g) => {
			return {
				game: g,
			};
		});
		this.resultsCount = results.size();
		this.RenderResults(text, results);
	}

	private RenderResults(searchTerm: string, searchResults: SearchResultDto[]): void {
		this.resultsWrapper.gameObject.ClearChildren();

		if (searchResults.size() === 0) {
			// no results
			const go = Object.Instantiate(this.noResultsPrefab, this.resultsWrapper);
			const text = go.transform.GetChild(0).GetComponent<TMP_Text>()!;
			text.text = `${searchTerm}   <color=#A2A2A2>-   No results</color>`;
			return;
		}

		for (let i = 0; i < searchResults.size(); i++) {
			let searchResult = searchResults[i];
			const go = Object.Instantiate(this.gameResultPrefab, this.resultsWrapper);
			if (searchResult.game) {
				go.name = searchResult.game.name;
			}

			const searchResultComp = go.GetAirshipComponent<GameSearchResult>()!;
			searchResultComp.Init(searchResult);
		}
		OnLateUpdate.Once(() => {
			this.SetIndex(0);
		});
	}

	public OnDisable(): void {
		this.bin.Clean();
		this.activeResult = undefined;
		this.index = 0;
	}
}
