import { Controller, OnStart } from "@easy-games/flamework-core";
import ObjectUtil from "@easy-games/unity-object-utils";
import { CoreNetwork } from "Shared/CoreNetwork";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { GeneratorDto } from "Shared/Generator/GeneratorMeta";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { Layer } from "Shared/Util/Layer";
import { TimeUtil } from "Shared/Util/TimeUtil";

/** Generator item spawn offset. Items spawn _above_ generators and fall to the ground. */
const GENERATOR_ITEM_SPAWN_OFFSET = new Vector3(0, 2.25, 0);
/** Generator label offset. Labels are _above_ the item spawn location.*/
const GENERATOR_LABEL_OFFSET = new Vector3(0, 3, 0);

@Controller({})
export class GeneratorController implements OnStart {
	/** Generator item prefab. */
	private generatorItemPrefab: Object;
	/** Generator label prefab. */
	private generatorLabelPrefab: Object;
	/** Mapping of generator id to `GeneratorStateDto`. */
	private generatorMap = new Map<string, GeneratorDto>();
	/** Set of generators that require a spawn time reset. */
	private spawnResetGenerators = new Set<string>();
	/**
	 * Map of generators to stack root GameObject. Indicates whether or not client should delete
	 * generator dropped items.
	 */
	private stackedGenerators = new Map<string, GameObject>();
	/** Map of generators to text label components. */
	private generatorTextLabelMap = new Map<string, TextMeshProUGUI>();

	constructor() {
		/* Set up generator item collision rules. */
		Physics.IgnoreLayerCollision(Layer.CHARACTER, Layer.GENERATOR_ITEM);
		Physics.IgnoreLayerCollision(Layer.GENERATOR_ITEM, Layer.GENERATOR_ITEM);
		/* NOTE: This is temp. Prefab will be dynamically loaded per generator. */
		this.generatorItemPrefab = AssetBridge.LoadAsset("Shared/Resources/Prefabs/GeneratorItemPlaceholder.prefab");
		/* NOTE: Placeholder label. */
		this.generatorLabelPrefab = AssetBridge.LoadAsset("Client/Resources/Prefabs/GeneratorLabel.prefab");
	}

	OnStart(): void {
		/* Listen for generator snapshot. Should only be received on late joins. */
		CoreNetwork.ServerToClient.GeneratorSnapshot.Client.OnServerEvent((generatorStateDtos) => {
			generatorStateDtos.forEach((dto) => {
				/* Skip generator if it already exists on client. */
				if (this.generatorMap.has(dto.id)) return;
				/* Otherwise, create. */
				const timeUntilNextSpawn = dto.nextSpawnTime - TimeUtil.GetServerTime();
				if (timeUntilNextSpawn > 0) {
					dto.spawnRate = timeUntilNextSpawn;
					this.spawnResetGenerators.add(dto.id);
				}
				this.generatorMap.set(dto.id, dto);

				if (dto.label) {
					this.CreateGeneratorLabel(dto);
				}
			});
		});
		/* Listen for generator creation. */
		CoreNetwork.ServerToClient.GeneratorCreated.Client.OnServerEvent((dto) => {
			/* Adjust initial spawn time to sync with server. */
			const timeUntilNextSpawn = dto.nextSpawnTime - TimeUtil.GetServerTime();
			if (timeUntilNextSpawn > 0) {
				dto.spawnRate = timeUntilNextSpawn;
				this.spawnResetGenerators.add(dto.id);
			}
			this.generatorMap.set(dto.id, dto);
			/* Set up generator label if applicable. */
			if (dto.label) this.CreateGeneratorLabel(dto);
		});
		/* Listen for generator looted. */
		CoreNetwork.ServerToClient.GeneratorLooted.Client.OnServerEvent((generatorId) => {
			const dto = this.generatorMap.get(generatorId);
			if (!dto) return;
			/* Update generator label if applicable. */
			if (dto.label) this.UpdateGeneratorTextLabel(dto.id);
			/* Delete generator root GameObject. */
			const rootGO = this.stackedGenerators.get(dto.id);
			if (rootGO) {
				this.stackedGenerators.delete(dto.id);
				GameObjectUtil.Destroy(rootGO);
			}
		});
	}

	/** Creates a generator label in world space. */
	private CreateGeneratorLabel(dto: GeneratorDto): void {
		const labelPosition = dto.pos.add(GENERATOR_LABEL_OFFSET);
		const generatorLabel = GameObjectUtil.InstantiateAt(
			this.generatorLabelPrefab,
			labelPosition,
			Quaternion.identity,
		);
		/* Set initial label text. */
		const generatorTextTransform = generatorLabel.transform.FindChild("GeneratorText")!;
		const generatorTextComponent = generatorTextTransform.GetComponent<TextMeshProUGUI>();
		const itemMeta = ItemUtil.GetItemMeta(dto.item);
		generatorTextComponent.text = `${itemMeta.displayName} Generator`;
		this.generatorTextLabelMap.set(dto.id, generatorTextComponent);
	}

	/** Update a generator text label. */
	private UpdateGeneratorTextLabel(generatorId: string): void {
		const dto = this.generatorMap.get(generatorId);
		if (!dto) return;
		const generatorTextComponent = this.generatorTextLabelMap.get(generatorId);
		if (!generatorTextComponent) return;

		const itemMeta = ItemUtil.GetItemMeta(dto.item);
		generatorTextComponent.text = `${itemMeta.displayName} Generator`;
	}

	/**
	 * @returns All `GeneratorStateDto`s on client.
	 */
	public GetAllGenerators(): GeneratorDto[] {
		return ObjectUtil.values(this.generatorMap);
	}
}
