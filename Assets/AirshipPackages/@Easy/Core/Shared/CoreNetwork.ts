import { OutfitDto } from "./Airship/Types/Outputs/AirshipPlatformInventory";
import { AccessorySlot } from "./Character/Accessory/AccessorySlot";
import { CharacterDto } from "./Character/CharacterDto";
import { InventoryDto } from "./Inventory/Inventory";
import { ItemStackDto } from "./Inventory/ItemStack";
import { CoreItemType } from "./Item/CoreItemType";
import { RemoteEvent } from "./Network/RemoteEvent";
import { RemoteFunction } from "./Network/RemoteFunction";
import { PlayerDto } from "./Player/Player";
import { TeamDto } from "./Team/Team";

export const CoreNetwork = {
	ClientToServer: {
		Ready: new RemoteEvent<[]>("Ready"),
		SetHeldSlot: new RemoteEvent<[slot: number]>("SetHeldSlot"),
		Inventory: {
			SwapSlots: new RemoteEvent<[fromInvId: number, fromSlot: number, toInvId: number, toSlot: number]>(
				"Inventory",
			),
			QuickMoveSlot: new RemoteEvent<[fromInvId: number, fromSlot: number, toInvId: number]>("QuickMoveSlot"),
			MoveToSlot: new RemoteEvent<
				[fromInvId: number, fromSlot: number, toInvId: number, toSlot: number, amount: number]
			>("MoveToSlot"),
			CheckOutOfSync: new RemoteEvent<[invDto: InventoryDto]>("CheckOutOfSync"),
		},
		Character: {
			RequestCharacters: new RemoteFunction<[], CharacterDto[]>("RequestCharacters"),
		},
		SendChatMessage: new RemoteEvent<[text: string]>("SendChatMessage"),
		ChangedOutfit: new RemoteEvent<[]>("ChangedOutfit"),
	},
	ServerToClient: {
		ServerInfo: new RemoteEvent<[gameId: string, serverId: string, organizationId: string]>("ServerInfo"),
		UpdateInventory: new RemoteEvent<InventoryDto>("UpdateInventory"),
		/** Creates a new instance of an `ItemStack`. */
		SetInventorySlot: new RemoteEvent<
			[invId: number, slot: number, itemStack: ItemStackDto | undefined, clientPredicted: boolean]
		>("SetInventorySlot"),
		/** Updates properties of an `ItemStack` without creating a new instance of an `ItemStack`. */
		UpdateInventorySlot: new RemoteEvent<[invId: number, slot: number, itemType?: CoreItemType, amount?: number]>(
			"UpdateInventorySlot",
		),
		SetHeldInventorySlot: new RemoteEvent<
			[invId: number | undefined, clientId: number | undefined, slot: number, clientPredicted: boolean]
		>("SetHeldInventorySlot"),
		CharacterModelChanged: new RemoteEvent<[characterModelId: number]>("CharacterModelChanged"),
		/** Fired when a player sends a chat message with the raw chat message */
		ChatMessage: new RemoteEvent<[message: string, senderPrefix?: string, senderClientId?: number]>("ChatMessage"),
		SetAccessory: new RemoteEvent<[entityId: number, slot: AccessorySlot, accessoryPath: string]>("SetAccessory"),
		RemoveAccessory: new RemoteEvent<[entityId: number, slot: AccessorySlot]>("RemoveAccessory"),
		AddPlayer: new RemoteEvent<[player: PlayerDto]>("AddPlayer"),
		RemovePlayer: new RemoteEvent<[clientId: number]>("RemovePlayer"),
		AllPlayers: new RemoteEvent<[players: PlayerDto[]]>("AllPlayers"),
		//PlayEntityAnimation: new RemoteEvent<[entityId: number, animation: EntityAnimationId, layer?: number]>(),
		PlayEntityItemAnimation: new RemoteEvent<[entityId: number, useIndex?: number, modeIndex?: number]>(
			"PlayEntityItemAnimation",
		),
		/** Fired when client first joins to send existing teams and when new teams are created. */
		AddTeams: new RemoteEvent<[teams: TeamDto[]]>("AddTeams"),
		AddPlayerToTeam: new RemoteEvent<[teamId: string, userId: string]>("AddPlayerToTeam"),
		RemovePlayerFromTeam: new RemoteEvent<[teamId: string, userId: string]>("RemovePlayerFromTeam"),
		RemoveTeams: new RemoteEvent<[teamIds: string[]]>("RemoveTeams"),
		SetBlockData: new RemoteEvent<[voxelPos: Vector3, key: string, data: unknown]>("SetBlockData"),
		SetBlockGroupCustomData: new RemoteEvent<[voxelPositions: Vector3[], key: string, data: unknown[]]>(
			"SetBlockGroupCustomData",
		),
		SetBlockGroupSameData: new RemoteEvent<[voxelPositions: Vector3[], key: string, data: unknown]>(
			"SetBlockGroupSameData",
		),
		/** Fired when a player is eliminated. */
		PlayerEliminated: new RemoteEvent<[clientId: number]>("PlayerEliminated"),

		Character: {
			Spawn: new RemoteEvent<[characterDto: CharacterDto]>("Spawn"),
			SetHealth: new RemoteEvent<[characterId: number, health: number]>("SetHealth"),
			SetMaxHealth: new RemoteEvent<[characterId: number, health: number]>("SetMaxHealth"),
			ChangeOutfit: new RemoteEvent<[characterId: number, outfitDto: OutfitDto | undefined]>("ChangeOutfit"),
		},
	},
};
