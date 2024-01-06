import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { BlockInteractService } from "@Easy/Core/Server/Services/Block/BlockInteractService";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { OnStart, Service } from "@easy-games/flamework-core";

@Service()
export class BWTntService implements OnStart {
	public constructor(private readonly blockInteractionService: BlockInteractService) {}

	OnStart(): void {
		CoreServerSignals.BlockPlace.Connect((event) => {
			if (event.itemType === ItemType.TNT) {
				// Instant prime TNT
				this.blockInteractionService.ActivateBlockAtPosition(event.entity, event.pos);
			}
		});
	}
}
