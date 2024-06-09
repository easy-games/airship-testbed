import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { ClientChatSingleton } from "@Easy/Core/Shared/MainMenu/Singletons/Chat/ClientChatSingleton";
import { ProfilePictureDefinitions } from "@Easy/Core/Shared/ProfilePicture/ProfilePictureDefinitions";
import { ProfilePictureId } from "@Easy/Core/Shared/ProfilePicture/ProfilePictureId";
import { ProfilePictureMeta } from "@Easy/Core/Shared/ProfilePicture/ProfilePictureMeta";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";
import { OutfitDto } from "../Airship/Types/Outputs/AirshipPlatformInventory";
import { Team } from "../Team/Team";
import { Bin } from "../Util/Bin";
import { CSArrayUtil } from "../Util/CSArrayUtil";
import { Signal } from "../Util/Signal";

export interface PlayerDto {
	nobId: number;
	clientId: number;
	userId: string;
	username: string;
	teamId: string | undefined;
}

export class Player {
	/**
	 * The player controls this entity.
	 */
	public character: Character | undefined;
	/** Fired when the player's character changes. */
	public readonly onCharacterChanged = new Signal<Character | undefined>();
	/**
	 * Fired when the player disconnects from the server.
	 * Connections will automatically be disconnected when the player leaves.
	 */
	public readonly onLeave = new Signal<void>();

	private team: Team | undefined;
	public readonly onChangeTeam = new Signal<[team: Team | undefined, oldTeam: Team | undefined]>();

	public onUsernameChanged = new Signal<[username: string]>();

	private profilePicture: ProfilePictureId = ProfilePictureId.BEAR;

	private bin = new Bin();
	private connected = true;

	public selectedOutfit: OutfitDto | undefined;
	public outfitLoaded = false;

	public readonly voiceChatAudioSource!: AudioSource;

	/**
	 * WARNING: not implemented yet. only returns local platform for now.
	 */
	public platform = AirshipPlatformUtil.GetLocalPlatform();

	constructor(
		/**
		 * The GameObject representing the player.
		 */
		public readonly networkObject: NetworkObject,

		/**
		 * Unique network ID for the player in the given server. This ID
		 * is typically given to network requests as a way to identify the
		 * player to/from the server.
		 *
		 * This is not a unique identifier for the player outside of the
		 * server. For a completely unique ID, use `BWPlayer.clientId`
		 * instead.
		 */
		public readonly clientId: number,

		/**
		 * The player's unique ID. This is unique and unchanging per player.
		 *
		 * This should _not_ be used in network requests to identify the
		 * player. Use `clientId` for network requests.
		 */
		public userId: string,

		/**
		 * The player's username. Non-unique, unless combined with `usernameTag`.
		 */
		public username: string,

		private playerInfo: PlayerInfo,
	) {
		if (playerInfo !== undefined) {
			this.SetVoiceChatAudioSource(playerInfo.voiceChatAudioSource);
		}
	}

	/**
	 * @internal
	 * @param audioSource
	 */
	public SetVoiceChatAudioSource(audioSource: AudioSource): void {
		(this.voiceChatAudioSource as AudioSource) = audioSource;
		if (this.IsLocalPlayer()) {
			audioSource.volume = 0;
		} else {
			audioSource.volume = 1;
		}
	}

	/**
	 * Can yield if the player's outfit hasn't finished downloading.
	 * @param position
	 * @param config
	 * @returns
	 */
	public SpawnCharacter(
		position: Vector3,
		config?: {
			lookDirection?: Vector3;
			customCharacterTemplate?: GameObject;
		},
	): Character {
		if (!Game.IsServer()) {
			error("Player.SpawnCharacter must be called on the server.");
		}

		//Spawn with the custom character template or get the global character template
		const go = Object.Instantiate(
			config?.customCharacterTemplate
				? config.customCharacterTemplate
				: Airship.characters.GetDefaultCharacterTemplate(),
			position,
			Quaternion.identity,
		);
		go.name = `Character_${this.username}`;
		const characterComponent = go.GetAirshipComponent<Character>()!;
		if (config?.lookDirection) {
			characterComponent.movement.SetLookVector(config?.lookDirection);
		}

		if (!this.outfitLoaded) {
			// Load in outfit after spawn if it's not already downloaded
			task.spawn(() => {
				let startTime = Time.time;
				this.WaitForOutfitLoaded();
				if (characterComponent.IsAlive()) {
					if (Game.IsInternal()) {
						let diff = Time.time - startTime;
						if (diff > 0) {
							print("Waited " + math.floor(diff * 1000) + " ms for outfit.");
						}
					}
					characterComponent.outfitDto = this.selectedOutfit;
					CoreNetwork.ServerToClient.Character.ChangeOutfit.server.FireAllClients(
						characterComponent.id,
						this.selectedOutfit,
					);
				}
			});
		}

		characterComponent.Init(this, Airship.characters.MakeNewId(), this.selectedOutfit);
		this.SetCharacter(characterComponent);
		NetworkUtil.SpawnWithClientOwnership(go, this.clientId);
		Airship.characters.RegisterCharacter(characterComponent);
		Airship.characters.onCharacterSpawned.Fire(characterComponent);
		return characterComponent;
	}

	public WaitForOutfitLoaded(timeout?: number): void {
		let startTime = Time.time;
		while (!this.outfitLoaded) {
			if (this.outfitLoaded || (timeout !== undefined && Time.time - startTime >= timeout)) {
				break;
			}
			task.wait();
		}
	}

	public GetProfilePicture(): ProfilePictureMeta {
		return ProfilePictureDefinitions[this.profilePicture];
	}

	public SetTeam(team: Team): void {
		const oldTeam = this.team;
		this.team = team;
		this.onChangeTeam.Fire(team, oldTeam);
	}

	public GetTeam(): Team | undefined {
		return this.team;
	}

	public UpdateUsername(username: string): void {
		this.username = username;
		this.onUsernameChanged.Fire(username);
	}

	public SendMessage(message: string, sender?: Player): void {
		if (Game.IsServer()) {
			CoreNetwork.ServerToClient.ChatMessage.server.FireClient(this, message, undefined, undefined);
		} else {
			if (Game.IsProtectedLuauContext()) {
				Dependency<ClientChatSingleton>().RenderChatMessage(message);
			}
		}
	}

	public IsBot(): boolean {
		return this.clientId < 0;
	}

	public Encode(): PlayerDto {
		return {
			nobId: this.networkObject.ObjectId,
			clientId: this.clientId,
			userId: this.userId,
			username: this.username,
			teamId: this.team?.id,
		};
	}

	public SetCharacter(character: Character | undefined): void {
		this.character = character;
		this.onCharacterChanged.Fire(character);
	}

	public ObserveCharacter(observer: (character: Character | undefined) => CleanupFunc): Bin {
		const bin = new Bin();
		let cleanup = observer(this.character);

		bin.Add(
			this.onCharacterChanged.Connect((newCharacter) => {
				cleanup?.();
				cleanup = observer(newCharacter);
			}),
		);

		this.bin.Add(bin);
		return bin;
	}

	public IsLocalPlayer(): boolean {
		return Game.IsClient() && Game.localPlayer === this;
	}

	public IsInScene(sceneName: string): boolean {
		const scenes = CSArrayUtil.Convert(this.networkObject.LocalConnection.Scenes);
		if (scenes.find((s) => s.name === sceneName)) {
			return true;
		}
		return false;
	}

	/**
	 * Is the player connected to the server?
	 */
	public IsConnected(): boolean {
		return this.connected;
	}

	public Destroy(): void {
		this.connected = false;
		this.bin.Clean();
		this.onLeave.Fire();
		this.onLeave.DisconnectAll();
	}
}
