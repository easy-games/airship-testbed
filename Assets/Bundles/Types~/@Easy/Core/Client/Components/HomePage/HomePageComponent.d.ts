/// <reference types="@easy-games/compiler-types" />
export default class HomePageComponent extends AirshipBehaviour {
    MainContent: Transform;
    SpacerPrefab: GameObject;
    SortPrefab: GameObject;
    private bin;
    private sorts;
    OnEnabled(): void;
    private ClearSorts;
    private CreateSort;
    FetchGames(): void;
    OnDisabled(): void;
    OnDestroy(): void;
}
