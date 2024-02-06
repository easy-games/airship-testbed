import MainMenuPageComponent from "../../MainMenuControllers/MainMenuPageComponent";
export default class HomePageComponent extends MainMenuPageComponent {
    mainContent: Transform;
    spacerPrefab: GameObject;
    sortPrefab: GameObject;
    scrollRect: ScrollRect;
    private bin;
    private sorts;
    OpenPage(): void;
    private ClearSorts;
    private CreateSort;
    FetchGames(): void;
    OnDisable(): void;
    OnDestroy(): void;
}
