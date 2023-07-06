import { ClientSignals } from "Client/ClientSignals";
import { GameObjectBridge } from "Shared/GameObjectBridge";
import { Signal } from "Shared/Util/Signal";

export interface ProximityPromptData {
	/** Proximity prompt position. */
	promptPosition: Vector3;
	/** Key that activates proximity prompt. */
	activationKey: Key;
	/** Activation key string that displays on prompt. */
	activationKeyString: string;
	/** How close local player must be to activate proximity prompt. */
	activationRange: number;
	/** Proximity prompt top text. */
	topText: string;
	/** Proximity prompt bottom text. */
	bottomText: string;
}

/** Proximity Prompt. */
export class ProximityPrompt {
	/** Global, incrementing id counter. */
	public static idCounter = 0;
	/** Proximity prompt prefab. */
	private promptPrefab: Object;
	/** Proximity prompt id. */
	public id: string;
	/** Proximity prompt data. */
	public data: ProximityPromptData;
	/** Proximity prompt gameobject. */
	public promptGameObject: GameObject | undefined;
	/** On activated signal. */
	public OnActivated = new Signal<void>();

	constructor(promptData: ProximityPromptData) {
		this.promptPrefab = AssetBridge.LoadAsset("Client/Resources/Prefabs/ProximityPrompt.prefab");
		this.id = tostring(ProximityPrompt.idCounter++);
		this.data = promptData;
		this.CreatePrompt();
	}

	/** Creates prompt from prompt data. */
	private CreatePrompt(): void {
		this.promptGameObject = GameObjectBridge.InstantiateAt(
			this.promptPrefab,
			this.data.promptPosition,
			Quaternion.identity,
		);
		/* Prompt starts inactive. */
		this.promptGameObject.SetActive(false);
		/* Set activation key, action, and object text. */
		const keyCode = this.promptGameObject.transform
			.Find("Canvas/Background/KeyCodeBackground/KeyCode")!
			.GetComponent<TextMeshProUGUI>();
		const textWrapper = this.promptGameObject.transform.Find("Canvas/Background/TextWrapper")!;
		const bottomText = textWrapper.FindChild("BottomText")!.GetComponent<TextMeshProUGUI>();
		const topText = textWrapper.FindChild("TopText")!.GetComponent<TextMeshProUGUI>();
		keyCode.text = this.data.activationKeyString;
		bottomText.text = this.data.bottomText;
		topText.text = this.data.topText;
		/* Notify `ProximityPromptController` that prompt was created. */
		ClientSignals.ProximityPromptCreated.Fire({ prompt: this });
	}

	/** Called when prompt activates. */
	public ActivatePrompt(): void {
		this.OnActivated.Fire();
	}
}
