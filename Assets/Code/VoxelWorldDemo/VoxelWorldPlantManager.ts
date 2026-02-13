import VoxelWorldPlantView from "./VoxelWorldPlantView";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";

export class VoxelWorldPlantEvents {
    public static SetPlants = new NetworkSignal<[plantData: PlantData[]]>("SetPlants");
    public static RemovePlants = new NetworkSignal<[plantPos: Vector3[]]>("RemovePlants");
    public static DamagePlants = new NetworkSignal<[plantPos: Vector3[]]>("DamagePlants");
    public static UpdatePlants = new NetworkSignal<[plantData: PlantData[]]>("UpdatePlants");
    public static PlacePlants = new NetworkSignal<[plantPos: Vector3[]]>("PlacePlants");
    public static RequestPlaceDirt = new NetworkSignal<[]>("RequestPlaceDirt");
    public static RequestDestroyDirt = new NetworkSignal<[]>("RequestDestroyDirt");
    public static ResetWorld = new NetworkSignal<[]>("ResetWorld");
}

export class PlantData {
    public height: number = 1;
    public color: Color = Color.white;
    public fruited: boolean = false;
    public weed: boolean = false;
    public position: Vector3 = Vector3.zero;
}

export default class VoxelWorldPlantManager extends AirshipSingleton {
    private readonly WorldSaveKey = "PlantWorldSaveFile";
    private worldSaveAvailable = false;

    @Header("Templates")
    public plantTemplate: GameObject;

    @Header("References")
    public voxelWorld: VoxelWorld;

    private plants = new Map<Vector3, VoxelWorldPlantView>();

    private bin = new Bin();

    protected Awake(): void {
        if(Game.IsServer()) {
            this.InitializeVoxelWorld();
        }
    }

    protected OnDestroy(): void {
        Platform.Server.DataStore.UnlockKey(this.WorldSaveKey);
    }

    protected Start(): void {
        if(Game.IsServer()) {
            // SERVER
            this.bin.Add(Airship.Players.ObservePlayers((player) => {
                // Send all plant data
                let plantData: PlantData[] = [];
                for(let plant of this.plants) {
                    plantData.push(plant[1].data);
                }
                VoxelWorldPlantEvents.SetPlants.server.FireClient(player, plantData);
            }));

            // Client requests to damage plant
            this.bin.Add(VoxelWorldPlantEvents.DamagePlants.server.OnClientEvent((player, positions)=>{
                for(const pos of positions) {
                    this.DamagePlantServer(pos);
                }
            }))

            // Client wants to place dirt
            this.bin.Add(
            VoxelWorldPlantEvents.RequestPlaceDirt.server.OnClientEvent((player) => {
                if(player.character) {
                    this.PlaceDirtServer(player.character.transform.position);
                }
            }))

            // Client wants to destroy dirt
            this.bin.Add(
            VoxelWorldPlantEvents.RequestDestroyDirt.server.OnClientEvent((player) => {
                if(player.character) {
                    this.DestroyDirtServer(player.character.transform.position);
                }
            }))

            // Client wants to reset the world
            this.bin.Add(
            VoxelWorldPlantEvents.ResetWorld.server.OnClientEvent((player) => {
                if(player.character) {
                    this.ResetWorld();
                }
            }))
        } else {
            // CLIENT
            this.bin.Add(VoxelWorldPlantEvents.SetPlants.client.OnServerEvent((plantData) => {
                for(let data of plantData) {
                    this.SpawnPlant(data, false);
                }
            }))

            this.bin.Add(VoxelWorldPlantEvents.RemovePlants.client.OnServerEvent((plantPos) => {
                for(let pos of plantPos) {
                    this.DestroyPlant(pos);
                }
            }))

            this.bin.Add(VoxelWorldPlantEvents.UpdatePlants.client.OnServerEvent((plantData) => {
                for(let plant of plantData) {
                    this.UpdatePlantClient(plant);
                }
            }))
        }
    }

    private async InitializeVoxelWorld() {
        print("LOADED VOXEL WORLD ON SERVER");
        if(Game.IsEditor()) {
            this.LoadVoxelWorld();
        } else {
            // Load world from data platform
            await this.LoadVoxelWorld();
        }
        print("Create weeds");
        this.CreateNewWeeds();
        print("Auto Save");
        this.SetupAutoSave();
    }

    private CreateNewWeeds() {
        print("Creating new weeds");
        const plantPositions = new Set<Vector3>();
        for(let i=0; i < 10; i++) {
            const randomPos = this.voxelWorld.GetRandomOccupiedVoxelPosition();
            if(!plantPositions.has(randomPos)) {
                plantPositions.add(randomPos);
            }
        }

        let i=0; 
        let newPlants: PlantData[] = [];
        for(let pos of plantPositions) {
            const block = this.voxelWorld.GetVoxelBlockDefAt(pos);
            if(block) {
                const data = this.GetRandomPlant(pos);
                data.weed = true;
                this.SpawnPlant(data, false);
                newPlants.push(data);
            }
            i++;
        }

        //VoxelWorldPlantEvents.SetPlants.server.FireAllClients(newPlants);
    }

    public IsOccupied(worldPosition: Vector3) { 
        return this.plants.has(this.GetTilePosition(worldPosition));
    }

    public GetPlant(worldPosition: Vector3) {
        return this.plants.get(this.GetTilePosition(worldPosition));
    }

    public GetTilePosition(worldPosition: Vector3) {
        return new Vector3(math.floor(worldPosition.x), 0, math.floor(worldPosition.z));
    }

    private GetRandomPlant(worldPosition: Vector3) {
        const data = new PlantData();
        data.height = math.random(1,3);
        data.color = new Color(math.random() * .3, .8, math.random() * .3);
        data.fruited = math.random() >= .5;
        data.position = this.GetTilePosition(worldPosition);
        return data;
    }

    public TryDamagePlant(worldPosition: Vector3) {
        print("Trying to damage plant");
        if(Game.IsServer()) {
            return this.DamagePlantServer(worldPosition);
        }

        const tilePos = this.GetTilePosition(worldPosition);
        const plant = this.GetPlant(tilePos); 
        if(plant && plant.data.weed) {
            VoxelWorldPlantEvents.DamagePlants.client.FireServer([tilePos]);
            return true;
        }
        return false;
    }

    public TryPlacePlant(worldPosition: Vector3) {
        print("Trying to place plant");
        if(Game.IsServer()) {
            this.PlacePlantServer(worldPosition);
            return;
        }

        const tilePos = this.GetTilePosition(worldPosition);
        const plant = this.GetPlant(tilePos); 
        if(!plant) {
            VoxelWorldPlantEvents.PlacePlants.client.FireServer([tilePos]);
            return true;
        }
        return false;
    }

    private PlacePlantServer(worldPosition: Vector3) {
        const plant = this.GetPlant(worldPosition); 
        if(!plant) {
            this.SpawnPlant(this.GetRandomPlant(worldPosition), false);
        }
    }

    private DamagePlantServer(worldPosition: Vector3) {
        const tilePos = this.GetTilePosition(worldPosition);

        print("Server checking damage: " + worldPosition + " tile: " + tilePos);
        const plant = this.GetPlant(worldPosition); 
        if(plant && plant.data.weed) {
            plant.UpdateData({height: plant.data.height-1});
            if(plant.data.height <= 0) {
                // Plant is dead
                this.DestroyPlant(this.GetTilePosition(tilePos));
            } else {
                // Tell clients we damaged a plant
                VoxelWorldPlantEvents.DamagePlants.server.FireAllClients([tilePos]);
            }
            return true;
        } else {
            if(plant) {
                print("Trying to damage non weed");
            } else {
                print("Trying to damage nothing");
            }
            return false;
        }
    }

    public UpdatePlantClient(newData: PlantData) {
        const plant = this.GetPlant(newData.position);
        if(plant) {
            plant.UpdateData(newData);
        }else{
            error("No plant on tile position server sent us: " + newData.position);
        }
    }

    public SpawnPlant(data: PlantData, notifyImmediate = true) {
        const tilePosition = this.GetTilePosition(data.position);
        if(this.plants.has(tilePosition)) {
            print("Trying to spawn plant where a plant already exists");
            return;
        }
        print("Spawning plant at: " + data.position + " tile: " + tilePosition);
        data.position = tilePosition;
        const instance = Instantiate(this.plantTemplate, tilePosition.add(new Vector3(.5,1,.5)), Quaternion.identity).GetAirshipComponent<VoxelWorldPlantView>();
        if(instance) {
            instance.Init(data);
            this.plants.set(tilePosition, instance);
            this.voxelWorld.WriteVoxelCustomDataAt(tilePosition, new BinaryBlob(data), false);
            print("Saving plant at: " + tilePosition);
        }

        if(notifyImmediate && Game.IsServer()) {
            VoxelWorldPlantEvents.SetPlants.server.FireAllClients([data]);
        }
    }

    public DestroyPlant(tilePosition: Vector3, notifyImmediate = true) {
        print("Destroy plant at: " + tilePosition);
        let plant = this.plants.get(tilePosition);
        if(plant) {
            Destroy(plant.gameObject);
            this.plants.delete(tilePosition);
        }

        if(notifyImmediate && Game.IsServer()) {
            VoxelWorldPlantEvents.RemovePlants.server.FireAllClients([tilePosition]);
        }
    }

    public PlaceDirtServer(pos: Vector3) {
        pos = pos.add(new Vector3(0,.015,0));
        if(this.GetPlant(pos) !== undefined) {
            return;
        }

        this.voxelWorld.WriteVoxelAt(pos, 1, false);
    }

    public DestroyDirtServer(pos: Vector3) {
        pos = pos.add(new Vector3(0,-.015,0));
        if(this.GetPlant(pos) !== undefined) {
            return;
        }

        this.voxelWorld.WriteVoxelAt(pos, 0, false);
    }

    private async ResetWorld() {
        print("RESETTING WORLD");
        this.voxelWorld.LoadWorldFromSaveFile(this.voxelWorld.voxelWorldFile);
        this.CreateNewWeeds();
        this.SaveVoxelWorld();
    }

    private async SetupAutoSave() {
        if(Game.IsEditor()) {
            this.worldSaveAvailable = true;
        } else {
            this.worldSaveAvailable = await Platform.Server.DataStore.LockKey(this.WorldSaveKey);
        }

        if(this.worldSaveAvailable) {
            task.spawnDetached(async ()=>{
                while(true){
                    await this.SaveVoxelWorld();
                    task.wait(15);
                }
            });
        }
    }

    private async SaveVoxelWorld() {
        print("Save?");
        if(this.worldSaveAvailable || Game.IsEditor()) {
            const encodedString = this.voxelWorld.EncodeToString();
            if(Game.IsEditor()) {
                EditorPrefs.SetString(this.WorldSaveKey, encodedString);
            } else {
                await Platform.Server.DataStore.SetKey(this.WorldSaveKey, {saveData: encodedString});
            }
            print("World saved!\n" + encodedString);
        }
    }

    private async LoadVoxelWorld() {
        print("Loading world from platform");
        // if(Game.IsEditor()) {
        //     this.voxelWorld.DecodeFromString(EditorPrefs.GetString(this.WorldSaveKey));
        // } else {
        //     let dataStoreWorld = await Platform.Server.DataStore.GetKey<{saveData: string}>(this.WorldSaveKey);
        //     if(dataStoreWorld !== undefined) {
        //         this.voxelWorld.DecodeFromString(dataStoreWorld.saveData);
        //     }
        // }
        this.voxelWorld.LoadWorldFromSaveFile(this.voxelWorld.voxelWorldFile);
        print("World Loaded!");
        return undefined;
    }
}
