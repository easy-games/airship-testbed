import { CoreNetwork } from "Shared/CoreNetwork";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { BodyAttachment } from "./Accessory/BodyAttachment";
import { baseCharacters } from "./BaseCharacters";
import { CharacterDefinition } from "./CharacterDefinition";

export class CharacterBuilder {
	private static readonly prefabCache = new Map<string, GameObject>();

	constructor(
		private readonly clientId: number | undefined,
		private readonly characterGameObject: GameObject,
		private readonly characterDef: CharacterDefinition,
	) {}

	public Build() {
		if (!RunUtil.IsServer()) {
			error("Server only API.");
		}

		// Get character model prefab:
		const assetPath = baseCharacters[this.characterDef.BaseCharacter];
		let characterModelPrefab: GameObject;
		if (CharacterBuilder.prefabCache.has(assetPath)) {
			characterModelPrefab = CharacterBuilder.prefabCache.get(assetPath)!;
		} else {
			characterModelPrefab = AssetBridge.LoadAsset<GameObject>(assetPath);
			CharacterBuilder.prefabCache.set(assetPath, characterModelPrefab);
		}

		const existingCharacterModel = this.characterGameObject.transform.Find("CharacterModel");
		if (existingCharacterModel) {
			Object.Destroy(existingCharacterModel);
		}

		// Instantiate character model into root character game object:
		const characterModel = GameObjectUtil.InstantiateIn(characterModelPrefab, this.characterGameObject.transform);
		characterModel.transform.name = "Character";
		characterModel.transform.position = characterModel.transform.position.add(new Vector3(0, -1.08, 0));

		// this.AddAttachment({
		// 	bone: HumanBodyBones.RightHand,
		// 	asset: "Shared/Resources/Prefabs/Items/DevSword.prefab",
		// });

		if (this.clientId !== undefined) {
			NetworkUtil.SpawnWithClientOwnership(characterModel, this.clientId);
			const nob = characterModel.GetComponent<NetworkObject>();
			CoreNetwork.ServerToClient.CharacterModelChanged.Server.FireClient(this.clientId, nob.ObjectId);
		} else {
			NetworkUtil.Spawn(characterModel);
		}
	}

	public AddAttachment(bodyAttachment: BodyAttachment): void {
		const prefab = AssetBridge.LoadAsset(bodyAttachment.asset);

		const boneTransform = this.characterGameObject.transform.Find(
			"CharacterModel/Character/character_rig/master_bone/lower_torso_bone/upper_torso_bone/upper_arm_bone.R/lower_arm_bone.R/hand_bone.R",
		)!;
		// print("bone transform: " + boneTransform.name);

		const go = Object.Instantiate(prefab, boneTransform);
	}
}
