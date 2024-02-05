import { Controller, OnStart, Service } from "Shared/Flamework";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Game } from "Shared/Game";
import { Keyboard, Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal } from "Shared/Util/Signal";
import Inventory from "./Inventory";
import { ItemStack } from "./ItemStack";

/**
 * The CharacterInventorySingleton is responsible for controlling
 * the inventory attached to your local character.
 */
@Controller({})
@Service({})
export class CharacterInventorySingleton implements OnStart {
	public localInventory?: Inventory;

	private enabled = true;
	private disablers = new Set<number>();
	private disablerCounter = 1;

	public heldSlotChanged = new Signal<number>();
	public localInventoryChanged = new Signal<Inventory>();

	private lastScrollTime = 0;
	private scrollCooldown = 0.05;

	OnStart(): void {
		if (!RunUtil.IsClient()) return;

		Game.localPlayer.ObserveCharacter((character) => {
			if (character) {
				this.SetLocalInventory(character.inventory);
			}
		});

		const keyboard = new Keyboard();
		const mouse = new Mouse();

		const hotbarKeys = [
			KeyCode.Alpha1,
			KeyCode.Alpha2,
			KeyCode.Alpha3,
			KeyCode.Alpha4,
			KeyCode.Alpha5,
			KeyCode.Alpha6,
			KeyCode.Alpha7,
			KeyCode.Alpha8,
			KeyCode.Alpha9,
		];

		for (const hotbarIndex of $range(0, hotbarKeys.size() - 1)) {
			keyboard.OnKeyDown(hotbarKeys[hotbarIndex], (event) => {
				// if (!this.enabled || event.uiProcessed) return;
				this.SetHeldSlot(hotbarIndex);
			});
		}

		keyboard.OnKeyDown(KeyCode.Q, (event) => {
			if (!this.enabled || event.uiProcessed) return;
			this.DropItemInHand();
		});

		// Scroll to select held item:
		mouse.scrolled.Connect((event) => {
			if (!this.enabled || event.uiProcessed) return;
			// print("scroll: " + delta);
			if (math.abs(event.delta) < 0.05) return;

			const now = Time.time;
			if (now - this.lastScrollTime < this.scrollCooldown) {
				return;
			}

			this.lastScrollTime = now;

			const selectedSlot = this.localInventory?.GetHeldSlot();
			if (selectedSlot === undefined) return;

			const inc = event.delta < 0 ? 1 : -1;
			let trySlot = selectedSlot;

			// Find the next available item in the hotbar:
			for (const _ of $range(1, hotbarKeys.size())) {
				trySlot += inc;

				// Clamp index to hotbar items:
				if (inc === 1 && trySlot >= hotbarKeys.size()) {
					trySlot = 0;
				} else if (inc === -1 && trySlot < 0) {
					trySlot = hotbarKeys.size() - 1;
				}

				// If the item at the given `trySlot` index exists, set it as the held item:
				const itemAtSlot = this.localInventory?.GetItem(trySlot);
				if (itemAtSlot !== undefined) {
					this.SetHeldSlot(trySlot);
					break;
				}
			}
		});
	}

	public SetHeldSlot(slot: number): void {
		assert(RunUtil.IsClient(), "SetHeldSlot cannot be used on the server.");

		if (Game.localPlayer.character === undefined) return;
		if (this.localInventory === undefined) return;

		this.localInventory.SetHeldSlot(slot);
		this.heldSlotChanged.Fire(slot);
		CoreNetwork.ClientToServer.SetHeldSlot.client.FireServer(slot);
	}

	public DropItemInHand(): void {
		const heldItem = this.localInventory?.GetHeldItem();
		if (heldItem) {
			CoreNetwork.ClientToServer.DropItemInSlot.client.FireServer(this.localInventory!.GetHeldSlot(), 1);
		}
	}

	public DropItemInSlot(slot: number, amount: number): void {
		CoreNetwork.ClientToServer.DropItemInSlot.client.FireServer(slot, amount);
	}

	public SetLocalInventory(inventory: Inventory): void {
		this.localInventory = inventory;
		this.localInventoryChanged.Fire(inventory);
	}

	public ObserveLocalInventory(callback: (inv: Inventory) => CleanupFunc): Bin {
		const bin = new Bin();
		let cleanup: CleanupFunc;
		if (this.localInventory) {
			cleanup = callback(this.localInventory);
		}

		bin.Add(
			this.localInventoryChanged.Connect((inv) => {
				cleanup = callback(inv);
			}),
		);
		bin.Add(() => {
			cleanup?.();
		});
		return bin;
	}

	public ObserveLocalHeldItem(callback: (itemStack: ItemStack | undefined) => CleanupFunc): Bin {
		const bin = new Bin();

		let cleanup: CleanupFunc;

		const invBin = new Bin();
		bin.Add(
			this.ObserveLocalInventory((inv) => {
				invBin.Clean();
				if (inv) {
					invBin.Add(
						inv.ObserveHeldItem((itemStack) => {
							cleanup?.();
							cleanup = callback(itemStack);
						}),
					);
				} else {
					cleanup = callback(undefined);
				}
			}),
		);
		return bin;
	}

	public AddDisabler(): () => void {
		const id = this.disablerCounter;
		this.disablerCounter++;
		this.disablers.add(id);
		this.enabled = false;
		return () => {
			this.disablers.delete(id);
			if (this.disablers.size() === 0) {
				this.enabled = true;
			} else {
				this.enabled = false;
			}
		};
	}
}
