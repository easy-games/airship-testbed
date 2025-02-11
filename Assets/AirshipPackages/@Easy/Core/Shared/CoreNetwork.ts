import { OutfitDto } from "./Airship/Types/Outputs/AirshipPlatformInventory";
import { AccessorySlot } from "./Character/Accessory/AccessorySlot";
import { CharacterDto } from "./Character/CharacterDto";
import { InventoryDto } from "./Inventory/Inventory";
import { ItemStackDto } from "./Inventory/ItemStack";
import { NetworkFunction } from "./Network/NetworkFunction";
import { NetworkSignal } from "./Network/NetworkSignal";
import { PlayerDto } from "./Player/Player";
import { TeamDto } from "./Team/Team";

export const CoreNetwork = {
	ClientToServer: {
		Ready: new NetworkSignal("Ready"),
		SetHeldSlot: new NetworkSignal<[invId: number, slot: number]>("SetHeldSlot"),
		Inventory: {
			SwapSlots: new NetworkSignal<[fromInvId: number, fromSlot: number, toInvId: number, toSlot: number]>(
				"Inventory",
			),
			QuickMoveSlot: new NetworkSignal<[fromInvId: number, fromSlot: number, toInvId: number]>("QuickMoveSlot"),
			MoveToSlot: new NetworkSignal<
				[fromInvId: number, fromSlot: number, toInvId: number, toSlot: number, amount: number]
			>("MoveToSlot"),
			CheckOutOfSync: new NetworkSignal<[invDto: InventoryDto]>("CheckOutOfSync"),
		},
		Character: {
			RequestCharacters: new NetworkFunction<[], CharacterDto[]>("RequestCharacters"),
			EmoteRequest: new NetworkSignal<[emoteId: string]>("AirshipEmoteRequest"),
		},
		SendChatMessage: new NetworkSignal<[text: string]>("SendChatMessage"),
		ChangedOutfit: new NetworkSignal("ChangedOutfit"),
	},
	ServerToClient: {
		ServerInfo: new NetworkSignal<[gameId: string, serverId: string, organizationId: string]>("ServerInfo"),
		UpdateInventory: new NetworkSignal<InventoryDto>("UpdateInventory"),
		/** Creates a new instance of an `ItemStack`. */
		SetInventorySlot: new NetworkSignal<
			[invId: number, slot: number, itemStack: ItemStackDto | undefined, clientPredicted: boolean]
		>("SetInventorySlot"),
		/** Updates properties of an `ItemStack` without creating a new instance of an `ItemStack`. */
		UpdateInventorySlot: new NetworkSignal<[invId: number, slot: number, itemType?: string, amount?: number]>(
			"UpdateInventorySlot",
		),
		SetHeldInventorySlot: new NetworkSignal<[invId: number | undefined, slot: number, clientPredicted: boolean]>(
			"SetHeldInventorySlot",
		),
		CharacterModelChanged: new NetworkSignal<[characterModelId: number]>("CharacterModelChanged"),
		/** Fired when a player sends a chat message with the raw chat message */
		ChatMessage: new NetworkSignal<[message: string, senderPrefix?: string, senderClientId?: number]>(
			"ChatMessage",
		),
		SetAccessory: new NetworkSignal<[entityId: number, slot: AccessorySlot, accessoryPath: string]>("SetAccessory"),
		RemoveAccessory: new NetworkSignal<[entityId: number, slot: AccessorySlot]>("RemoveAccessory"),
		AddPlayer: new NetworkSignal<[player: PlayerDto]>("AddPlayer"),
		RemovePlayer: new NetworkSignal<[clientId: number]>("RemovePlayer"),
		AllPlayers: new NetworkSignal<[players: PlayerDto[]]>("AllPlayers"),
		//PlayEntityAnimation: new RemoteEvent<[entityId: number, animation: EntityAnimationId, layer?: number]>(),
		PlayEntityItemAnimation: new NetworkSignal<[entityId: number, useIndex?: number, modeIndex?: number]>(
			"PlayEntityItemAnimation",
		),
		/** Fired when client first joins to send existing teams and when new teams are created. */
		AddTeams: new NetworkSignal<[teams: TeamDto[]]>("AddTeams"),
		AddPlayerToTeam: new NetworkSignal<[teamId: string, userId: string]>("AddPlayerToTeam"),
		RemovePlayerFromTeam: new NetworkSignal<[teamId: string, userId: string]>("RemovePlayerFromTeam"),
		RemoveTeams: new NetworkSignal<[teamIds: string[]]>("RemoveTeams"),
		SetBlockData: new NetworkSignal<[voxelPos: Vector3, key: string, data: unknown]>("SetBlockData"),
		SetBlockGroupCustomData: new NetworkSignal<[voxelPositions: Vector3[], key: string, data: unknown[]]>(
			"SetBlockGroupCustomData",
		),
		SetBlockGroupSameData: new NetworkSignal<[voxelPositions: Vector3[], key: string, data: unknown]>(
			"SetBlockGroupSameData",
		),
		/** Fired when a player is eliminated. */
		PlayerEliminated: new NetworkSignal<[clientId: number]>("PlayerEliminated"),

		Character: {
			Spawn: new NetworkSignal<[characterDto: CharacterDto]>("AirshipSpawn"),
			SetHealth: new NetworkSignal<[characterId: number, health: number]>("AirshipSetHealth"),
			SetNametag: new NetworkSignal<[characterId: number, displayName: string]>("AirshipSetNametag"),
			SetMaxHealth: new NetworkSignal<[characterId: number, health: number]>("AirshipSetMaxHealth"),
			ChangeOutfit: new NetworkSignal<[characterId: number, outfitDto: OutfitDto | undefined]>(
				"AirshipChangeOutfit",
			),
			SetCharacter: new NetworkSignal<[connectionId: number, characterId: number | undefined]>(
				"AirshipSetCharacter",
			),
			EmoteStart: new NetworkSignal<[characterId: number, emoteId: string]>("AirshipEmoteStart"),
			EmoteEnd: new NetworkSignal<[characterId: number]>("AirshipEmoteEnd"),
		},

		Purchase: {
			PromptPurchase: new NetworkFunction<
				[productId: string, quantity: number, recipientId?: string],
				[displayed: boolean]
			>("PromptPurchase"),
		},
	},
};
