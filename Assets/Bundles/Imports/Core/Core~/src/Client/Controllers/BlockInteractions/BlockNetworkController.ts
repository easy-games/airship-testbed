import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { BlockPlaceClientSignal } from "Client/Signals/BlockPlaceClientSignal";
import { Entity } from "Shared/Entity/Entity";
import { CoreNetwork } from "Shared/Network";
import { Block } from "Shared/VoxelWorld/Block";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

@Controller({})
export class BlockNetworkController implements OnStart {
	OnStart(): void {
		CoreNetwork.ServerToClient.BlockPlace.Client.OnServerEvent((pos, voxelData, entityId) => {
			const voxel = new Block(voxelData, WorldAPI.GetMainWorld());
			let placer: Entity | undefined;
			if (entityId !== undefined) {
				placer = Entity.FindById(entityId);
			}
			if (placer?.IsLocalCharacter()) {
				// we already client predicted this event.
				return;
			}

			ClientSignals.BlockPlace.Fire(new BlockPlaceClientSignal(pos, voxel, placer));
		});
	}
}
