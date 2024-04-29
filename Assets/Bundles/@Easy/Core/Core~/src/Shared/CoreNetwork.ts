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

export const CoreNetwork = {
	ClientToServer: {
		Ready: new RemoteEvent<[]>(NetworkChannel.Reliable, "Ready"),
		SetHeldSlot: new RemoteEvent<[slot: number]>(NetworkChannel.Reliable, "SetHeldSlot"),
		PlaceBlock: new RemoteEvent<[pos: Vector3, itemType: CoreItemType, rotation?: number]>(
			NetworkChannel.Reliable,
			"PlaceBlock",
		),
		HitBlock: new RemoteEvent<[pos: Vector3]>(NetworkChannel.Reliable, "HitBlock"),
		LaunchProjectile: new RemoteEvent<
			[nobId: number, isInFirstPerson: boolean, direction: Vector3, chargeSec: number]
		>(NetworkChannel.Reliable, "LaunchProjectile"),
		SwordAttack: new RemoteEvent<[targetEntityId?: number, hitDirection?: Vector3]>(
			NetworkChannel.Reliable,
			"SwordAttack",
		),
		DropItemInSlot: new RemoteEvent<[slot: number, amount: number]>(NetworkChannel.Reliable, "DropItemInSlot"),
		PickupGroundItem: new RemoteEvent<[groundItemId: number]>(NetworkChannel.Reliable, "PickupGroundItem"),
		Inventory: {
			SwapSlots: new RemoteEvent<[fromInvId: number, fromSlot: number, toInvId: number, toSlot: number]>(
				NetworkChannel.Reliable,
				"Inventory",
			),
			QuickMoveSlot: new RemoteEvent<[fromInvId: number, fromSlot: number, toInvId: number]>(
				NetworkChannel.Reliable,
				"QuickMoveSlot",
			),
			MoveToSlot: new RemoteEvent<
				[fromInvId: number, fromSlot: number, toInvId: number, toSlot: number, amount: number]
			>(NetworkChannel.Reliable, "MoveToSlot"),
			CheckOutOfSync: new RemoteEvent<[invDto: InventoryDto]>(NetworkChannel.Reliable, "CheckOutOfSync"),
		},
		Character: {
			RequestCharacters: new RemoteFunction<[], CharacterDto[]>("RequestCharacters"),
		},
		SendChatMessage: new RemoteEvent<[text: string]>(NetworkChannel.Reliable, "SendChatMessage"),
		ChangedOutfit: new RemoteEvent<[]>(NetworkChannel.Reliable, "ChangedOutfit"),

		// ----- REFACTORING -----
		AbilityActivateRequest: new RemoteEvent<[abilityId: string]>(NetworkChannel.Reliable, "AbilityActivateRequest"),
	},
	ServerToClient: {
		ServerInfo: new RemoteEvent<[gameId: string, serverId: string, organizationId: string]>(
			NetworkChannel.Reliable,
			"ServerInfo",
		),
		UpdateInventory: new RemoteEvent<InventoryDto>(NetworkChannel.Reliable, "UpdateInventory"),
		/** Creates a new instance of an `ItemStack`. */
		SetInventorySlot: new RemoteEvent<
			[invId: number, slot: number, itemStack: ItemStackDto | undefined, clientPredicted: boolean]
		>(NetworkChannel.Reliable, "SetInventorySlot"),
		RevertBlockPlace: new RemoteEvent<[pos: Vector3]>(NetworkChannel.Reliable, "RevertBlockPlace"),
		/** Updates properties of an `ItemStack` without creating a new instance of an `ItemStack`. */
		UpdateInventorySlot: new RemoteEvent<[invId: number, slot: number, itemType?: CoreItemType, amount?: number]>(
			NetworkChannel.Reliable,
			"UpdateInventorySlot",
		),
		SetHeldInventorySlot: new RemoteEvent<
			[invId: number | undefined, clientId: number | undefined, slot: number, clientPredicted: boolean]
		>(NetworkChannel.Reliable, "SetHeldInventorySlot"),
		BlockHit: new RemoteEvent<
			[blockPos: Vector3, blockId: number, entityId: number | undefined, damage: number, broken?: boolean]
		>(NetworkChannel.Reliable, "BlockHit"),
		BlockGroupDestroyed: new RemoteEvent<[blockPositions: Vector3[], blockIds: number[]]>(
			NetworkChannel.Reliable,
			"BlockGroupDestroyed",
		),
		ProjectileHit: new RemoteEvent<[hitPoint: Vector3, hitEntityId: number | undefined]>(
			NetworkChannel.Reliable,
			"ProjectileHit",
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
			>(NetworkChannel.Reliable, "GroundItem"),
			UpdatePosition: new RemoteEvent<
				[
					{
						id: number;
						pos: Vector3;
						vel: Vector3;
					}[],
				]
			>(NetworkChannel.Reliable, "UpdatePosition"),
		},
		CharacterModelChanged: new RemoteEvent<[characterModelId: number]>(
			NetworkChannel.Reliable,
			"CharacterModelChanged",
		),
		/** Fired when a player sends a chat message with the raw chat message */
		ChatMessage: new RemoteEvent<[message: string, senderPrefix?: string, senderClientId?: number]>(
			NetworkChannel.Reliable,
			"ChatMessage",
		),
		SetAccessory: new RemoteEvent<[entityId: number, slot: AccessorySlot, accessoryPath: string]>(
			NetworkChannel.Reliable,
			"SetAccessory",
		),
		RemoveAccessory: new RemoteEvent<[entityId: number, slot: AccessorySlot]>(
			NetworkChannel.Reliable,
			"RemoveAccessory",
		),
		AddPlayer: new RemoteEvent<[player: PlayerDto]>(NetworkChannel.Reliable, "AddPlayer"),
		RemovePlayer: new RemoteEvent<[clientId: number]>(NetworkChannel.Reliable, "RemovePlayer"),
		AllPlayers: new RemoteEvent<[players: PlayerDto[]]>(NetworkChannel.Reliable, "AllPlayers"),
		//PlayEntityAnimation: new RemoteEvent<[entityId: number, animation: EntityAnimationId, layer?: number]>(),
		PlayEntityItemAnimation: new RemoteEvent<[entityId: number, useIndex?: number, modeIndex?: number]>(
			NetworkChannel.Reliable,
			"PlayEntityItemAnimation",
		),
		/** Fired when a generator is created. */
		GeneratorCreated: new RemoteEvent<[generatorStateDto: GeneratorDto]>(
			NetworkChannel.Reliable,
			"GeneratorCreated",
		),
		/** Fired when a generator is modified */
		GeneratorModified: new RemoteEvent<[generatorStateDto: GeneratorDto]>(
			NetworkChannel.Reliable,
			"GeneratorModified",
		),
		/** Fired when a generator is looted. */
		GeneratorLooted: new RemoteEvent<[generatorId: string]>(NetworkChannel.Reliable, "GeneratorLooted"),
		/** Fired when a generator's spawn rate changes. */
		GeneratorSpawnRateChanged: new RemoteEvent<[generatorId: string, newSpawnRate: number]>(
			NetworkChannel.Reliable,
			"GeneratorSpawnRateChanged",
		),
		/** Fired when a user joins late. Sends full generator state snapshot. */
		GeneratorSnapshot: new RemoteEvent<[generatorStateDtos: GeneratorDto[]]>(
			NetworkChannel.Reliable,
			"GeneratorSnapshot",
		),
		/** Fired when client first joins to send existing teams and when new teams are created. */
		AddTeams: new RemoteEvent<[teams: TeamDto[]]>(NetworkChannel.Reliable, "AddTeams"),
		AddPlayerToTeam: new RemoteEvent<[teamId: string, userId: string]>(NetworkChannel.Reliable, "AddPlayerToTeam"),
		RemovePlayerFromTeam: new RemoteEvent<[teamId: string, userId: string]>(
			NetworkChannel.Reliable,
			"RemovePlayerFromTeam",
		),
		RemoveTeams: new RemoteEvent<[teamIds: string[]]>(NetworkChannel.Reliable, "RemoveTeams"),
		SetBlockData: new RemoteEvent<[voxelPos: Vector3, key: string, data: unknown]>(
			NetworkChannel.Reliable,
			"SetBlockData",
		),
		SetBlockGroupCustomData: new RemoteEvent<[voxelPositions: Vector3[], key: string, data: unknown[]]>(
			NetworkChannel.Reliable,
			"SetBlockGroupCustomData",
		),
		SetBlockGroupSameData: new RemoteEvent<[voxelPositions: Vector3[], key: string, data: unknown]>(
			NetworkChannel.Reliable,
			"SetBlockGroupSameData",
		),
		SyncPrefabBlocks: new RemoteEvent<[blockPositions: Vector3[]]>(NetworkChannel.Reliable, "SyncPrefabBlocks"),
		/** Fired when a player is eliminated. */
		PlayerEliminated: new RemoteEvent<[clientId: number]>(NetworkChannel.Reliable, "PlayerEliminated"),
		/** Fired when the current selected items state changes on an entity*/
		HeldItemStateChanged: new RemoteEvent<
			[characterId: number, stateIndex: number, isActive: boolean, lookVector: Vector3]
		>(NetworkChannel.Reliable, "HeldItemStateChanged"),
		BlockPlace: new RemoteEvent<[pos: Vector3, voxel: number, entityId?: number]>(
			NetworkChannel.Reliable,
			"BlockPlace",
		),
		BlockGroupPlace: new RemoteEvent<[positions: Vector3[], voxels: number[], entityId?: number]>(
			NetworkChannel.Reliable,
			"BlockGroupPlace",
		),

		EntityPickedUpGroundItem: new RemoteEvent<[entityId: number, groundItemId: number]>(
			NetworkChannel.Reliable,
			"EntityPickedUpGroundItem",
		),
		GroundItemDestroyed: new RemoteEvent<[groundItemId: number]>(NetworkChannel.Reliable, "GroundItemDestroyed"),

		/** Fired when a generator item spawns. */
		GeneratorItemSpawn: new RemoteEvent<[generatorStateDto: GeneratorDto]>(
			NetworkChannel.Reliable,
			"GeneratorItemSpawn",
		),

		Character: {
			Spawn: new RemoteEvent<[characterDto: CharacterDto]>(NetworkChannel.Reliable, "Spawn"),
			SetHealth: new RemoteEvent<[characterId: number, health: number]>(NetworkChannel.Reliable, "SetHealth"),
			SetMaxHealth: new RemoteEvent<[characterId: number, health: number]>(
				NetworkChannel.Reliable,
				"SetMaxHealth",
			),
			ChangeOutfit: new RemoteEvent<[characterId: number, outfitDto: OutfitDto | undefined]>(
				NetworkChannel.Reliable,
				"ChangeOutfit",
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
