import { Controller, OnStart } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import Object from "@easy-games/unity-object-utils";
import { RightClickMenuController } from "Client/MainMenuControllers/UI/RightClickMenu/RightClickMenuController";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { Mouse } from "Shared/UserInput";
import { CanvasAPI, PointerButton } from "Shared/Util/CanvasAPI";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Task } from "Shared/Util/Task";
import { AirshipUrl } from "Shared/Util/Url";
import { decode, encode } from "Shared/json";
import { AuthController } from "../Auth/AuthController";
import { MainMenuController } from "../MainMenuController";
import { SocketController } from "../Socket/SocketController";
import { User } from "../User/User";
import { FriendStatus } from "./SocketAPI";

@Controller({})
export class FriendsController implements OnStart {
	public friends: User[] = [];
	public incomingFriendRequests: User[] = [];
	public outgoingFriendRequests: User[] = [];
	public friendStatuses: FriendStatus[] = [];
	private renderedFriendUids = new Set<string>();
	private statusText = "";

	constructor(
		private readonly authController: AuthController,
		private readonly socketController: SocketController,
		private readonly mainMenuController: MainMenuController,
		private readonly rightClickMenuController: RightClickMenuController,
	) {}

	OnStart(): void {
		const friendsContent = this.mainMenuController.refs.GetValue("Social", "FriendsContent");
		friendsContent.ClearChildren();

		this.authController.WaitForAuthed().then(() => {
			this.SendStatusUpdate();
			this.FetchFriends();
		});

		this.socketController.On<{ initiatorId: string }>("user-service/friend-requested", (data) => {
			this.FetchFriends();
		});

		this.socketController.On<{ initiatorId: string }>("user-service/friend-accepted", (data) => {
			this.FetchFriends();
			this.socketController.Emit("refresh-friends-status");
		});

		this.socketController.On<FriendStatus[]>("game-coordinator/friend-status-update-multi", (data) => {
			for (const newFriend of data) {
				const existing = this.friendStatuses.find((f) => f.userId === newFriend.userId);
				if (existing) {
					Object.assign(existing, newFriend);
				} else {
					this.friendStatuses.push(newFriend);
				}
			}
			this.UpdateFriendsList();
		});

		this.socketController.On("game-coordinator/status-update-request", (data) => {
			this.SendStatusUpdate();
		});

		this.Setup();
	}

	public Setup(): void {
		const statusTextInput = this.mainMenuController.refs.GetValue("Social", "StatusInputField") as TMP_InputField;
		const savedStatus = StateManager.GetString("social:status-text");
		if (savedStatus) {
			this.statusText = savedStatus;
			statusTextInput.text = savedStatus;
		}
		CanvasAPI.OnInputFieldSubmit(statusTextInput.gameObject, (data) => {
			print("update status: " + data);
			this.statusText = data;
			StateManager.SetString("social:status-text", data);
			this.SendStatusUpdate();
			EventSystem.current.ClearSelected();
		});
	}

	public SetStatusText(text: string): void {
		this.statusText = text;
	}

	public GetStatusText(): string {
		return this.statusText;
	}

	public SendStatusUpdate(): void {
		const status: Partial<FriendStatus> = {
			userId: Game.LocalPlayer.userId,
			status: "online",
			metadata: {
				statusText: this.statusText,
			},
		};
		this.socketController.Emit("update-status", status);
	}

	public FetchFriends(): void {
		const res = HttpManager.GetAsync(
			AirshipUrl.UserService + "/friends/requests/self",
			this.authController.GetAuthHeaders(),
		);
		if (!res.success) {
			return;
		}
		const data = decode(res.data) as {
			friends: User[];
			outgoingRequests: User[];
			incomingRequests: User[];
		};
		this.friends = data.friends;
		this.incomingFriendRequests = data.incomingRequests;
		this.outgoingFriendRequests = data.outgoingRequests;

		// auto accept
		for (const user of this.incomingFriendRequests) {
			Task.Spawn(() => {
				const res = HttpManager.PostAsync(
					AirshipUrl.UserService + "/friends/requests/self",
					encode({
						discriminatedUsername: user.discriminatedUsername,
					}),
					this.authController.GetAuthHeaders(),
				);
			});
		}
	}

	public UpdateFriendsList(): void {
		let sorted = this.friendStatuses.sort((a, b) => {
			let aOnline = a.status === "online" || a.status === "in_game";
			let bOnline = b.status === "online" || b.status === "in_game";
			if (aOnline && !bOnline) {
				return true;
			}
			if (!aOnline && bOnline) {
				return false;
			}
			return a.username < b.username;
		});
		print("sorted: " + inspect(sorted.map((f) => f.username)));

		const onlineCount = this.friendStatuses.filter((f) => f.status === "online").size();
		const onlineCountText = this.mainMenuController.refs.GetValue("Social", "FriendsOnlineCounter") as TMP_Text;
		onlineCountText.text = `(${onlineCount}/${this.friendStatuses.size()})`;

		const mouse = new Mouse();

		// Add & update
		const friendsContent = this.mainMenuController.refs.GetValue("Social", "FriendsContent");
		let i = 0;
		for (const friend of sorted) {
			let go: GameObject | undefined = friendsContent.transform.FindChild(friend.userId)?.gameObject;
			let init = false;
			if (go === undefined) {
				go = GameObjectUtil.InstantiateIn(
					AssetBridge.LoadAsset("Imports/Core/Shared/Resources/Prefabs/UI/MainMenu/Friend.prefab"),
					friendsContent.transform,
				);
				go.name = friend.userId;
				this.renderedFriendUids.add(friend.userId);
				init = true;

				CanvasAPI.OnPointerEvent(go, (direction, button) => {
					if (button === PointerButton.RIGHT) {
						print("right clicked " + friend.username);
						this.rightClickMenuController.OpenRightClickMenu(
							this.mainMenuController.rootCanvas,
							mouse.GetLocation(),
							[
								{
									text: "Invite to Party",
									onClick: () => {
										this.socketController.Emit("invite-to-party", {
											userToAdd: friend.userId,
										});
									},
								},
								{
									text: "Send Message",
									onClick: () => {},
								},
								{
									text: "Unfriend",
									onClick: () => {},
								},
							],
						);
					}
				});
			}
			go.transform.SetSiblingIndex(i);

			const refs = go.GetComponent<GameObjectReferences>();
			const username = refs.GetValue("UI", "Username") as TMP_Text;
			const status = refs.GetValue("UI", "Status") as TMP_Text;
			const statusIndicator = refs.GetValue("UI", "StatusIndicator") as Image;
			const profileImage = refs.GetValue("UI", "ProfilePicture") as Image;
			const canvasGroup = go.GetComponent<CanvasGroup>();

			if (init) {
				const texture = AssetBridge.LoadAssetIfExists<Texture2D>(
					"Assets/Bundles/Imports/Core/Shared/Resources/Images/ProfilePictures/Cat.png",
				);
				if (texture !== undefined) {
					profileImage.sprite = Bridge.MakeSprite(texture);
				}
			}
			username.text = friend.username;
			if (friend.metadata) {
				status.text = friend.metadata.statusText;
			} else {
				status.text = "";
			}
			if (friend.status === "online") {
				canvasGroup.alpha = 1;
				statusIndicator.color = ColorUtil.HexToColor("#6AFF61");
				status.color = new Color(1, 1, 1, 1);
			} else if (friend.status === "in_game") {
				canvasGroup.alpha = 1;
				statusIndicator.color = ColorUtil.HexToColor("#70D4FF");
				status.color = ColorUtil.HexToColor("70D4FF");
				status.text = `Playing ${friend.game ?? "???"}`;
			} else {
				canvasGroup.alpha = 0.5;
				statusIndicator.color = ColorUtil.HexToColor("#9C9C9C");
				status.color = new Color(1, 1, 1, 1);
			}
			i++;
		}

		// Remove
		let removed = new Array<string>();
		for (const renderedUid of this.renderedFriendUids) {
			if (this.friendStatuses.find((f) => f.userId === renderedUid) === undefined) {
				const go = friendsContent.transform.FindChild(renderedUid);
				if (go) {
					GameObjectUtil.Destroy(go.gameObject);
					removed.push(renderedUid);
				}
			}
		}
		for (let uid of removed) {
			this.renderedFriendUids.delete(uid);
		}
	}
}
