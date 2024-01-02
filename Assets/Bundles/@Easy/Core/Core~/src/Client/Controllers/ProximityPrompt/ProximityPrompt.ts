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
	public static IdCounter = 0;
	/** Proximity prompt prefab. */
	private promptPrefab: Object;
	/** Proximity prompt id. */
	public Id: string;
	/** Proximity prompt data. */
	public Data: ProximityPromptData;
	/** Proximity prompt gameobject. */
	public PromptGameObject: GameObject | undefined;
	/** On activated signal. */
	public OnActivated = new Signal<void>();
	/** On activated signal. */
	public OnRequestActivated = new Signal<void>();

	private canActivate = false;
	private readonly canActivateBin = new Bin();

	constructor(promptData: ProximityPromptData) {
		this.promptPrefab = AssetBridge.Instance.LoadAsset(
			"@Easy/Core/Client/Resources/Prefabs/ProximityPrompt.prefab",
		);
		this.Id = tostring(ProximityPrompt.IdCounter++);
		this.Data = promptData;
		this.CreatePrompt();
	}

	/** Creates prompt from prompt data. */
	private CreatePrompt(): void {
		this.PromptGameObject = GameObjectUtil.InstantiateAt(
			this.promptPrefab,
			this.Data.promptPosition,
			Quaternion.identity,
		);
		// Prompt starts inactive.
		this.PromptGameObject.SetActive(false);
		// Set activation key, action, and object text.
		const keyCode = this.PromptGameObject.transform
			.Find("Canvas/Background/KeyCodeBackground/KeyCode")!
			.GetComponent<TextMeshProUGUI>();
		const textWrapper = this.PromptGameObject.transform.Find("Canvas/Background/TextWrapper")!;
		const bottomText = textWrapper.FindChild("BottomText")!.GetComponent<TextMeshProUGUI>();
		const topText = textWrapper.FindChild("TopText")!.GetComponent<TextMeshProUGUI>();
		keyCode.text = this.Data.activationKeyString;
		bottomText.text = this.Data.bottomText;
		topText.text = this.Data.topText;
		Dependency<ProximityPromptController>().RegisterProximityPrompt(this);
	}

	public SetCanActivate(canActivate: boolean) {
		if (this.canActivate === canActivate) return;
		this.canActivate = true;
		if (canActivate) {
			const keyboard = this.canActivateBin.Add(new Keyboard());
			keyboard.OnKeyDown(this.Data.activationKey, (event) => {
				if (event.uiProcessed) return;
				this.OnRequestActivated.Fire();
			});
		} else {
			this.canActivateBin.Clean();
		}
	}

	/** Called when prompt activates. */
	public ActivatePrompt(): void {
		this.OnActivated.Fire();
	}
}
