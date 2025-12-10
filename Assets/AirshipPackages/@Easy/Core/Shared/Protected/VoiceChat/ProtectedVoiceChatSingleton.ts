import { OnStart, Singleton } from "@Easy/Core/Shared/Flamework";
import { Protected } from "@Easy/Core/Shared/Protected";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";
import { Game } from "../../Game";
import inspect from "../../Util/Inspect";

interface SpeakingLevelEntry {
	speakingLevel: number;
	time: number;
}

@Singleton()
export class ProtectedVoiceChatSingleton implements OnStart {
	public connectionIdToSpeakingLevel = new Map<number, SpeakingLevelEntry>();

	private mutedUserIds = new Set<string>();
	private deafened = false;

	constructor() {
		Protected.VoiceChat = this;

		contextbridge.callback("VoiceChat:GetSpeakingLevel", (from, connectionId: number) => {
			// if (Game.IsEditor()) {
			// 	return math.random();
			// }
			return this.connectionIdToSpeakingLevel.get(connectionId)?.speakingLevel ?? 0;
		});

		contextbridge.callback("VoiceChat:SetDeafened", (from, deafened: boolean) => {
			this.SetDeafened(deafened);
		});

		contextbridge.callback("VoiceChat:IsDeafened", (from) => {
			return this.IsDeafened();
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
			AirshipUniVoice.ServerMute(player.connectionId, muted);
		}
	}

	public SetDeafened(deafen: boolean): void {
		this.deafened = deafen;
		AirshipUniVoice.ClientSetDeafened(this.deafened);
	}

	public IsDeafened(): boolean {
		return this.deafened;
	}

	public IsMuted(userId: string): boolean {
		return this.mutedUserIds.has(userId);
	}

	private NormalizeSpeakingLevel(speakingLevel: number): number {
		return math.lerpClamped(0, 1, speakingLevel / 0.62);
	}

	OnStart(): void {
		if (!Game.IsInGame()) return;

		AirshipUniVoice.OnSpeakingLevelChanged.Connect((connectionId, speakingLevel) => {
			print(inspect(connectionId));
			print("New speaking level for " + connectionId + ": " + speakingLevel);
			this.connectionIdToSpeakingLevel.set(connectionId, {
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
