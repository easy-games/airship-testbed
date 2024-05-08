import { Keyboard } from "../UserInput";
export declare class AppManager {
    /** Global mouse instance. */
    private static mouse;
    /** Global keyboard instance. */
    static keyboard: Keyboard;
    private static opened;
    private static stack;
    private static backgroundCanvas;
    private static backgroundObject;
    private static backgroundCanvasGroup;
    private static darkBackgroundTransitionBin;
    static Init(): void;
    static OpenCustom(onClose: () => void, config?: {
        darkBackground?: boolean;
        darkBackgroundSortingOrder?: number;
        addToStack?: boolean;
    }): void;
    /**
     * Open a Canvas. Any other `AppManager` owned UIDocument will be immediately closed.
     * @param element A GameObject with a `Canvas` component.
     */
    static Open(canvas: Canvas, config?: {
        noOpenSound?: boolean;
        onClose?: () => void;
        noDarkBackground?: boolean;
        addToStack?: boolean;
        sortingOrderOffset?: number;
    }): void;
    static OpenDarkBackground(sortOrder: number): void;
    static CloseDarkBackground(): void;
    static Close(config?: {
        noCloseSound?: boolean;
    }): void;
}
