/// <reference types="@easy-games/compiler-types" />
export default class SearchFocused extends AirshipBehaviour {
    inputField: TMP_InputField;
    resultsWrapper: Transform;
    background: GameObject;
    gameResultPrefab: GameObject;
    queryInputDelay: number;
    queryCooldown: number;
    private lastQueryTime;
    private lastInputTime;
    private inputDirty;
    private index;
    private activeResult;
    private bin;
    OnEnable(): void;
    private SetIndex;
    Query(): void;
    private RenderResults;
    OnDisable(): void;
}
