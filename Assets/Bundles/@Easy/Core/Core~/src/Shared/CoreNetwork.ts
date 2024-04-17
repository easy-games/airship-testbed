import { OutfitDto } from "./Airship/Types/Outputs/PlatformInventory";
import { AccessorySlot } from "./Character/Accessory/AccessorySlot";
import { CharacterDto } from "./Character/CharacterDto";
import { GeneratorDto } from "./Generator/GeneratorMeta";
import { GroundItemData } from "./GroundItem/GroundItem";
import { InventoryDto } from "./Inventory/Inventory";
import { ItemStackDto } from "./Inventory/ItemStack";
import { CoreItemType } from "./Item/CoreItemType";
import { RemoteEvent } from "./Network/RemoteEvent";
import { RemoteFunction } from "./Network/RemoteFunction";
import { PlayerDto } from "./Player/Player";
import { TeamDto } from "./Team/Team";

export const CoreNetwork = {
	ClientToServer: {
		Ready: new RemoteEvent<[]>(),
		SetHeldSlot: new RemoteEvent<[slot: number]>(),
		PlaceBlock: new RemoteEvent<[pos: Vector3, itemType: CoreItemType, rotation?: number]>(),
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
		Character: {
			RequestCharacters: new RemoteFunction<[], CharacterDto[]>(),
		},
		SendChatMessage: new RemoteEvent<[text: string]>(),
		ChangedOutfit: new RemoteEvent<[]>(),

		// ----- REFACTORING -----
		AbilityActivateRequest: new RemoteEvent<[abilityId: string]>(),
	},
	ServerToClient: {
		ServerInfo: new RemoteEvent<[gameId: string, serverId: string, organizationId: string]>(),
		UpdateInventory: new RemoteEvent<InventoryDto>(),
		/** Creates a new instance of an `ItemStack`. */
		SetInventorySlot: new RemoteEvent<
			[invId: number, slot: number, itemStack: ItemStackDto | undefined, clientPredicted: boolean]
		>(),
		RevertBlockPlace: new RemoteEvent<[pos: Vector3]>(),
		/** Updates properties of an `ItemStack` without creating a new instance of an `ItemStack`. */
		UpdateInventorySlot: new RemoteEvent<[invId: number, slot: number, itemType?: CoreItemType, amount?: number]>(),
		SetHeldInventorySlot: new RemoteEvent<
			[invId: number | undefined, clientId: number | undefined, slot: number, clientPredicted: boolean]
		>(),
		BlockHit: new RemoteEvent<
			[blockPos: Vector3, blockId: number, entityId: number | undefined, damage: number, broken?: boolean]
		>(),
		BlockGroupDestroyed: new RemoteEvent<[blockPositions: Vector3[], blockIds: number[]]>(),
		ProjectileHit: new RemoteEvent<[hitPoint: Vector3, hitEntityId: number | undefined]>(),
		GroundItem: {
			Add: new RemoteEvent<
				[
					dtos: {
						id: number;
						itemStack: ItemStackDto;
						pos: Vector3;
						velocity: Vector3;
						pickupTime: number;
						data: GroundItemData;
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
		/** Fired when a player sends a chat message with the raw chat message */
		ChatMessage: new RemoteEvent<[message: string, senderPrefix?: string, senderClientId?: number]>(),
		SetAccessory: new RemoteEvent<[entityId: number, slot: AccessorySlot, accessoryPath: string]>(),
		RemoveAccessory: new RemoteEvent<[entityId: number, slot: AccessorySlot]>(),
		AddPlayer: new RemoteEvent<[player: PlayerDto]>(),
		RemovePlayer: new RemoteEvent<[clientId: number]>(),
		AllPlayers: new RemoteEvent<[players: PlayerDto[]]>(),
		//PlayEntityAnimation: new RemoteEvent<[entityId: number, animation: EntityAnimationId, layer?: number]>(),
		PlayEntityItemAnimation: new RemoteEvent<[entityId: number, useIndex?: number, modeIndex?: number]>(),
		/** Fired when a generator is created. */
		GeneratorCreated: new RemoteEvent<[generatorStateDto: GeneratorDto]>(),
		/** Fired when a generator is modified */
		GeneratorModified: new RemoteEvent<[generatorStateDto: GeneratorDto]>(),
		/** Fired when a generator is looted. */
		GeneratorLooted: new RemoteEvent<[generatorId: string]>(),
		/** Fired when a generator's spawn rate changes. */
		GeneratorSpawnRateChanged: new RemoteEvent<[generatorId: string, newSpawnRate: number]>(),
		/** Fired when a user joins late. Sends full generator state snapshot. */
		GeneratorSnapshot: new RemoteEvent<[generatorStateDtos: GeneratorDto[]]>(),
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
		/** Fired when the current selected items state changes on an entity*/
		HeldItemStateChanged: new RemoteEvent<
			[characterId: number, stateIndex: number, isActive: boolean, lookVector: Vector3]
		>(),
		BlockPlace: new RemoteEvent<[pos: Vector3, voxel: number, entityId?: number]>(),
		BlockGroupPlace: new RemoteEvent<[positions: Vector3[], voxels: number[], entityId?: number]>(),

		EntityPickedUpGroundItem: new RemoteEvent<[entityId: number, groundItemId: number]>(),
		GroundItemDestroyed: new RemoteEvent<[groundItemId: number]>(),

		/** Fired when a generator item spawns. */
		GeneratorItemSpawn: new RemoteEvent<[generatorStateDto: GeneratorDto]>(),

		Character: {
			Spawn: new RemoteEvent<[characterDto: CharacterDto]>(),
			SetHealth: new RemoteEvent<[characterId: number, health: number]>(),
			SetMaxHealth: new RemoteEvent<[characterId: number, health: number]>(),
			ChangeOutfit: new RemoteEvent<[characterId: number, outfitDto: OutfitDto | undefined]>(),
		},
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
