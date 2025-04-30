import { OnStart, Singleton } from "@Easy/Core/Shared/Flamework";
import { Protected } from "@Easy/Core/Shared/Protected";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";
import { Game } from "../../Game";

interface SpeakingLevelEntry {
	speakingLevel: number;
	time: number;
}

@Singleton()
export class ProtectedVoiceChatSingleton implements OnStart {
	public connectionIdToSpeakingLevel = new Map<number, SpeakingLevelEntry>();

	constructor() {
		Protected.VoiceChat = this;

		contextbridge.callback("VoiceChat:GetSpeakingLevel", (from, connectionId: number) => {
			// if (Game.IsEditor()) {
			// 	return math.random();
			// }
			return this.connectionIdToSpeakingLevel.get(connectionId)?.speakingLevel ?? 0;
		});
	}

	OnStart(): void {
		const uniVoiceNetwork = Bridge.GetAirshipVoiceChatNetwork();
		uniVoiceNetwork.onPlayerSpeakingLevel.Connect((connectionId, speakingLevel) => {
			// print(`Player speaking connectionId=${connectionId} speakingLevel=${speakingLevel}`);
			this.connectionIdToSpeakingLevel.set(connectionId, {
				speakingLevel,
				time: Time.time,
			});
		});
		uniVoiceNetwork.onLocalSpeakingLevel.Connect((speakingLevel) => {
			this.connectionIdToSpeakingLevel.set(Game.localPlayer.connectionId, {
				speakingLevel,
				time: Time.time,
			});
		});

		// Cleanup mics stuck at a non zero volume
		SetInterval(0.5, () => {
			let toDelete: number[] = [];
			for (let [connectionId, entry] of this.connectionIdToSpeakingLevel) {
				if (Time.time - entry.time >= 1) {
					toDelete.push(connectionId);
				}
			}
			for (let conId of toDelete) {
				this.connectionIdToSpeakingLevel.delete(conId);
			}
		});
	}
}
