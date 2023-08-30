import { Controller, OnStart } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { Task } from "Shared/Util/Task";
import { AirshipUrl } from "Shared/Util/Url";
import { decode, encode } from "Shared/json";
import { AuthController } from "../Auth/AuthController";
import { SocketController } from "../Socket/SocketController";
import { User } from "../User/User";

@Controller({})
export class FriendsController implements OnStart {
	public friends: User[] = [];
	public incomingFriendRequests: User[] = [];
	public outgoingFriendRequests: User[] = [];

	constructor(private readonly authController: AuthController, private readonly socketController: SocketController) {}

	OnStart(): void {
		this.authController.WaitForAuthed().then(() => {
			this.Update();
		});

		this.socketController.On<{ initiatorId: string }>("user-service/friend-requested", (data) => {
			this.Update();
		});

		this.socketController.On<{ initiatorId: string }>("user-service/friend-accepted", (data) => {
			this.Update();
		});
	}

	public Update(): void {
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
		print("friends packet: " + inspect(data));
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
}
