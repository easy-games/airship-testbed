import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class LibonatiManager extends AirshipBehaviour {
	public spawnPosition!: GameObject;

	private bin = new Bin();

	public override Awake(): void {}

	override Start(): void {
		// if (RunUtil.IsServer()) {
		// 	Dependency<PlayerService>().ObservePlayers((player) => {
		// 		this.SpawnPlayer(player);
		// 	});
		// 	const coreServerSignals = import("@Easy/Core/Server/CoreServerSignals").expect().CoreServerSignals;
		// 	this.bin.Add(
		// 		coreServerSignals.EntityDeath.Connect((event) => {
		// 			event.respawnTime = 0;
		// 			if (event.entity.player) {
		// 				this.SpawnPlayer(event.entity.player);
		// 			}
		// 		}),
		// 	);
		// }
		// if (RunUtil.IsClient()) {
		// 	Dependency<LocalEntityController>().SetCharacterCameraMode(CharacterCameraMode.LOCKED);
		// 	Dependency<LocalEntityController>().SetFirstPerson(true);
		// 	Dependency<LoadingScreenController>().FinishLoading();
		// }
	}

	public SpawnPlayer(player: Player): void {
		// const entity = Dependency<EntityService>().SpawnPlayerEntity(
		// 	player,
		// 	EntityPrefabType.HUMAN,
		// 	this.spawnPosition.transform.position,
		// );
		// const inv = entity.GetInventory();
		// inv.AddItem(new ItemStack(ItemType.FIREBALL));
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
