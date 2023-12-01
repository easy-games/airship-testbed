import { OnStart, Service } from "@easy-games/flamework-core";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { decode, encode } from "Shared/json";
import { CreateServerResponse } from "./TransferServiceTypes";

@Service({})
export class TransferService implements OnStart {
	OnStart(): void {}

	public CreateServer(sceneId?: string): CreateServerResponse | undefined {
		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/servers/create",
			encode({
				sceneId: sceneId,
			}),
		);
		if (res.success) {
			const data = decode<{
				serverId: string;
			}>(res.data);
			return data;
		}
		return undefined;
	}
}
