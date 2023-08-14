import { Dependency } from "@easy-games/flamework-core";
import { ChatController } from "Client/Controllers/Chat/ChatController";
import { PlayerController } from "Client/Controllers/Player/PlayerController";
import { PlayerService } from "Server/Services/Player/PlayerService";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";
import { CoreNetwork } from "Shared/Network";
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
	public Character: CharacterEntity | undefined;
	/** Fired when the player's character changes. */
	public readonly CharacterChanged = new Signal<CharacterEntity | undefined>();
	/**
	 * Fired when the player disconnects from the server.
	 * Connections will automatically be disconnected when the player leaves.
	 */
	public readonly OnLeave = new Signal<void>();

	private team: Team | undefined;
	public readonly OnChangeTeam = new Signal<[team: Team | undefined, oldTeam: Team | undefined]>();

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
		public readonly userId: string,

		/**
		 * The player's username. Non-unique, unless combined with `usernameTag`.
		 */
		public readonly username: string,

		/**
		 * The player's username tag. Append this value onto `username` for a
		 * unique username.
		 * ```ts
		 * const uniqueName = `${player.username}#${player.usernameTag}`;
		 * ```
		 */
		public readonly usernameTag: string,
	) {}

	public SetTeam(team: Team): void {
		const oldTeam = this.team;
		this.team = team;
		this.OnChangeTeam.Fire(team, oldTeam);
	}

	public GetTeam(): Team | undefined {
		return this.team;
	}

	public SendMessage(message: string): void {
		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.ChatMessage.Server.FireClient(this.clientId, message);
		} else {
			Dependency<ChatController>().AddChatMessage(message);
		}
	}

	/** Is player friends with the local player? */
	public IsFriend(): boolean {
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
		print("setCharacter " + tostring(entity?.id));
		this.Character = entity;
		this.CharacterChanged.Fire(entity);
	}

	public ObserveCharacter(observer: (entity: Entity | undefined) => CleanupFunc): Bin {
		const bin = new Bin();
		let cleanup = observer(this.Character);

		bin.Add(
			this.CharacterChanged.Connect((newCharacter) => {
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
		this.OnLeave.Fire();
		this.OnLeave.DisconnectAll();
	}

	public static FindByClientId(clientId: number): Player | undefined {
		if (RunUtil.IsServer()) {
			return Dependency<PlayerService>().GetPlayerFromClientId(clientId);
		} else {
			return Dependency<PlayerController>().GetPlayerFromClientId(clientId);
		}
	}
}
