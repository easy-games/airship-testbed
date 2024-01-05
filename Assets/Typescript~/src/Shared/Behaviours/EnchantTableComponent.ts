import { ProximityPrompt } from "@Easy/Core/Client/Controllers/ProximityPrompt/ProximityPrompt";
import { ProximityPromptController } from "@Easy/Core/Client/Controllers/ProximityPrompt/ProximityPromptController";
import { GameObjectUtil } from "@Easy/Core/Shared/GameObject/GameObjectUtil";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Dependency } from "@easy-games/flamework-core";
import { Network } from "Shared/Network";

export default class EnchantTableComponent extends AirshipBehaviour {
	/** The team that **this** enchant table belongs to. */
	public teamId?: string = undefined;
	/** The table's network object id. */
	private nob = 0;
	/** Whether or not **this** enchant table is currently unlocked. */
	private unlocked = false;
	/** The prompt that corresponds to **this** enchant table. */
	private prompt: ProximityPrompt | undefined;
	/** The prompt clean up bin. Destroys prompt and disconnects current activation signal. */
	private promptBin = new Bin();

	public override Start(): void {
		this.nob = this.gameObject.GetComponent<NetworkObject>().ObjectId;
		if (RunCore.IsClient()) {
			const tableData = Network.ClientToServer.EnchantTable.EnchantTableStateRequest.client.FireServer(this.nob);
			this.teamId = tableData.teamId;
			this.unlocked = tableData.unlocked;
			this.SetupTable();
		}
	}

	public override OnDestroy(): void {}

	private SetupTable(): void {
		if (!this.unlocked) {
			this.CreateRepairPrompt();
		} else {
			this.CreatePurchasePrompt();
		}
		Network.ServerToClient.EnchantTable.EnchantTableUnlocked.client.OnServerEvent((tableNob) => {
			if (tableNob !== this.nob) return;
			// On repair, replace repair prompt with purchase prompt.
			// TODO: Clean up prompt destruction.
			this.unlocked = true;
			this.CreatePurchasePrompt();
		});
	}

	/**
	 * Creates repair proximity prompt. On prompt activation, repair request is sent to server.
	 */
	private CreateRepairPrompt(): void {
		this.promptBin.Clean();
		this.prompt = new ProximityPrompt({
			promptPosition: this.gameObject.transform.position.add(new Vector3(0, 2, 0)),
			activationKey: KeyCode.F,
			activationKeyString: "F",
			activationRange: 3,
			bottomText: "Repair",
			topText: "8 Diamonds",
		});
		this.promptBin.Add(() => {
			if (this.prompt?.promptGameObject) {
				GameObjectUtil.Destroy(this.prompt.promptGameObject);
				Dependency<ProximityPromptController>().RemovePrompt(this.prompt);
			}
		});
		this.promptBin.Add(
			this.prompt.onActivated.Connect(() => {
				Network.ClientToServer.EnchantTable.EnchantTableRepairRequest.client.FireServer(this.nob);
			}),
		);
	}

	/**
	 * Creates purchase proximity prompt. On activation, purchase request is sent to server.
	 */
	private CreatePurchasePrompt(): void {
		this.promptBin.Clean();
		this.prompt = new ProximityPrompt({
			promptPosition: this.gameObject.transform.position.add(new Vector3(0, 2, 0)),
			activationKey: KeyCode.F,
			activationKeyString: "F",
			activationRange: 3,
			bottomText: "Buy Enchant",
			topText: "2 Emeralds",
		});
		this.promptBin.Add(() => {
			if (this.prompt?.promptGameObject) {
				GameObjectUtil.Destroy(this.prompt.promptGameObject);
				Dependency<ProximityPromptController>().RemovePrompt(this.prompt);
			}
		});
		this.promptBin.Add(
			this.prompt.onActivated.Connect(() => {
				Network.ClientToServer.EnchantTable.EnchantPurchaseRequest.client.FireServer(this.nob);
			}),
		);
	}
}
