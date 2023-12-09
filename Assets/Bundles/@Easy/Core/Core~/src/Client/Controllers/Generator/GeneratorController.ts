import { Controller, OnStart } from "@easy-games/flamework-core";
import ObjectUtil from "@easy-games/unity-object-utils";
import { CoreNetwork } from "Shared/CoreNetwork";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { GeneratorDto } from "Shared/Generator/GeneratorMeta";
import { ItemType } from "Shared/Item/ItemType";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { Bin } from "Shared/Util/Bin";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Layer } from "Shared/Util/Layer";
import { MapUtil } from "Shared/Util/MapUtil";
import { Theme } from "Shared/Util/Theme";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { SetInterval } from "Shared/Util/Timer";

/** Generator label offset. Labels are _above_ the item spawn location.*/
const GENERATOR_LABEL_OFFSET = new Vector3(0, 3.4, 0);

@Controller({})
export class GeneratorController implements OnStart {
	/** Generator label prefab. */
	private generatorLabelPrefab: Object;
	/** Mapping of generator id to `GeneratorStateDto`. */
	private generatorMap = new Map<string, GeneratorDto>();
	/**
	 * Map of generators to stack root GameObject. Indicates whether or not client should delete
	 * generator dropped items.
	 */
	private stackedGenerators = new Map<string, GameObject>();
	/** Map of generators to text label components. */

	private generatorLabels = new Map<string, GameObject>();

	private generatorBins = new Map<string, Bin>();

	constructor() {
		// Set up generator item collision rules.
		Physics.IgnoreLayerCollision(Layer.CHARACTER, Layer.GENERATOR_ITEM);
		Physics.IgnoreLayerCollision(Layer.GENERATOR_ITEM, Layer.GENERATOR_ITEM);
		// NOTE: Placeholder label.
		this.generatorLabelPrefab = AssetBridge.Instance.LoadAsset(
			"@Easy/Core/Client/Resources/Prefabs/GeneratorLabel.prefab",
		);
	}

	OnStart(): void {
		/* Listen for generator snapshot. Should only be received on late joins. */
		CoreNetwork.ServerToClient.GeneratorSnapshot.Client.OnServerEvent((generatorStateDtos) => {
			generatorStateDtos.forEach((dto) => {
				// Skip generator if it already exists on client.
				if (this.generatorMap.has(dto.id)) return;
				this.generatorMap.set(dto.id, dto);

				if (dto.nameLabel || dto.spawnTimeLabel) {
					this.CreateGeneratorLabel(dto);
				}
			});
		});
		// Listen for generator creation.
		CoreNetwork.ServerToClient.GeneratorCreated.Client.OnServerEvent((dto) => {
			this.generatorMap.set(dto.id, dto);
			// Set up generator label if applicable.
			if (dto.nameLabel || dto.spawnTimeLabel) this.CreateGeneratorLabel(dto);
		});

		// Listen for modifications - e.g. generator name changing
		CoreNetwork.ServerToClient.GeneratorModified.Client.OnServerEvent((dto) => {
			if (!this.generatorMap.has(dto.id)) return;
			this.generatorMap.set(dto.id, dto);

			if (dto.nameLabel || dto.spawnTimeLabel) {
				this.UpdateGeneratorTextLabel(dto);
			}
		});

		CoreNetwork.ServerToClient.GeneratorSpawnRateChanged.Client.OnServerEvent((genId, spawnRate) => {
			const dto = this.generatorMap.get(genId);
			if (!dto) return;

			dto.spawnRate = spawnRate;
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

		this.generatorLabels.set(dto.id, generatorLabel);
		this.UpdateGeneratorTextLabel(dto);
	}

	/** Update a generator text label. */
	private UpdateGeneratorTextLabel(dto: GeneratorDto): void {
		const go = this.generatorLabels.get(dto.id);
		if (!go) return;

		const refs = go.GetComponent<GameObjectReferences>();

		const nameText = refs.GetValue("UI", "NameText") as TMP_Text;
		const itemMeta = ItemUtil.GetItemDef(dto.item);
		let textColor: Color;
		if (dto.item === ItemType.EMERALD) {
			textColor = Theme.Green;
		} else if (dto.item === ItemType.DIAMOND) {
			textColor = Theme.Aqua;
		} else {
			textColor = Theme.White;
		}
		nameText.text = dto.generatorName ?? `${itemMeta.displayName} Generator`;
		nameText.color = textColor;

		const bin = MapUtil.GetOrCreate(this.generatorBins, dto.id, new Bin());

		const spawnTimeText = refs.GetValue("UI", "SpawnTimeText") as TMP_Text;
		if (dto.spawnTimeLabel) {
			spawnTimeText.transform.parent.gameObject.SetActive(true);
			bin.Add(
				SetInterval(
					1,
					() => {
						let progress = (TimeUtil.GetServerTime() - dto.startSpawnTime) % dto.spawnRate;
						let timeRemaining = dto.spawnRate - progress;
						timeRemaining = math.floor(timeRemaining);
						spawnTimeText.text =
							ColorUtil.ColoredText(Theme.Yellow, "Spawning in ") +
							ColorUtil.ColoredText(Theme.Red, timeRemaining + "") +
							ColorUtil.ColoredText(Theme.Yellow, " seconds!");
					},
					true,
				),
			);
		} else {
			spawnTimeText.transform.parent.gameObject.SetActive(false);
		}
	}

	/**
	 * @returns All `GeneratorStateDto`s on client.
	 */
	public GetAllGenerators(): GeneratorDto[] {
		return ObjectUtil.values(this.generatorMap);
	}
}
