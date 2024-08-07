import { Game } from "../Game";

export class NetworkUtil {
	public static GetNetworkIdentity(netId: number): NetworkIdentity | undefined {
		if (netId === undefined) {
			return undefined;
		}
		if (Game.IsServer()) {
			if (NetworkServer.spawned.ContainsKey(netId)) {
				return NetworkServer.spawned.Get(netId)!;
			}
			return undefined;
		} else {
			if (NetworkClient.spawned.ContainsKey(netId)) {
				return NetworkClient.spawned.Get(netId);
			}

			return undefined;
		}
	}

	/**
	 * Wait for (`timeout`) and fetch `NetworkObject` that corresponds to `objectId`.
	 * @param netId Corresponds to a replicated `NetworkObject`.
	 * @param timeout How long in seconds to wait for `objectId` to exist before timing out.
	 * @returns `NetworkObject` that corresponds to `objectId`.
	 */
	public static WaitForNetworkIdentityTimeout(netId: number, timeout: number): NetworkIdentity | undefined {
		// Return NetworkObject if it already exists.
		let nob = NetworkUtil.GetNetworkIdentity(netId);
		if (nob) return nob;
		// Return when exists or timeout after `timeout`.
		let elapsed = 0;
		while (true) {
			task.wait();
			nob = NetworkUtil.GetNetworkIdentity(netId);
			elapsed += Time.deltaTime;
			if (nob) return nob;
			if (elapsed >= timeout) {
				return undefined;
			}
		}
	}

	/**
	 * Wait for and fetch `NetworkObject` that corresponds to `objectId`.
	 * @param netId Corresponds to a replicated `NetworkObject`.
	 * @returns `NetworkObject` that corresponds to `objectId`.
	 */
	public static WaitForNetworkIdentity(netId: number): NetworkIdentity {
		let networkIdentity = NetworkUtil.GetNetworkIdentity(netId);
		if (networkIdentity) {
			return networkIdentity;
		}
		while (true) {
			task.wait();
			networkIdentity = NetworkUtil.GetNetworkIdentity(netId);
			if (networkIdentity) {
				return networkIdentity;
			}
		}
	}
}
