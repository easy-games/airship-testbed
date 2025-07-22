import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { ChatMessageNetworkEvent, CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Game } from "@Easy/Core/Shared/Game";
import { AirshipOutfit } from "../Airship/Types/AirshipPlatformInventory";
import { Team } from "../Team/Team";
import { Bin } from "../Util/Bin";
import { Signal } from "../Util/Signal";
import { TaskUtil } from "../Util/TaskUtil";

/** @internal */
export interface PlayerDto {
	netId: number;
	connectionId: number;
	userId: string;
	username: string;
	profileImageId: string;
	orgRoleName: string | undefined;
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
	 * The name of the role in the game's organization.
	 * This will be undefined if they are not a member of the organization.
	 */
	public readonly orgRoleName: string | undefined;

	/**
	 * The transfer data provided with the transfer request that moved the player to this server. This is the `clientTransferData` field
	 * on the client, and the `serverTransferData` field on the server.
	 */
	public readonly transferData: unknown | undefined;

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

	/**
	 * The player's selected outfit.
	 *
	 * OutfitDto's can be passed to Character.LoadUserOutfit()
	 */
	public selectedOutfit: AirshipOutfit | undefined;
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

	private lagCompRequests = new Map<string, { check: () => any; complete: (param: any) => void; result?: any }>();

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
		public readonly userId: string,

		/**
		 * The player's username. This should be used for display. Username can
		 * change, so to save a player's data use {@link userId}.
		 */
		public readonly username: string,

		orgRoleName: string | undefined,
		transferData: unknown | undefined,

		/**
		 * Image id used to fetch player's profile picture.
		 */
		public profileImageId: string,

		private playerInfo: PlayerInfo,
	) {
		if (playerInfo !== undefined) {
			this.SetVoiceChatAudioSource(playerInfo.voiceChatAudioSource);
		}
		if (this.orgRoleName === "") {
			this.orgRoleName = undefined;
		} else {
			this.orgRoleName = orgRoleName;
		}

		const simulationManager = AirshipSimulationManager.Instance as AirshipSimulationManager &
			AirshipSimulationManagerWithLagCompensation;
		const checkConnection = simulationManager.OnLagCompensationRequestCheck((id) => {
			const req = this.lagCompRequests.get(id);
			if (!req) return;
			req.result = TaskUtil.RunWithoutYield(() => {
				return req.check();
			});
		});
		this.bin.AddEngineEventConnection(checkConnection);

		const completeConnection = simulationManager.OnLagCompensationRequestComplete((id) => {
			const req = this.lagCompRequests.get(id);
			if (!req) return;
			TaskUtil.RunWithoutYield(() => {
				req.complete(req.result);
			});
			this.lagCompRequests.delete(id);
		});
		this.bin.AddEngineEventConnection(completeConnection);
	}

	/**
	 * Wait for a character for this given player
	 *
	 * @param timeout The timeout to wait for the character
	 * @yields Will yield the executing thread if a character does not yet exist on this player
	 */
	public WaitForCharacter(): Character;
	public WaitForCharacter(timeoutSeconds: number): Character | undefined;
	public WaitForCharacter(timeout?: number): Character | undefined {
		let character: Character | undefined = this.character;

		if (timeout !== undefined) {
			let expirationTime = Time.time + timeout;
			while (!character && Time.time < expirationTime) {
				character = this.character;
				task.wait();
			}

			return character;
		} else {
			while (!character) {
				character = this.onCharacterChanged.Wait();
			}

			return character;
		}
	}

	/**
	 * Can yield if the player's outfit hasn't finished downloading.
	 * @param position Spawn position of character
	 * @param config.lookDirection Initial facing direction of character
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
		if (config?.lookDirection && characterComponent.movement) {
			// try catch to not require c# update
			try {
				characterComponent.movement.startingLookVector = config.lookDirection;
			} catch (err) {}
		}

		if (!this.outfitLoaded) {
			// Load in outfit after spawn if it's not already downloaded
			task.spawn(() => {
				let startTime = Time.time;
				this.WaitForOutfitLoaded(15);
				if (characterComponent.IsAlive()) {
					if (Game.IsInternal()) {
						let diff = Time.time - startTime;
						if (diff > 0) {
							print("Waited " + math.floor(diff * 1000) + " ms for outfit.");
						}
					}
					if (this.selectedOutfit) {
						characterComponent.outfitDto = this.selectedOutfit;
						CoreNetwork.ServerToClient.Character.ChangeOutfit.server.FireAllClients(
							characterComponent.id,
							this.selectedOutfit,
						);
					} else {
						warn("Unable to load outfit for player: " + this.userId);
					}
				}
			});
		}

		// Server initalizes character.
		characterComponent.Init(this, Airship.Characters.MakeNewId(), this.selectedOutfit, 100, 100);
		this.SetCharacter(characterComponent);
		if (this.IsBot()) {
			const movementNetworking = go.GetComponent<CharacterNetworkedStateManager>();
			if (movementNetworking) {
				movementNetworking.serverAuth = true;
				movementNetworking.serverGeneratesCommands = true;
			}
			NetworkServer.Spawn(go);
		} else {
			NetworkServer.Spawn(go, this.networkIdentity.connectionToClient!);
		}
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
		if (Game.IsServer() && !Game.IsHosting()) {
			CoreNetwork.ServerToClient.ChatMessage.server.FireClient(this, { type: "sent", message });
		} else {
			if (this.userId !== Game.localPlayer.userId) error("Cannot SendMessage to non-local client.");

			// Defer here doesn't seem great. The purpose is to avoid "cannot broadcast from within a subscribed function"
			// The problem is numerous places (ex: messaging when invalid command, broadcasting player joined server msg) trigger
			// this to run. Ideally we can eventually support multiple broadcasts simultaneously but until that this patch works.
			task.defer(() => {
				contextbridge.broadcast<(msg: ChatMessageNetworkEvent) => void>("Chat:ProcessLocalMessage", {
					type: "sent",
					message,
				});
			});
		}
	}

	public IsBot(): boolean {
		return this.connectionId > 0 && this.connectionId < 50_000;
	}

	public Encode(): PlayerDto {
		return {
			netId: this.networkIdentity.netId,
			connectionId: this.connectionId,
			userId: this.userId,
			username: this.username,
			profileImageId: this.profileImageId,
			orgRoleName: this.orgRoleName,
			teamId: this.team?.id,
		};
	}

	public SetCharacter(character: Character | undefined): void {
		// if (!Game.IsServer()) {
		// 	error("Player.SetCharacter() must be called from the server.");
		// }
		// character?.networkIdentity.conn
		if (Game.IsServer() && character?.networkIdentity.isServer) {
			character?.networkIdentity.AssignClientAuthority(this.networkIdentity.connectionToClient!);
		}
		this.SetCharacterInternal(character);
		if (Game.IsServer() && !Game.IsHosting()) {
			CoreNetwork.ServerToClient.Character.SetCharacter.server.FireAllClients(this.connectionId, character?.id);
		}
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
				task.spawn(() => {
					cleanup?.();
					cleanup = observer(newCharacter);
				});
			}),
		);

		bin.Add(() => cleanup?.());
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

	/**
	 * Allows the server to perform a lag compensated check against the clients view of the world at the
	 * current server tick.
	 * @param checkFunc This function should be used to perform read only checks against the clients view of the world. For example, perform a raycast
	 * to check if the player actually hit another player.
	 * @param completeFunc This function should be used to perform actions based on the result of your check and will run against the current real view
	 * of the world as the server sees it. Use this function to apply damage or move the player.
	 * @returns Returns immediately after scheduling the lag compensation check. The check and complete functions will be called later.
	 */
	public LagCompensationCheck<CheckResult>(
		checkFunc: () => CheckResult,
		completeFunc: (checkResult: CheckResult) => void,
	) {
		if (!Game.IsServer()) {
			warn("Attempted to perform lag compensation check on the client. This is not allowed.");
			return;
		}

		const simulationManager = AirshipSimulationManager.Instance as AirshipSimulationManager &
			AirshipSimulationManagerWithLagCompensation;
		const checkId = simulationManager.RequestLagCompensationCheck(this.connectionId);
		if (!checkId) {
			warn(
				"Unable to schedule lag compensation for " +
					this.username +
					" (" +
					this.connectionId +
					"). Is the connection ID correct?",
			);
		}
		this.lagCompRequests.set(checkId, { check: checkFunc, complete: completeFunc });
	}
}
