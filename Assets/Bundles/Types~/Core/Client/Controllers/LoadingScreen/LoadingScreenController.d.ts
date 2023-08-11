import { OnStart } from "@easy-games/flamework-core";
export declare class LoadingScreenController implements OnStart {
    private coreLoadingScreen;
    constructor();
    private CheckWorld;
    private CheckCharacter;
    OnStart(): void;
    /**
     * Sets the current fill of the progress bar.
     * @param step
     * @param progress Value from 0-100.
     */
    SetProgress(step: string, progress: number): void;
    FinishLoading(): void;
}
