import { OutfitDto } from "./Airship/Types/Outputs/PlatformInventory";
import { AccessorySlot } from "./Character/Accessory/AccessorySlot";
import { CharacterDto } from "./Character/CharacterDto";
import { GeneratorDto } from "./Generator/GeneratorMeta";
import { GroundItemData } from "./GroundItem/GroundItem";
import { InventoryDto } from "./Inventory/Inventory";
import { ItemStackDto } from "./Inventory/ItemStack";
import { CoreItemType } from "./Item/CoreItemType";
import { NetworkChannel } from "./Network/NetworkAPI";
import { RemoteEvent } from "./Network/RemoteEvent";
import { RemoteFunction } from "./Network/RemoteFunction";
import { PlayerDto } from "./Player/Player";
import { TeamDto } from "./Team/Team";

const offset = 121;

export const CoreNetwork = {
	ClientToServer: {
		Ready: new RemoteEvent<[]>(NetworkChannel.Reliable, offset),
		SetHeldSlot: new RemoteEvent<[slot: number]>(NetworkChannel.Reliable, offset),
		PlaceBlock: new RemoteEvent<[pos: Vector3, itemType: CoreItemType, rotation?: number]>(
			NetworkChannel.Reliable,
			offset,
		),
		HitBlock: new RemoteEvent<[pos: Vector3]>(NetworkChannel.Reliable, offset),
		LaunchProjectile: new RemoteEvent<
			[nobId: number, isInFirstPerson: boolean, direction: Vector3, chargeSec: number]
		>(NetworkChannel.Reliable, offset),
		SwordAttack: new RemoteEvent<[targetEntityId?: number, hitDirection?: Vector3]>(
			NetworkChannel.Reliable,
			offset,
		),
		DropItemInSlot: new RemoteEvent<[slot: number, amount: number]>(NetworkChannel.Reliable, offset),
		PickupGroundItem: new RemoteEvent<[groundItemId: number]>(NetworkChannel.Reliable, offset),
		Inventory: {
			SwapSlots: new RemoteEvent<[fromInvId: number, fromSlot: number, toInvId: number, toSlot: number]>(
				NetworkChannel.Reliable,
				offset,
			),
			QuickMoveSlot: new RemoteEvent<[fromInvId: number, fromSlot: number, toInvId: number]>(
				NetworkChannel.Reliable,
				offset,
			),
			MoveToSlot: new RemoteEvent<
				[fromInvId: number, fromSlot: number, toInvId: number, toSlot: number, amount: number]
			>(NetworkChannel.Reliable, offset),
			CheckOutOfSync: new RemoteEvent<[invDto: InventoryDto]>(NetworkChannel.Reliable, offset),
		},
		Character: {
			RequestCharacters: new RemoteFunction<[], CharacterDto[]>(offset),
		},
		SendChatMessage: new RemoteEvent<[text: string]>(NetworkChannel.Reliable, offset),
		ChangedOutfit: new RemoteEvent<[]>(NetworkChannel.Reliable, offset),

		// ----- REFACTORING -----
		AbilityActivateRequest: new RemoteEvent<[abilityId: string]>(NetworkChannel.Reliable, offset),
	},
	ServerToClient: {
		ServerInfo: new RemoteEvent<[gameId: string, serverId: string, organizationId: string]>(
			NetworkChannel.Reliable,
			offset,
		),
		UpdateInventory: new RemoteEvent<InventoryDto>(NetworkChannel.Reliable, offset),
		/** Creates a new instance of an `ItemStack`. */
		SetInventorySlot: new RemoteEvent<
			[invId: number, slot: number, itemStack: ItemStackDto | undefined, clientPredicted: boolean]
		>(NetworkChannel.Reliable, offset),
		RevertBlockPlace: new RemoteEvent<[pos: Vector3]>(NetworkChannel.Reliable, offset),
		/** Updates properties of an `ItemStack` without creating a new instance of an `ItemStack`. */
		UpdateInventorySlot: new RemoteEvent<[invId: number, slot: number, itemType?: CoreItemType, amount?: number]>(
			NetworkChannel.Reliable,
			offset,
		),
		SetHeldInventorySlot: new RemoteEvent<
			[invId: number | undefined, clientId: number | undefined, slot: number, clientPredicted: boolean]
		>(NetworkChannel.Reliable, offset),
		BlockHit: new RemoteEvent<
			[blockPos: Vector3, blockId: number, entityId: number | undefined, damage: number, broken?: boolean]
		>(NetworkChannel.Reliable, offset),
		BlockGroupDestroyed: new RemoteEvent<[blockPositions: Vector3[], blockIds: number[]]>(
			NetworkChannel.Reliable,
			offset,
		),
		ProjectileHit: new RemoteEvent<[hitPoint: Vector3, hitEntityId: number | undefined]>(
			NetworkChannel.Reliable,
			offset,
		),
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
			>(NetworkChannel.Reliable, offset),
			UpdatePosition: new RemoteEvent<
				[
					{
						id: number;
						pos: Vector3;
						vel: Vector3;
					}[],
				]
			>(NetworkChannel.Reliable, offset),
		},
		CharacterModelChanged: new RemoteEvent<[characterModelId: number]>(NetworkChannel.Reliable, offset),
		/** Fired when a player sends a chat message with the raw chat message */
		ChatMessage: new RemoteEvent<[message: string, senderPrefix?: string, senderClientId?: number]>(
			NetworkChannel.Reliable,
			offset,
		),
		SetAccessory: new RemoteEvent<[entityId: number, slot: AccessorySlot, accessoryPath: string]>(
			NetworkChannel.Reliable,
			offset,
		),
		RemoveAccessory: new RemoteEvent<[entityId: number, slot: AccessorySlot]>(NetworkChannel.Reliable, offset),
		AddPlayer: new RemoteEvent<[player: PlayerDto]>(NetworkChannel.Reliable, offset),
		RemovePlayer: new RemoteEvent<[clientId: number]>(NetworkChannel.Reliable, offset),
		AllPlayers: new RemoteEvent<[players: PlayerDto[]]>(NetworkChannel.Reliable, offset),
		//PlayEntityAnimation: new RemoteEvent<[entityId: number, animation: EntityAnimationId, layer?: number]>(),
		PlayEntityItemAnimation: new RemoteEvent<[entityId: number, useIndex?: number, modeIndex?: number]>(
			NetworkChannel.Reliable,
			offset,
		),
		/** Fired when a generator is created. */
		GeneratorCreated: new RemoteEvent<[generatorStateDto: GeneratorDto]>(NetworkChannel.Reliable, offset),
		/** Fired when a generator is modified */
		GeneratorModified: new RemoteEvent<[generatorStateDto: GeneratorDto]>(NetworkChannel.Reliable, offset),
		/** Fired when a generator is looted. */
		GeneratorLooted: new RemoteEvent<[generatorId: string]>(NetworkChannel.Reliable, offset),
		/** Fired when a generator's spawn rate changes. */
		GeneratorSpawnRateChanged: new RemoteEvent<[generatorId: string, newSpawnRate: number]>(
			NetworkChannel.Reliable,
			offset,
		),
		/** Fired when a user joins late. Sends full generator state snapshot. */
		GeneratorSnapshot: new RemoteEvent<[generatorStateDtos: GeneratorDto[]]>(NetworkChannel.Reliable, offset),
		/** Fired when client first joins to send existing teams and when new teams are created. */
		AddTeams: new RemoteEvent<[teams: TeamDto[]]>(NetworkChannel.Reliable, offset),
		AddPlayerToTeam: new RemoteEvent<[teamId: string, userId: string]>(NetworkChannel.Reliable, offset),
		RemovePlayerFromTeam: new RemoteEvent<[teamId: string, userId: string]>(NetworkChannel.Reliable, offset),
		RemoveTeams: new RemoteEvent<[teamIds: string[]]>(NetworkChannel.Reliable, offset),
		SetBlockData: new RemoteEvent<[voxelPos: Vector3, key: string, data: unknown]>(NetworkChannel.Reliable, offset),
		SetBlockGroupCustomData: new RemoteEvent<[voxelPositions: Vector3[], key: string, data: unknown[]]>(
			NetworkChannel.Reliable,
			offset,
		),
		SetBlockGroupSameData: new RemoteEvent<[voxelPositions: Vector3[], key: string, data: unknown]>(
			NetworkChannel.Reliable,
			offset,
		),
		SyncPrefabBlocks: new RemoteEvent<[blockPositions: Vector3[]]>(NetworkChannel.Reliable, offset),
		/** Fired when a player is eliminated. */
		PlayerEliminated: new RemoteEvent<[clientId: number]>(NetworkChannel.Reliable, offset),
		/** Fired when the current selected items state changes on an entity*/
		HeldItemStateChanged: new RemoteEvent<
			[characterId: number, stateIndex: number, isActive: boolean, lookVector: Vector3]
		>(NetworkChannel.Reliable, offset),
		BlockPlace: new RemoteEvent<[pos: Vector3, voxel: number, entityId?: number]>(NetworkChannel.Reliable, offset),
		BlockGroupPlace: new RemoteEvent<[positions: Vector3[], voxels: number[], entityId?: number]>(
			NetworkChannel.Reliable,
			offset,
		),

		EntityPickedUpGroundItem: new RemoteEvent<[entityId: number, groundItemId: number]>(
			NetworkChannel.Reliable,
			offset,
		),
		GroundItemDestroyed: new RemoteEvent<[groundItemId: number]>(NetworkChannel.Reliable, offset),

		/** Fired when a generator item spawns. */
		GeneratorItemSpawn: new RemoteEvent<[generatorStateDto: GeneratorDto]>(NetworkChannel.Reliable, offset),

		Character: {
			Spawn: new RemoteEvent<[characterDto: CharacterDto]>(NetworkChannel.Reliable, offset),
			SetHealth: new RemoteEvent<[characterId: number, health: number]>(NetworkChannel.Reliable, offset),
			SetMaxHealth: new RemoteEvent<[characterId: number, health: number]>(NetworkChannel.Reliable, offset),
			ChangeOutfit: new RemoteEvent<[characterId: number, outfitDto: OutfitDto | undefined]>(
				NetworkChannel.Reliable,
				offset,
			),
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
