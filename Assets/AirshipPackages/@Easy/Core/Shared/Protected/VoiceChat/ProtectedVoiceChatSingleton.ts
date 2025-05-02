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
	public uniVoiceNetwork: AirshipUniVoiceNetwork;

	private mutedUserIds = new Set<string>();

	constructor() {
		Protected.VoiceChat = this;

		this.uniVoiceNetwork = Bridge.GetAirshipVoiceChatNetwork();

		contextbridge.callback("VoiceChat:GetSpeakingLevel", (from, connectionId: number) => {
			// if (Game.IsEditor()) {
			// 	return math.random();
			// }
			return this.connectionIdToSpeakingLevel.get(connectionId)?.speakingLevel ?? 0;
		});
	}

	public SetMuted(userId: string, muted: boolean): void {
		if (muted) {
			this.mutedUserIds.add(userId);
		} else {
			this.mutedUserIds.delete(userId);
		}

		const player = Protected.ProtectedPlayers.FindByUserId(userId);
		if (player) {
			this.uniVoiceNetwork.SetConnectionMuted(player.connectionId, muted);
		}
	}

	public IsMuted(userId: string): boolean {
		return this.mutedUserIds.has(userId);
	}

	private NormalizeSpeakingLevel(speakingLevel: number): number {
		return math.lerp(0, 1, speakingLevel / 0.62);
	}

	OnStart(): void {
		this.uniVoiceNetwork.onPlayerSpeakingLevel.Connect((connectionId, speakingLevel) => {
			// print(`Player speaking connectionId=${connectionId} speakingLevel=${speakingLevel}`);
			this.connectionIdToSpeakingLevel.set(connectionId, {
				speakingLevel: this.NormalizeSpeakingLevel(speakingLevel),
				time: Time.time,
			});
		});
		this.uniVoiceNetwork.onLocalSpeakingLevel.Connect((speakingLevel) => {
			this.connectionIdToSpeakingLevel.set(Game.localPlayer.connectionId, {
				speakingLevel: this.NormalizeSpeakingLevel(speakingLevel),
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
