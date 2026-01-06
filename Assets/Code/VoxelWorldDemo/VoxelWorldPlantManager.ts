import VoxelWorldPlantView from "./VoxelWorldPlantView";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";

export class VoxelWorldPlantEvents {
    public static SetPlants = new NetworkSignal<[plantData: PlantData[]]>("SetPlants");
    public static RemovePlants = new NetworkSignal<[plantPos: Vector3[]]>("RemovePlants");
}

export class PlantData {
    public height: number = 1;
    public color: Color = Color.white;
    public fruited: boolean = false;
    public weed: boolean = false;
    public position: Vector3 = Vector3.zero;
}

export default class VoxelWorldPlantManager extends AirshipSingleton {
    @Header("Templates")
    public plantTemplate: GameObject;

    @Header("References")
    public voxelWorld: VoxelWorld;

    private plants = new Map<Vector3, VoxelWorldPlantView>();

    private bin = new Bin();

    protected Awake(): void {
        if(Game.IsServer()) {
            if(this.voxelWorld.loadingStatus === LoadingStatus.Loaded) {
                this.OnVoxelWorldLoadedServer();
            }else {
                this.bin.Add(this.voxelWorld.OnFinishedLoading.Connect(()=>{
                    this.OnVoxelWorldLoadedServer();
                })); 
            }
        }
    }

    protected Start(): void {
        if(Game.IsServer()) {
            this.bin.Add(Airship.Players.ObservePlayers((player) => {
                // Send all plant data
                let plantData: PlantData[] = [];
                for(let plant of this.plants) {
                    plantData.push(plant[1].data);
                }
                VoxelWorldPlantEvents.SetPlants.server.FireClient(player, plantData);
            }));
        }

        if(Game.IsClient() && !Game.IsEditor()) {
            
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
        }
    }

    private OnVoxelWorldLoadedServer() {
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
            const block = this.voxelWorld.GetVoxelBlockType(pos);
            if(block) {
                print(i + " TYPE: " + block.definition.blockName);
                const data = new PlantData();
                data.height = math.random(1,3);
                data.color = new Color(math.random() * .3, .8, math.random() * .3);
                data.weed = true;
                data.position = pos;
                this.SpawnPlant(data, false);
                newPlants.push(data);
            }
            i++;
        }

        VoxelWorldPlantEvents.SetPlants.server.FireAllClients(newPlants);
    }

    public IsOccupied(tilePosition: Vector3) { 
        return this.plants.has(tilePosition);
    }

    public SpawnPlant(data: PlantData, notifyImmediate = true) {
        const instance = Instantiate(this.plantTemplate, data.position.add(new Vector3(.5,1,.5)), Quaternion.identity).GetAirshipComponent<VoxelWorldPlantView>();
        if(instance) {
            instance?.Init(data);
            this.plants.set(data.position, instance);
        }

        if(notifyImmediate && Game.IsServer()) {
            VoxelWorldPlantEvents.SetPlants.server.FireAllClients([data]);
        }
    }

    public DestroyPlant(tilePosition: Vector3, notifyImmediate = true) {
        let plant = this.plants.get(tilePosition);
        if(plant) {
            Destroy(plant.gameObject);
            this.plants.delete(tilePosition);
        }

        if(notifyImmediate && Game.IsServer()) {
            VoxelWorldPlantEvents.RemovePlants.server.FireAllClients([tilePosition]);
        }
    }
}
