// import { Airship, Platform } from "@Easy/Core/Shared/Airship";
// import { Game } from "@Easy/Core/Shared/Game";
// import { CoreAction } from "@Easy/Core/Shared/Input/AirshipCoreAction";

// @RequireComponent<VoxelWorld>()
// export default class VoxelSavingTest extends AirshipBehaviour {
//     private readonly dataKey = "DataStoreVoxelWorld";

//     private voxelWorld: VoxelWorld;
//     private nextI = 0;

//     protected OnEnable(): void {
//         this.voxelWorld = this.gameObject.GetComponent<VoxelWorld>()!;
//         this.voxelWorld.autoLoad = false;
//         this.voxelWorld.OnFinishedLoading.Connect(()=>{
//             print("Loaded voxel world from data store");
//         });
//     }

//     protected Start(): void {
//         if(Game.IsServer()) {
//             this.LoadVoxelWorld();
//         }

//         if(Game.IsClient()) {
//             Airship.Input.OnDown(CoreAction.Interact).Connect(()=>{
//                 this.voxelWorld.WriteVoxelAt(new Vector3(0,this.nextI,0), 1, false);
//                 this.nextI++;
//                 this.SaveVoxelWorld();
//             })
//         }
//     }

//     public async LoadVoxelWorld() {
//         // Load the voxel world from the data store
//         const data = await Platform.Server.DataStore.GetKey<{voxelData: string}>(this.dataKey);
//         if(data !== undefined) {
//             this.voxelWorld.DecodeFromString(data.voxelData);
//         } else {
//             this.voxelWorld.LoadEmptyWorld();
//             this.SaveVoxelWorld();
//             warn("Unable to load voxel world");
//         }
//         print("Finished loading voxel world");
//     }

//     public async SaveVoxelWorld() {
//         // Save the voxel world to the data store
//         await Platform.Server.DataStore.SetKey(this.dataKey, {voxelData: this.voxelWorld.EncodeToString()});
//         print("Finished saving voxel world");
//     }
// }
