import { Controller, OnStart } from "@easy-games/flamework-core";
import { Network } from "../../../../Shared/Network";
import { Block } from "../../../../Shared/VoxelWorld/Block";
import { Entity } from "../../../../Shared/Entity/Entity";
import { WorldAPI } from "../../../../Shared/VoxelWorld/WorldAPI";
import { ClientSignals } from "../../../ClientSignals";

@Controller({})
export class ClientPredictionEventWrapper implements OnStart {
	OnStart(): void {
		Network.ServerToClient.BlockPlace.Client.OnServerEvent((pos, voxelData, entityId) => {
			const voxel = new Block(voxelData, WorldAPI.GetMainWorld());
			let placer: Entity | undefined;
			if (entityId !== undefined) {
				placer = Entity.FindById(entityId);
			}
			if (placer?.IsLocalCharacter()) {
				// we already client predicted this event.
				return;
			}

			const BlockPlaceClientSignal = import("Client/Signals/BlockPlaceClientSignal").expect()
				.BlockPlaceClientSignal;
			ClientSignals.BlockPlace.Fire(new BlockPlaceClientSignal(pos, voxel, placer));
		});
	}
}
