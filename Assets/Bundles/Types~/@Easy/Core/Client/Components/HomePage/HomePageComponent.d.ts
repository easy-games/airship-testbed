import MainMenuPageComponent from "../../MainMenuControllers/MainMenuPageComponent";
export default class HomePageComponent extends MainMenuPageComponent {
    mainContent: Transform;
    spacerPrefab: GameObject;
    sortPrefab: GameObject;
    scrollRect: ScrollRect;
    private bin;
    private sorts;
    private loadedGameComponents;
    OpenPage(params?: unknown): void;
    private ClearSorts;
    private CreateSort;
    private CreateSpacer;
    FetchGames(): void;
    OnDisable(): void;
    OnDestroy(): void;
}
