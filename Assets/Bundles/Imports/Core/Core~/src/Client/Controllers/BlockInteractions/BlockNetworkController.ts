import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { BlockPlaceClientSignal } from "Client/Signals/BlockPlaceClientSignal";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Entity } from "Shared/Entity/Entity";
import { Block } from "Shared/VoxelWorld/Block";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

@Controller({})
export class BlockNetworkController implements OnStart {
	OnStart(): void {
		CoreNetwork.ServerToClient.BlockPlace.Client.OnServerEvent((pos, voxelData, entityId) => {
            const world = WorldAPI.GetMainWorld();
            if (!world) return;
			const voxel = new Block(voxelData, world);
			let placer: Entity | undefined;
			if (entityId !== undefined) {
				placer = Entity.FindById(entityId);
			}
			if (placer?.IsLocalCharacter()) {
				// we already client predicted this event.
				return;
			}

			CoreClientSignals.BlockPlace.Fire(new BlockPlaceClientSignal(pos, voxel, placer));
		});
	}
}
