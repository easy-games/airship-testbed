import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import ObjectUtil from "@easy-games/unity-object-utils";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { GeneratorCreationConfig } from "Shared/Generator/GeneratorMeta";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { Task } from "Shared/Util/Task";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { SetInterval } from "Shared/Util/Timer";
import { EntityService } from "../Entity/EntityService";
import { GroundItemService } from "../GroundItem/GroundItemService";
import { GeneratorState } from "./GeneratorState";

/** Snapshot send delay after user connects. */
const SNAPSHOT_SEND_DELAY = 1;
/** Generator item spawn offset. Items spawn _above_ generators and fall to the ground. */
const GENERATOR_ITEM_SPAWN_OFFSET = new Vector3(0, 2.8, 0);

@Service({})
export class GeneratorService implements OnStart {
	/** Generator id counter. */
	private generatorIdCounter = 0;
	/** Mapping of generator id to `GeneratorStateDto`. */
	private generatorMap = new Map<string, GeneratorState>();
	/** Mapping of generator id to `ItemStack`. */
	private stackMap = new Map<string, ItemStack>();

	constructor() {}

	OnStart(): void {
		// Split resources
		CoreServerSignals.EntityPickupItem.Connect((event) => {
			const generatorId = event.groundItem.data["generatorId"] as string | undefined;
			if (!generatorId) return;

			const genState = this.GetGeneratorById(generatorId);
			if (!genState) return;
			const pickupPlayer = event.entity.player;
			if (pickupPlayer && genState?.split) {
				const splitTeam = pickupPlayer.GetTeam();
				if (!splitTeam) return;
				const splitRange = genState.split.range;
				splitTeam.GetPlayers().forEach((player) => {
					const playerEntity = Dependency<EntityService>().GetEntityByClientId(player.clientId);
					if (!playerEntity) return;
					if (!(playerEntity instanceof CharacterEntity)) return;
					const distanceFromGen = playerEntity.gameObject.transform.position.sub(genState.dto.pos).magnitude;
					if (player !== pickupPlayer && distanceFromGen <= splitRange) {
						const inv = playerEntity.GetInventory();
						inv.AddItem(
							new ItemStack(
								event.groundItem.itemStack.GetItemType(),
								event.groundItem.itemStack.GetAmount(),
							),
						);
					}
				});
			}
			// Generator cleanup.
			genState.stackSize = 0;
			this.stackMap.delete(generatorId);
		});

		// Handle late joiners.
		CoreServerSignals.PlayerJoin.Connect((event) => {
			Task.Delay(SNAPSHOT_SEND_DELAY, () => {
				CoreNetwork.ServerToClient.GeneratorSnapshot.Server.FireClient(
					event.player.clientId,
					this.GetAllGenerators().map((state) => state.dto),
				);
			});
		});
	}

	/**
	 * Creates a generator at `generatorPosition` based on `generatorConfig`.
	 * @param pos The position to create generator at.
	 * @param config Generator config.
	 * @returns Generator id.
	 */
	public CreateGenerator(pos: Vector3, config: GeneratorCreationConfig): string {
		const generatorId = this.GenerateGeneratorId();

		const state: GeneratorState = {
			stackLimit: config.stackLimit,
			stackSize: 0,
			originalSpawnRate: config.spawnRate,
			dto: {
				pos: pos,
				id: generatorId,
				item: config.item,
				generatorName: config.nameOverride,
				spawnRate: config.spawnRate,
				startSpawnTime: TimeUtil.GetServerTime(),
				nameLabel: config.nameLabel,
				spawnTimeLabel: config.spawnTimeLabel,
			},
			split: config.split,
		};
		state.ticker = this.TickGenerator(state);

		// Store generator in map, notify client of generator creation.
		this.generatorMap.set(state.dto.id, state);
		CoreNetwork.ServerToClient.GeneratorCreated.Server.FireAllClients(state.dto);
		// Return id.
		return generatorId;
	}

	/**
	 * Fetch a generator by generator id.
	 * @param generatorId A generator id.
	 * @returns Generator state dto.
	 */
	public GetGeneratorById(generatorId: string): GeneratorState | undefined {
		return this.generatorMap.get(generatorId);
	}

	/** Generates and returns a unique generator id. */
	private GenerateGeneratorId(): string {
		const generatorId = `generator_${this.generatorIdCounter}`;
		this.generatorIdCounter++;
		return generatorId;
	}

	/** Ticks a generator on server. */
	private TickGenerator(generatorState: GeneratorState): () => void {
		return SetInterval(generatorState.dto.spawnRate, () => {
			/* Always update next spawn time. */
			// generatorState.dto.nextSpawnTime = TimeUtil.GetServerTime() + generatorState.dto.spawnRate;
			/* Only increase stack size if generator has _not_ reached capacity. */
			// if (generatorState.stackSize < generatorState.stackLimit) {
			// 	generatorState.stackSize++;

			// const existingStack = this.stackMap.get(generatorState.dto.id);
			// if (existingStack) {
			// 	print("merging existing.");
			// 	existingStack.SetAmount(generatorState.stackSize);
			// } else {
			const newGeneratorStack = new ItemStack(generatorState.dto.item, 1);
			this.stackMap.set(generatorState.dto.id, newGeneratorStack);
			Dependency<GroundItemService>().SpawnGroundItem(
				newGeneratorStack,
				generatorState.dto.pos.add(GENERATOR_ITEM_SPAWN_OFFSET),
				undefined,
				{
					generatorId: generatorState.dto.id,
				},
			);
			// }
			// }
		});
	}

	/**
	 * Set generator spawn rate based on generator id.
	 * @param generatorId A generator id.
	 * @param newSpawnRate New spawn rate in seconds.
	 */
	public UpdateGeneratorSpawnRateById(generatorId: string, newSpawnRate: number): void {
		const state = this.generatorMap.get(generatorId);
		if (!state) return;

		// Stop ticker and reconstruct dto with updated state.
		state.ticker?.();

		state.dto.spawnRate = newSpawnRate;
		state.dto.startSpawnTime = TimeUtil.GetServerTime();
		state.ticker = this.TickGenerator(state);

		// Inform clients of _all_ server-sided generator spawn rate changes.
		CoreNetwork.ServerToClient.GeneratorSpawnRateChanged.Server.FireAllClients(state.dto.id, newSpawnRate);
	}

	/**
	 * Update the Generator's Label based on generator id
	 * @param generatorId The generator's id
	 * @param generatorLabel The new label for the generator
	 */
	public UpdateGeneratorLabelById(generatorId: string, generatorLabel: string): void {
		const state = this.generatorMap.get(generatorId);
		if (!state) return;
		state.dto.generatorName = generatorLabel;
		CoreNetwork.ServerToClient.GeneratorModified.Server.FireAllClients(state.dto);
	}

	/**
	 * @returns All `GeneratorStateDto`s on server.
	 */
	public GetAllGenerators(): GeneratorState[] {
		return ObjectUtil.values(this.generatorMap);
	}
}
