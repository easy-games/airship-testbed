import { Entity } from "Shared/Entity/Entity";
import { Network } from "Shared/Network";
import { Bin } from "Shared/Util/Bin";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal } from "Shared/Util/Signal";
import { AccessorySlot } from "./AccessorySlot";
import { AccessoryType } from "./AccessoryType";

export class CharacterAccessories {
	public OnAccessoryRemoved = new Signal<AccessoryType>();
	public OnAccessoryAdded = new Signal<AccessoryType>();

	private accessories = new Map<AccessorySlot, string>();
	private bin = new Bin();

	private finishedFirstPass = false;

	constructor(private entity: Entity) {
		if (RunUtil.IsClient()) {
			this.bin.Add(
				Network.ServerToClient.SetAccessory.Client.OnServerEvent((entityId, slot, path) => {
					if (entityId === this.entity.id) {
						this.SetAccessory(slot, path);
					}
				}),
			);
			this.bin.Add(
				Network.ServerToClient.RemoveAccessory.Client.OnServerEvent((entityId, slot) => {
					if (entityId === this.entity.id) {
						this.RemoveAccessory(slot);
					}
				}),
			);
		}

		this.finishedFirstPass = true;
	}

	public SetAccessory(slot: AccessorySlot, accessoryPath: string): void {
		// const meta = GetAccessoryMeta(accessoryType);
		// let existing = this.accessories.get(slot);
		// if (existing) {
		// 	this.OnAccessoryRemoved.Fire(existing);
		// 	if (RunUtil.IsServer() && this.finishedFirstPass) {
		// 		Network.ServerToClient.RemoveAccessory.Server.FireAllClients(this.entity.Id, accessoryType);
		// 	}
		// }
		// this.accessories.set(meta.category, accessoryType);
		// this.OnAccessoryAdded.Fire(accessoryType);
		// if (RunUtil.IsServer() && this.finishedFirstPass) {
		// 	Network.ServerToClient.AddAccessory.Server.FireAllClients(this.entity.Id, accessoryType);
		// }
	}

	public RemoveAccessory(slot: AccessorySlot): void {
		// const meta = GetAccessoryMeta(accessoryType);
		// let existing = this.accessories.get(meta.category);
		// if (existing === accessoryType) {
		// 	this.OnAccessoryRemoved.Fire(accessoryType);
		// 	this.accessories.delete(meta.category);
		// }
	}

	public Unload(): void {
		this.bin.Clean();
	}

	public GetAccessories(): AccessoryType[] {
		return [];
		// return ObjectUtils.values(this.accessories);
	}
}
