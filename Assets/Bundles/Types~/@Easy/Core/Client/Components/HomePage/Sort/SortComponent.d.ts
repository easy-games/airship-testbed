/// <reference types="@easy-games/compiler-types" />
import { GameDto } from "../API/GamesAPI";
export default class SortComponent extends AirshipBehaviour {
    titleText: GameObject;
    content: Transform;
    gamePrefab: GameObject;
    pageScrollRect?: ScrollRect;
    gridLayoutGroup: GridLayoutGroup;
    layoutElement: LayoutElement;
    private bin;
    Awake(): void;
    OnEnable(): void;
    OnDisable(): void;
    Start(): void;
    OnDestroy(): void;
    Init(title: string): void;
    Clear(): void;
    UpdatePreferredHeight(): void;
    SetGames(games: GameDto[]): void;
    SetTitle(title: string): void;
}
