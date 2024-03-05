import { OutfitDto } from "./Airship/Types/Outputs/PlatformInventory";
import { AccessorySlot } from "./Character/Accessory/AccessorySlot";
import { CharacterDto } from "./Character/CharacterDto";
import { GeneratorDto } from "./Generator/GeneratorMeta";
import { GroundItemData } from "./GroundItem/GroundItem";
import { InventoryDto } from "./Inventory/Inventory";
import { ItemStackDto } from "./Inventory/ItemStack";
import { CoreItemType } from "./Item/CoreItemType";
import { HeldItemState } from "./Item/HeldItems/HeldItemState";
import { RemoteEvent } from "./Network/RemoteEvent";
import { RemoteFunction } from "./Network/RemoteFunction";
import { PlayerDto } from "./Player/Player";
import { TeamDto } from "./Team/Team";
export declare const CoreNetwork: {
    ClientToServer: {
        Ready: RemoteEvent<[]>;
        SetHeldSlot: RemoteEvent<[slot: number]>;
        PlaceBlock: RemoteEvent<[pos: Vector3, itemType: CoreItemType, rotation?: number | undefined]>;
        HitBlock: RemoteEvent<[pos: Vector3]>;
        LaunchProjectile: RemoteEvent<[nobId: number, isInFirstPerson: boolean, direction: Vector3, chargeSec: number]>;
        SwordAttack: RemoteEvent<[targetEntityId?: number | undefined, hitDirection?: Vector3 | undefined]>;
        DropItemInSlot: RemoteEvent<[slot: number, amount: number]>;
        PickupGroundItem: RemoteEvent<[groundItemId: number]>;
        Inventory: {
            SwapSlots: RemoteEvent<[fromInvId: number, fromSlot: number, toInvId: number, toSlot: number]>;
            QuickMoveSlot: RemoteEvent<[fromInvId: number, fromSlot: number, toInvId: number]>;
            MoveToSlot: RemoteEvent<[fromInvId: number, fromSlot: number, toInvId: number, toSlot: number, amount: number]>;
            CheckOutOfSync: RemoteEvent<[invDto: InventoryDto]>;
        };
        Character: {
            RequestCharacters: RemoteFunction<[], CharacterDto[]>;
        };
        SendChatMessage: RemoteEvent<[text: string]>;
        SetHeldItemState: RemoteEvent<[entityId: number, heldItemState: HeldItemState]>;
        ChangedOutfit: RemoteEvent<[]>;
        AbilityActivateRequest: RemoteEvent<[abilityId: string]>;
    };
    ServerToClient: {
        ServerInfo: RemoteEvent<[gameId: string, serverId: string, organizationId: string]>;
        UpdateInventory: RemoteEvent<InventoryDto>;
        /** Creates a new instance of an `ItemStack`. */
        SetInventorySlot: RemoteEvent<[invId: number, slot: number, itemStack: ItemStackDto | undefined, clientPredicted: boolean]>;
        RevertBlockPlace: RemoteEvent<[pos: Vector3]>;
        /** Updates properties of an `ItemStack` without creating a new instance of an `ItemStack`. */
        UpdateInventorySlot: RemoteEvent<[invId: number, slot: number, itemType?: CoreItemType | undefined, amount?: number | undefined]>;
        SetHeldInventorySlot: RemoteEvent<[invId: number | undefined, slot: number, clientPredicted: boolean]>;
        BlockHit: RemoteEvent<[blockPos: Vector3, blockId: number, entityId: number | undefined, damage: number, broken?: boolean | undefined]>;
        BlockGroupDestroyed: RemoteEvent<[blockPositions: Vector3[], blockIds: number[]]>;
        ProjectileHit: RemoteEvent<[hitPoint: Vector3, hitEntityId: number | undefined]>;
        GroundItem: {
            Add: RemoteEvent<[dtos: {
                id: number;
                itemStack: ItemStackDto;
                pos: Vector3;
                velocity: Vector3;
                pickupTime: number;
                data: GroundItemData;
            }[]]>;
            UpdatePosition: RemoteEvent<[{
                id: number;
                pos: Vector3;
                vel: Vector3;
            }[]]>;
        };
        CharacterModelChanged: RemoteEvent<[characterModelId: number]>;
        ChatMessage: RemoteEvent<[text: string, senderClientId?: number | undefined]>;
        /** Fired when a player sends a chat message with the raw chat message */
        PlayerChatted: RemoteEvent<[rawMessage: string, senderClientId: number]>;
        SetAccessory: RemoteEvent<[entityId: number, slot: AccessorySlot, accessoryPath: string]>;
        RemoveAccessory: RemoteEvent<[entityId: number, slot: AccessorySlot]>;
        AddPlayer: RemoteEvent<[player: PlayerDto]>;
        RemovePlayer: RemoteEvent<[clientId: number]>;
        AllPlayers: RemoteEvent<[players: PlayerDto[]]>;
        PlayEntityItemAnimation: RemoteEvent<[entityId: number, useIndex?: number | undefined, modeIndex?: number | undefined]>;
        /** Fired when a generator is created. */
        GeneratorCreated: RemoteEvent<[generatorStateDto: GeneratorDto]>;
        /** Fired when a generator is modified */
        GeneratorModified: RemoteEvent<[generatorStateDto: GeneratorDto]>;
        /** Fired when a generator is looted. */
        GeneratorLooted: RemoteEvent<[generatorId: string]>;
        /** Fired when a generator's spawn rate changes. */
        GeneratorSpawnRateChanged: RemoteEvent<[generatorId: string, newSpawnRate: number]>;
        /** Fired when a user joins late. Sends full generator state snapshot. */
        GeneratorSnapshot: RemoteEvent<[generatorStateDtos: GeneratorDto[]]>;
        /** Fired when client first joins to send existing teams and when new teams are created. */
        AddTeams: RemoteEvent<[teams: TeamDto[]]>;
        AddPlayerToTeam: RemoteEvent<[teamId: string, userId: string]>;
        RemovePlayerFromTeam: RemoteEvent<[teamId: string, userId: string]>;
        RemoveTeams: RemoteEvent<[teamIds: string[]]>;
        SetBlockData: RemoteEvent<[voxelPos: Vector3, key: string, data: unknown]>;
        SetBlockGroupCustomData: RemoteEvent<[voxelPositions: Vector3[], key: string, data: unknown[]]>;
        SetBlockGroupSameData: RemoteEvent<[voxelPositions: Vector3[], key: string, data: unknown]>;
        SyncPrefabBlocks: RemoteEvent<[blockPositions: Vector3[]]>;
        /** Fired when a player is eliminated. */
        PlayerEliminated: RemoteEvent<[clientId: number]>;
        /** Fired when the current selected items state changes on an entity*/
        HeldItemStateChanged: RemoteEvent<[entityId: number, state: HeldItemState, lookVector: Vector3]>;
        BlockPlace: RemoteEvent<[pos: Vector3, voxel: number, entityId?: number | undefined]>;
        BlockGroupPlace: RemoteEvent<[positions: Vector3[], voxels: number[], entityId?: number | undefined]>;
        EntityPickedUpGroundItem: RemoteEvent<[entityId: number, groundItemId: number]>;
        GroundItemDestroyed: RemoteEvent<[groundItemId: number]>;
        /** Fired when a generator item spawns. */
        GeneratorItemSpawn: RemoteEvent<[generatorStateDto: GeneratorDto]>;
        Character: {
            Spawn: RemoteEvent<[characterDto: CharacterDto]>;
            SetHealth: RemoteEvent<[characterId: number, health: number]>;
            SetMaxHealth: RemoteEvent<[characterId: number, health: number]>;
            ChangeOutfit: RemoteEvent<[characterId: number, outfitDto: OutfitDto | undefined]>;
        };
    };
};
