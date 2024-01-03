import { Dependency } from "@easy-games/flamework-core";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { Keyboard } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { Signal } from "Shared/Util/Signal";
import { ProximityPromptController } from "./ProximityPromptController";

export interface ProximityPromptData {
	/** Proximity prompt position. */
	promptPosition: Vector3;
	/** Key that activates proximity prompt. */
	activationKey: KeyCode;
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
	public onActivated = new Signal<void>();
	/** On activated signal. */
	public onRequestActivated = new Signal<void>();

	private canActivate = false;
	private readonly canActivateBin = new Bin();

	constructor(promptData: ProximityPromptData) {
		this.promptPrefab = AssetBridge.Instance.LoadAsset(
			"@Easy/Core/Client/Resources/Prefabs/ProximityPrompt.prefab",
		);
		this.id = tostring(ProximityPrompt.idCounter++);
		this.data = promptData;
		this.CreatePrompt();
	}

	/** Creates prompt from prompt data. */
	private CreatePrompt(): void {
		this.promptGameObject = GameObjectUtil.InstantiateAt(
			this.promptPrefab,
			this.data.promptPosition,
			Quaternion.identity,
		);
		// Prompt starts inactive.
		this.promptGameObject.SetActive(false);
		// Set activation key, action, and object text.
		const keyCode = this.promptGameObject.transform
			.Find("Canvas/Background/KeyCodeBackground/KeyCode")!
			.GetComponent<TextMeshProUGUI>();
		const textWrapper = this.promptGameObject.transform.Find("Canvas/Background/TextWrapper")!;
		const bottomText = textWrapper.FindChild("BottomText")!.GetComponent<TextMeshProUGUI>();
		const topText = textWrapper.FindChild("TopText")!.GetComponent<TextMeshProUGUI>();
		keyCode.text = this.data.activationKeyString;
		bottomText.text = this.data.bottomText;
		topText.text = this.data.topText;
		Dependency<ProximityPromptController>().RegisterProximityPrompt(this);
	}

	public SetCanActivate(canActivate: boolean) {
		if (this.canActivate === canActivate) return;
		this.canActivate = true;
		if (canActivate) {
			const keyboard = this.canActivateBin.Add(new Keyboard());
			keyboard.OnKeyDown(this.data.activationKey, (event) => {
				if (event.uiProcessed) return;
				this.onRequestActivated.Fire();
			});
		} else {
			this.canActivateBin.Clean();
		}
	}

	/** Called when prompt activates. */
	public ActivatePrompt(): void {
		this.onActivated.Fire();
	}
}
