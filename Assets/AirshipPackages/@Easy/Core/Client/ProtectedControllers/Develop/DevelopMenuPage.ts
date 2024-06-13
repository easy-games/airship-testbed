import { Dependency } from "@Easy/Core/Shared/Flamework";
import MainMenuPageComponent from "@Easy/Core/Shared/MainMenu/Components/MainMenuPageComponent";
import SearchSingleton from "@Easy/Core/Shared/MainMenu/Components/Search/SearchSingleton";

export default class DevelopMenuPage extends MainMenuPageComponent {
    public myGamesView!: GameObject;
    public myGamesSortGo!: GameObject;
    public devIntroView!: GameObject;

    public Start(): void {
        const search = Dependency<SearchSingleton>();
		search.FetchMyGames();

        if (search.games.size() === 0) {
            this.DisplayDevIntroView();
        } else {
            this.DisplayMyGamesView();
        }
    }

    private DisplayDevIntroView() {
        this.devIntroView.SetActive(true);
        this.myGamesView.SetActive(false);
    }

    private DisplayMyGamesView() {
        this.devIntroView.SetActive(false);
        this.myGamesView.SetActive(true);
    }
}