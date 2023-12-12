/// <reference types="@easy-games/compiler-types" />
export default class HomePageComponent extends AirshipBehaviour {
    mainContent: Transform;
    spacerPrefab: GameObject;
    sortPrefab: GameObject;
    private bin;
    private sorts;
    OnEnabled(): void;
    private CreateSort;
    FetchGames(): void;
    OnDisabled(): void;
}
