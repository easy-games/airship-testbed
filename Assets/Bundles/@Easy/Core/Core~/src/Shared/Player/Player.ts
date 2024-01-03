import { Dependency } from "@easy-games/flamework-core";
import { ChatController } from "Client/Controllers/Chat/ChatController";
import { PlayerController } from "Client/Controllers/Player/PlayerController";
import { FriendsController } from "Client/MainMenuControllers/Social/FriendsController";
import { PlayerService } from "Server/Services/Player/PlayerService";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { ProfilePictureDefinitions } from "Shared/ProfilePicture/ProfilePictureDefinitions";
import { ProfilePictureId } from "Shared/ProfilePicture/ProfilePictureId";
import { ProfilePictureMeta } from "Shared/ProfilePicture/ProfilePictureMeta";
import { Team } from "../Team/Team";
import { Bin } from "../Util/Bin";
import { RunUtil } from "../Util/RunUtil";
import { Signal } from "../Util/Signal";

export interface PlayerDto {
	nobId: number;
	clientId: number;
	userId: string;
	username: string;
	usernameTag: string;
	teamId: string | undefined;
}

export class Player {
	/**
	 * The player controls this entity.
	 */
	public character: CharacterEntity | undefined;
	/** Fired when the player's character changes. */
	public readonly onCharacterChanged = new Signal<CharacterEntity | undefined>();
	/**
	 * Fired when the player disconnects from the server.
	 * Connections will automatically be disconnected when the player leaves.
	 */
	public readonly onLeave = new Signal<void>();

	private team: Team | undefined;
	public readonly onChangeTeam = new Signal<[team: Team | undefined, oldTeam: Team | undefined]>();

	public onUsernameChanged = new Signal<[username: string, tag: string]>();

	private profilePicture: ProfilePictureId = ProfilePictureId.BEAR;

	private bin = new Bin();
	private connected = true;

	constructor(
		/**
		 * The GameObject representing the player.
		 */
		public readonly nob: NetworkObject,

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

		/**
		 * The player's username tag. Append this value onto `username` for a
		 * unique username.
		 * ```ts
		 * const uniqueName = `${player.username}#${player.usernameTag}`;
		 * ```
		 */
		public usernameTag: string,
	) {}

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

	public UpdateUsername(username: string, tag: string): void {
		this.username = username;
		this.usernameTag = tag;
		this.onUsernameChanged.Fire(username, tag);
	}

	public SendMessage(message: string, sender?: Player): void {
		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.ChatMessage.server.FireClient(this.clientId, message);
		} else {
			Dependency<ChatController>().RenderChatMessage(message);
		}
	}

	/** Is player friends with the local player? */
	public IsFriend(): boolean {
		if (RunUtil.IsClient()) {
			return Dependency<FriendsController>().friends.find((u) => u.uid === this.userId) !== undefined;
		}
		return false;
	}

	public IsBot(): boolean {
		return this.clientId < 0;
	}

	public Encode(): PlayerDto {
		return {
			nobId: this.nob.ObjectId,
			clientId: this.clientId,
			userId: this.userId,
			username: this.username,
			usernameTag: this.usernameTag,
			teamId: this.team?.id,
		};
	}

	public SetCharacter(entity: CharacterEntity | undefined): void {
		this.character = entity;
		this.onCharacterChanged.Fire(entity);
	}

	public ObserveCharacter(observer: (entity: CharacterEntity | undefined) => CleanupFunc): Bin {
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

	public static FindByClientId(clientId: number): Player | undefined {
		if (RunUtil.IsServer()) {
			return Dependency<PlayerService>().GetPlayerFromClientId(clientId);
		} else {
			return Dependency<PlayerController>().GetPlayerFromClientId(clientId);
		}
	}
}
