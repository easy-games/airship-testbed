import {
	AbilityCooldownDto,
	AbilityDto,
	AbilityUseResult,
	ChargingAbilityDto,
	ChargingAbilityEndedDto,
	UseAbilityRequest,
} from "./Abilities/Ability";
import { CropStateDto } from "./Crops/CropMeta";
import { DamageType } from "./Damage/DamageType";
import { DenyRegionDto } from "./DenyRegion/DenyRegionMeta";
import { AccessorySlot } from "./Entity/Character/Accessory/AccessorySlot";
import { EntityDto } from "./Entity/Entity";
import { GeneratorDto } from "./Generator/GeneratorMeta";
import { InventoryDto } from "./Inventory/Inventory";
import { ItemStackDto } from "./Inventory/ItemStack";
import { HeldItemState } from "./Item/HeldItems/HeldItemState";
import { ItemType } from "./Item/ItemType";
import { RemoteEvent } from "./Network/RemoteEvent";
import { RemoteFunction } from "./Network/RemoteFunction";
import { PlayerDto } from "./Player/Player";
import { ProjectileDto } from "./Projectile/Projectile";
import { TeamDto } from "./Team/Team";

export const CoreNetwork = {
	ClientToServer: {
		Ready: new RemoteEvent<[]>(),
		SetHeldSlot: new RemoteEvent<[slot: number]>(),
		PlaceBlock: new RemoteEvent<[pos: Vector3, itemType: ItemType, rotation?: number]>(),
		HitBlock: new RemoteEvent<[pos: Vector3]>(),
		LaunchProjectile: new RemoteEvent<
			[nobId: number, isInFirstPerson: boolean, direction: Vector3, chargeSec: number]
		>(),
		SwordAttack: new RemoteEvent<[targetEntityId?: number, hitDirection?: Vector3]>(),
		DropItemInSlot: new RemoteEvent<[slot: number, amount: number]>(),
		PickupGroundItem: new RemoteEvent<[groundItemId: number]>(),
		Inventory: {
			SwapSlots: new RemoteEvent<[fromInvId: number, fromSlot: number, toInvId: number, toSlot: number]>(),
			QuickMoveSlot: new RemoteEvent<[fromInvId: number, fromSlot: number, toInvId: number]>(),
			MoveToSlot: new RemoteEvent<
				[fromInvId: number, fromSlot: number, toInvId: number, toSlot: number, amount: number]
			>(),
			CheckOutOfSync: new RemoteEvent<[invDto: InventoryDto]>(),
		},
		SendChatMessage: new RemoteEvent<[text: string]>(),
		SetHeldItemState: new RemoteEvent<[entityId: number, heldItemState: HeldItemState]>(),

		TEST_LATENCY: new RemoteFunction<void, number>(),
		TestKnockback2: new RemoteEvent<[]>(),
		LibonatiTest: new RemoteEvent<[]>(),

		GetAbilities: new RemoteFunction<[], ReadonlyArray<AbilityDto>>(),
		UseAbility: new RemoteEvent<[req: UseAbilityRequest]>(),
	},
	ServerToClient: {
		ServerInfo: new RemoteEvent<[gameId: string, serverId: string]>(),
		UpdateInventory: new RemoteEvent<InventoryDto>(),
		/** Creates a new instance of an `ItemStack`. */
		SetInventorySlot: new RemoteEvent<
			[invId: number, slot: number, itemStack: ItemStackDto | undefined, clientPredicted: boolean]
		>(),
		RevertBlockPlace: new RemoteEvent<[pos: Vector3]>(),
		/** Updates properties of an `ItemStack` without creating a new instance of an `ItemStack`. */
		UpdateInventorySlot: new RemoteEvent<[invId: number, slot: number, itemType?: ItemType, amount?: number]>(),
		SetHeldInventorySlot: new RemoteEvent<[invId: number, slot: number, clientPredicted: boolean]>(),
		SpawnEntities: new RemoteEvent<[entities: EntityDto[]]>(),
		DespawnEntity: new RemoteEvent<[entityId: number]>(),
		BlockHit: new RemoteEvent<
			[blockPos: Vector3, blockId: number, entityId: number | undefined, broken?: boolean]
		>(),
		BlockDestroyed: new RemoteEvent<[blockPos: Vector3, blockId: number]>(),
		BlockGroupDestroyed: new RemoteEvent<[blockPositions: Vector3[], blockIds: number[]]>(),
		ProjectileSpawn: new RemoteEvent<[projectileDto: ProjectileDto]>(),
		EntityDamage: new RemoteEvent<
			[entityId: number, amount: number, damageType: DamageType, fromEntityId: number | undefined]
		>(),
		ProjectileHit: new RemoteEvent<[hitPoint: Vector3, hitEntityId: number | undefined]>(),
		Entity: {
			SetHealth: new RemoteEvent<[entityId: number, health: number]>(),
			SetDisplayName: new RemoteEvent<[entityId: number, displayName: string]>(),
			AddHealthbar: new RemoteEvent<[entityId: number]>(),
			SetLookVector: new RemoteEvent<[entityId: number, lookVector: Vector3]>(),
			FallDamageTaken: new RemoteEvent<[entityId: number, velocity: Vector3]>(),
		},
		EntityDeath: new RemoteEvent<
			[entityId: number, damageType: DamageType, killerEntityId: number | undefined, respawnTime: number]
		>(),
		GroundItem: {
			Add: new RemoteEvent<
				[
					dtos: {
						id: number;
						itemStack: ItemStackDto;
						pos: Vector3;
						velocity: Vector3;
						pickupTime: number;
						data: Record<string, unknown>;
					}[],
				]
			>(),
			UpdatePosition: new RemoteEvent<
				[
					{
						id: number;
						pos: Vector3;
						vel: Vector3;
					}[],
				]
			>(),
		},
		CharacterModelChanged: new RemoteEvent<[characterModelId: number]>(),
		ChatMessage: new RemoteEvent<[text: string, senderClientId?: number]>(),
		SetAccessory: new RemoteEvent<[entityId: number, slot: AccessorySlot, accessoryPath: string]>(),
		RemoveAccessory: new RemoteEvent<[entityId: number, slot: AccessorySlot]>(),
		AddPlayer: new RemoteEvent<[player: PlayerDto]>(),
		RemovePlayer: new RemoteEvent<[clientId: number]>(),
		AllPlayers: new RemoteEvent<[players: PlayerDto[]]>(),
		//PlayEntityAnimation: new RemoteEvent<[entityId: number, animation: EntityAnimationId, layer?: number]>(),
		PlayEntityItemAnimation: new RemoteEvent<[entityId: number, useIndex?: number, modeIndex?: number]>(),
		/** Fired when a generator is created. */
		GeneratorCreated: new RemoteEvent<[generatorStateDto: GeneratorDto]>(),
		/** Fired when a generator is looted. */
		GeneratorLooted: new RemoteEvent<[generatorId: string]>(),
		/** Fired when a generator's spawn rate changes. */
		GeneratorSpawnRateChanged: new RemoteEvent<[generatorId: string, newSpawnRate: number]>(),
		/** Fired when a user joins late. Sends full generator state snapshot. */
		GeneratorSnapshot: new RemoteEvent<[generatorStateDtos: GeneratorDto[]]>(),
		/** Fired when a crop is planted */
		CropPlanted: new RemoteEvent<[cropStateDto: CropStateDto]>(),
		/** Fired when a crop is planted */
		CropHarvested: new RemoteEvent<[cropIdx: number]>(),
		/** Fired when a crop  */
		CropGrowthUpdated: new RemoteEvent<[cropIdx: number, cropLevel: number]>(),
		/** Fired when a user joins late. Sends full crop state snapshot */
		CropSnapshot: new RemoteEvent<[cropStateDtos: CropStateDto[]]>(),
		/** Fired when a **tagged** GameObject is spawned on the server. */
		NetGameObjectReplicating: new RemoteEvent<[networkObjectId: number, tag: string]>(),
		/** Fired when a player joins. Sends `CollectionManager` replicated set state. */
		CollectionManagerState: new RemoteEvent<[state: Map<string, Set<number>>]>(),
		/** Fired when client first joins to send existing teams and when new teams are created. */
		AddTeams: new RemoteEvent<[teams: TeamDto[]]>(),
		AddPlayerToTeam: new RemoteEvent<[teamId: string, userId: string]>(),
		RemovePlayerFromTeam: new RemoteEvent<[teamId: string, userId: string]>(),
		RemoveTeams: new RemoteEvent<[teamIds: string[]]>(),
		SetBlockData: new RemoteEvent<[voxelPos: Vector3, key: string, data: unknown]>(),
		SetBlockGroupCustomData: new RemoteEvent<[voxelPositions: Vector3[], key: string, data: unknown[]]>(),
		SetBlockGroupSameData: new RemoteEvent<[voxelPositions: Vector3[], key: string, data: unknown]>(),
		SyncPrefabBlocks: new RemoteEvent<[blockPositions: Vector3[]]>(),
		/** Fired when a player is eliminated. */
		PlayerEliminated: new RemoteEvent<[clientId: number]>(),
		/** Fired when a deny region is created. */
		DenyRegionCreated: new RemoteEvent<[denyRegion: DenyRegionDto]>(),
		/** Fired when a player joins. Sends entire deny region state. */
		DenyRegionSnapshot: new RemoteEvent<[denyRegions: DenyRegionDto[]]>(),
		/** Fired when the current selected items state changes on an entity*/
		HeldItemStateChanged: new RemoteEvent<[entityId: number, state: HeldItemState]>(),
		BlockPlace: new RemoteEvent<[pos: Vector3, voxel: number, entityId?: number]>(),
		BlockGroupPlace: new RemoteEvent<[positions: Vector3[], voxels: number[], entityId?: number]>(),

		EntityPickedUpGroundItem: new RemoteEvent<[entityId: number, groundItemId: number]>(),
		GroundItemDestroyed: new RemoteEvent<[groundItemId: number]>(),

		/** Fired when a generator item spawns. */
		GeneratorItemSpawn: new RemoteEvent<[generatorStateDto: GeneratorDto]>(),

		AbilityAdded: new RemoteEvent<[entityId: number, dto: AbilityDto]>(),
		AbilityRemoved: new RemoteEvent<[entityId: number, id: string]>(),
		AbilitiesCleared: new RemoteEvent<[entityId: number]>(),

		AbilityCooldownStateChange: new RemoteEvent<[dto: AbilityCooldownDto]>(),

		AbilityChargeBegan: new RemoteEvent<[entityId: number, dto: ChargingAbilityDto]>(),
		AbilityChargeEnded: new RemoteEvent<[entityId: number, dto: ChargingAbilityEndedDto]>(),
	},
};

let countClientToServer = 0;
let countServerToClient = 0;
for (const _ of pairs(CoreNetwork.ClientToServer)) {
	countClientToServer++;
}
for (const _ of pairs(CoreNetwork.ServerToClient)) {
	countServerToClient++;
}
// print(`NETWORK_COUNT: ClientToServer: ${countClientToServer} | ServerToClient: ${countServerToClient}`);
