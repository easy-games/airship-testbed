import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { ClientChatSingleton } from "@Easy/Core/Shared/MainMenu/Singletons/Chat/ClientChatSingleton";
import { OutfitDto } from "../Airship/Types/Outputs/AirshipPlatformInventory";
import { Team } from "../Team/Team";
import { Bin } from "../Util/Bin";
import { Signal } from "../Util/Signal";

/** @internal */
export interface PlayerDto {
	netId: number;
	connectionId: number;
	userId: string;
	username: string;
	profileImageId: string;
	teamId: string | undefined;
}

/**
 * The player object represents a client connected to your Airship game server (or a bot player if spawned).
 */
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

	/**
	 * The player's current team.
	 *
	 * You can add players to teams by using `team.AddPlayer(player)`
	 *
	 * Use {@link Airship.Teams} to get references to a team.
	 */
	public readonly team: Team | undefined;

	/**
	 * Fired on both client and server when player changes team.
	 */
	public readonly onChangeTeam = new Signal<[team: Team | undefined, oldTeam: Team | undefined]>();

	public onUsernameChanged = new Signal<[username: string]>();

	private bin = new Bin();
	private connected = true;

	public selectedOutfit: OutfitDto | undefined;
	public outfitLoaded = false;

	private hasDevPermissions = false;

	/**
	 * Audio source for player's voice chat. Attached to a Game Object that can be reparented to
	 * control voice chat position. By default this lives under the player's character and is
	 * muted for the local player.
	 */
	public readonly voiceChatAudioSource!: AudioSource;

	/**
	 * WARNING: not implemented yet. only returns local platform for now.
	 */
	public platform = AirshipPlatformUtil.GetLocalPlatform();

	/** @internal */
	constructor(
		/**
		 * Player network object
		 *
		 * @internal
		 */
		public readonly networkIdentity: NetworkIdentity,

		/**
		 * Unique network connection ID for the player in the given server. This ID
		 * is typically given to network requests as a way to identify the
		 * player to/from the server.
		 *
		 * This is not a unique identifier for the player outside of the
		 * server and will not persist. For a completely unique ID, use {@link userId}.
		 */
		public readonly connectionId: number,

		/**
		 * The player's unique ID. This is unique and unchanging per player.
		 *
		 * String length is <= 128 characters (but will likely be far shorter --
		 * typically 28 characters).
		 */
		public userId: string,

		/**
		 * The player's username. This should be used for display. Username can
		 * change, so to save a player's data use {@link userId}.
		 */
		public username: string,

		/**
		 * Image id used to fetch player's profile picture.
		 */
		public profileImageId: string,

		private playerInfo: PlayerInfo,
	) {
		if (playerInfo !== undefined) {
			this.SetVoiceChatAudioSource(playerInfo.voiceChatAudioSource);
		}
	}

	/**
	 * Returns true if this player is part of the group which owns the game.
	 *
	 * This is used to grant permissions to things like `/kick`
	 */
	public IsGameDeveloper(): boolean {
		return this.hasDevPermissions;
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
				: Airship.Characters.GetDefaultCharacterTemplate(),
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
				this.WaitForOutfitLoaded(10);
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

		//Server initalizes character.
		characterComponent.Init(this, Airship.Characters.MakeNewId(), this.selectedOutfit);
		this.SetCharacter(characterComponent);
		NetworkServer.Spawn(go, this.networkIdentity.connectionToClient!);
		Airship.Characters.RegisterCharacter(characterComponent);
		Airship.Characters.onCharacterSpawned.Fire(characterComponent);

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

	async GetProfileImageTextureAsync(): Promise<Texture2D | undefined> {
		return await Airship.Players.GetProfilePictureAsync(this.userId);
	}

	// public SetTeam(team: Team): void {
	// 	const oldTeam = this.team;
	// 	this.team = team;
	// 	this.onChangeTeam.Fire(team, oldTeam);
	// }

	// Keeping private so we don't break old games
	private GetTeam(): Team | undefined {
		return this.team;
	}

	/**
	 * Sends player a message in chat. If called from client this won't work on
	 * non-local players.
	 *
	 * @param message Message to send in chat.
	 */
	public SendMessage(message: string): void {
		if (Game.IsServer()) {
			CoreNetwork.ServerToClient.ChatMessage.server.FireClient(this, message, undefined, undefined);
		} else {
			if (this.userId !== Game.localPlayer.userId) error("Cannot SendMessage to non-local client.");

			Dependency<ClientChatSingleton>().RenderChatMessage(message);
		}
	}

	public IsBot(): boolean {
		return this.connectionId < 0;
	}

	public Encode(): PlayerDto {
		return {
			netId: this.networkIdentity.netId,
			connectionId: this.connectionId,
			userId: this.userId,
			username: this.username,
			profileImageId: this.profileImageId,
			teamId: this.team?.id,
		};
	}

	public SetCharacter(character: Character | undefined): void {
		if (!Game.IsServer()) {
			error("Player.SetCharacter() must be called from the server.");
		}
		this.SetCharacterInternal(character);
		CoreNetwork.ServerToClient.Character.SetCharacter.server.FireAllClients(this.connectionId, character?.id);
	}

	private SetCharacterInternal(character: Character | undefined): void {
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

	/**
	 * IsConnected will return ``true`` until a player disconnects from the server.
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

	/**
	 * @internal
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
	 * @internal
	 */
	private UpdateUsername(username: string): void {
		this.username = username;
		this.onUsernameChanged.Fire(username);
	}

	public Kick(message: string): void {
		if (Game.IsHosting()) {
			error("Unable to kick host.");
		}
		if (Game.IsGameLuauContext()) {
			contextbridge.invoke("player.kick", LuauContext.Protected, this.connectionId, message);
		} else {
			error("Player.Kick() must be called from game context.");
		}
	}
}
