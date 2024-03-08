import { SearchResultDto } from "./SearchAPI";
import SearchResult from "./SearchResult";
export default class GameSearchResult extends SearchResult {
    gameImage: Image;
    gameName: TMP_Text;
    gameText: TMP_Text;
    list: RectTransform;
    titlePadding: RectTransform;
    OnEnable(): void;
    OnDisable(): void;
    Init(searchResult: SearchResultDto): void;
    UpdateDescriptionText(searchResult: SearchResultDto): void;
    OnSubmit(): void;
}
