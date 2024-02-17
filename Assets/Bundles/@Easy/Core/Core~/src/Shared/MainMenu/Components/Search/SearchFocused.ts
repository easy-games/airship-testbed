import { GameDto } from "@Easy/Core/Client/Components/HomePage/API/GamesAPI";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Levenshtein } from "@Easy/Core/Shared/Types/Levenshtein";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { OnFixedUpdate } from "@Easy/Core/Shared/Util/Timer";
import GameSearchResult from "./GameSearchResult";
import { SearchResultDto } from "./SearchAPI";
import SearchResult from "./SearchResult";
import SearchSingleton from "./SearchSingleton";

export default class SearchFocused extends AirshipBehaviour {
	public inputField!: TMP_InputField;
	public resultsWrapper!: Transform;
	public background!: GameObject;

	@Header("Prefabs")
	public gameResultPrefab!: GameObject;

	public queryInputDelay = 0.1;
	public queryCooldown = 0.1;

	private lastQueryTime = 0;
	private lastInputTime = 0;
	private inputDirty = false;

	private index = 0;
	private activeResult: SearchResult | undefined;

	private bin = new Bin();

	public OnEnable(): void {
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
		this.resultsWrapper.gameObject.ClearChildren();

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
					this.Query();
				}
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.background, () => {
				AppManager.Close();
			}),
		);

		const keyboard = new Keyboard();
		this.bin.Add(keyboard);

		keyboard.OnKeyDown(KeyCode.UpArrow, () => {
			this.SetIndex(this.index - 1);
		});
		keyboard.OnKeyDown(KeyCode.DownArrow, (event) => {
			this.SetIndex(this.index + 1);
		});
		keyboard.OnKeyDown(KeyCode.Return, () => {
			this.activeResult?.OnSubmit();
		});

		this.Query();
	}

	private SetIndex(index: number): void {
		const resultCount = this.resultsWrapper.childCount;
		if (resultCount === 0) return;

		if (index < 0) {
			index = math.max(resultCount - 1, 0);
		} else if (index >= resultCount) {
			index = 0;
		}
		this.index = index;

		if (this.activeResult) {
			this.activeResult.SetActive(false);
		}

		if (this.index >= resultCount) return;

		const searchResult = this.resultsWrapper
			.GetChild(this.index)
			.gameObject.GetAirshipComponent<GameSearchResult>();
		searchResult?.SetActive(true);
		this.activeResult = searchResult;
		searchResult!.gameObject.name = "selectedResult";
	}

	public Query(): void {
		let text = this.inputField.text;

		const search = Dependency<SearchSingleton>();
		let allGames = [...search.games];

		let games = new Array<GameDto>();
		for (const gameDto of allGames) {
			const fullUsername = `${gameDto.name.lower()}`;
			if (fullUsername.find(text.lower(), 1, true)[0] !== undefined) {
				games.push(gameDto);
			}
		}

		if (text === "") {
			games.sort((g1, g2) => (g1.liveStats?.playerCount ?? 0) > (g2.liveStats?.playerCount ?? 0));
		} else {
			games.sort((g1, g2) => Levenshtein(`${g1.name.lower()}`, text) < Levenshtein(`${g2.name.lower()}`, text));
		}

		let results: SearchResultDto[] = games.map((g) => {
			return {
				game: g,
			};
		});
		this.RenderResults(results);
	}

	private RenderResults(searchResults: SearchResultDto[]): void {
		this.resultsWrapper.gameObject.ClearChildren();
		for (let i = 0; i < searchResults.size(); i++) {
			let searchResult = searchResults[i];
			const go = Object.Instantiate(this.gameResultPrefab, this.resultsWrapper);

			const searchResultComp = go.GetAirshipComponent<GameSearchResult>()!;
			searchResultComp.Init(searchResult);
		}
		// todo: idk why this only works with arbitrary delay...
		task.delay(0.04, () => {
			this.SetIndex(this.index);
		});
	}

	public OnDisable(): void {
		this.bin.Clean();
		this.activeResult = undefined;
		this.index = 0;
	}
}
