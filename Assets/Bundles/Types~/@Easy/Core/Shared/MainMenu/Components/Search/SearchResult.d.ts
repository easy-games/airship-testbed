/// <reference types="compiler-types" />
import { Bin } from "../../../Util/Bin";
import { SearchResultDto } from "./SearchAPI";
export default class SearchResult extends AirshipBehaviour {
    submitButton: GameObject;
    bgImage: Image;
    protected bin: Bin;
    active: boolean;
    searchResult: SearchResultDto;
    Start(): void;
    OnEnable(): void;
    protected MarkAsLoading(): void;
    OnSubmit(): void;
    Init(searchResult: SearchResultDto): void;
    SetActive(active: boolean): void;
    OnDisable(): void;
    OnDestroy(): void;
}
