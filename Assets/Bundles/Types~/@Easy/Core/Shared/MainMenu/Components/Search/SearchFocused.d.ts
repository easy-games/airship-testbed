/// <reference types="compiler-types" />
export default class SearchFocused extends AirshipBehaviour {
    inputField: TMP_InputField;
    resultsWrapper: Transform;
    background: GameObject;
    cancelButton: Button;
    content: RectTransform;
    gameResultPrefab: GameObject;
    noResultsPrefab: GameObject;
    queryInputDelay: number;
    queryCooldown: number;
    private lastQueryTime;
    private lastInputTime;
    private inputDirty;
    private index;
    private resultsCount;
    private activeResult;
    private queryId;
    private bin;
    OnEnable(): void;
    private SetIndex;
    Query(): void;
    private RenderResults;
    OnDisable(): void;
}
