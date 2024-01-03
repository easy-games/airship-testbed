import { Controller, OnStart } from "@easy-games/flamework-core";
import ObjectUtil from "@easy-games/unity-object-utils";
import { AudioManager } from "@Easy/Core/Shared/Audio/AudioManager";
import { Game } from "@Easy/Core/Shared/Game";
import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";
import { CoreSound } from "@Easy/Core/Shared/Sound/CoreSound";
import { CoreUI } from "@Easy/Core/Shared/UI/CoreUI";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";
import { Network } from "Shared/Network";
import { TeamUpgradeStateDto } from "Shared/TeamUpgrade/TeamUpgradeMeta";
import { TeamUpgradeType } from "Shared/TeamUpgrade/TeamUpgradeType";
import { TeamUpgradeUtil } from "Shared/TeamUpgrade/TeamUpgradeUtil";

@Controller({})
export class TeamUpgradeController implements OnStart {
	public localUpgradeMap = new Map<TeamUpgradeType, TeamUpgradeStateDto>();
	private canvas: Canvas;
	private content: Transform;
	constructor() {
		const go = GameObject.Find("TeamUpgradeShop");
		this.canvas = go.GetComponent<Canvas>();
		this.content = this.canvas.transform.FindChild("Content")!;

		let i = 0;
		const ordered: TeamUpgradeType[] = [
			TeamUpgradeType.TEAM_GENERATOR,
			TeamUpgradeType.DIAMOND_GENERATOR,
			TeamUpgradeType.DAMAGE,
			TeamUpgradeType.ARMOR_PROTECTION,
			TeamUpgradeType.BREAK_SPEED,
		];
		ordered.forEach((upgradeType) => {
			const card = this.content.GetChild(i);
			card.gameObject.name = upgradeType;

			const teamUpgradeMeta = TeamUpgradeUtil.GetTeamUpgradeMeta(upgradeType);
			const dto: TeamUpgradeStateDto = {
				teamUpgrade: teamUpgradeMeta,
				teamId: Game.localPlayer.GetTeam()?.id ?? "0",
				currentUpgradeTier: 0,
			};
			this.localUpgradeMap.set(upgradeType, dto);

			this.UpdateCard(upgradeType, true);

			i++;
		});
	}

	OnStart(): void {
		/* Sync up existing server state, if applicable. */
		Network.ServerToClient.TeamUpgrade.UpgradeSnapshot.client.OnServerEvent((dtos) => {
			dtos.forEach((dto) => {
				this.HandleUpgradeStateChange(dto.teamUpgrade.type, dto.currentUpgradeTier);
			});
		});
		/* Handle incoming team upgrade state change. */
		Network.ServerToClient.TeamUpgrade.UpgradeProcessed.client.OnServerEvent(
			(purchaserClientId, upgradeType, tier) => {
				this.HandleUpgradeStateChange(upgradeType, tier);

				if (purchaserClientId !== Game.localPlayer.clientId) {
					AudioManager.PlayGlobal(CoreSound.purchaseSuccess, {
						volumeScale: 0.3,
					});
				}
			},
		);
	}

	/** Updates team upgrade interface to reflect an incoming state change. */
	private HandleUpgradeStateChange(upgradeType: TeamUpgradeType, tier: number): void {
		// Update local client state.
		const state = this.localUpgradeMap.get(upgradeType);
		if (state) {
			state.currentUpgradeTier = tier;
		}

		this.UpdateCard(upgradeType);
	}

	/** Initializes interface with correct headers, costs, and tier descriptions. */
	private UpdateUI(): void {
		let i = 0;
		ObjectUtil.values(TeamUpgradeType).forEach((upgradeType) => {
			this.UpdateCard(upgradeType);
			i++;
		});
	}

	/** Initializes interface `VisualElement` that corresponds to type. */
	private UpdateCard(upgradeType: TeamUpgradeType, init = false): void {
		const state = this.localUpgradeMap.get(upgradeType);
		const tier = state?.currentUpgradeTier ?? 0;

		const card = this.GetUpgradeCard(upgradeType);
		const refs = card.GetComponent<GameObjectReferences>();
		const titleText = refs.GetValue<TMP_Text>("UI", "TitleText");
		const priceText = refs.GetValue<TMP_Text>("UI", "PriceText");
		const buttonImage = refs.GetValue<Image>("UI", "ButtonImage");
		const buttonText = refs.GetValue<TMP_Text>("UI", "ButtonText");
		const tier1Text = refs.GetValue<TMP_Text>("UI", "Tier1Text");
		const tier2Text = refs.GetValue<TMP_Text>("UI", "Tier2Text");
		const tier3Text = refs.GetValue<TMP_Text>("UI", "Tier3Text");
		const buttonGO = buttonImage.gameObject;

		// Update references.
		const upgradeMeta = TeamUpgradeUtil.GetTeamUpgradeMeta(upgradeType);
		titleText.text = upgradeMeta.displayName;

		// Tier 1
		const tier1Meta = TeamUpgradeUtil.GetUpgradeTierForType(upgradeType, 1);
		tier1Text.text = tier1Meta.description;
		if (tier >= 1) {
			tier1Text.color = new Color(1, 1, 1, 1);
		} else {
			tier1Text.color = new Color(1, 1, 1, 0.5);
		}

		// Tier 2
		const tier2Meta = TeamUpgradeUtil.GetUpgradeTierForType(upgradeType, 2);
		tier2Text.text = tier2Meta.description;
		if (tier >= 2) {
			tier2Text.color = new Color(1, 1, 1, 1);
		} else {
			tier2Text.color = new Color(1, 1, 1, 0.5);
		}

		// Tier 3.
		const tier3Meta = TeamUpgradeUtil.GetUpgradeTierForType(upgradeType, 3);
		tier3Text.text = tier3Meta.description;
		if (tier >= 3) {
			tier3Text.color = new Color(1, 1, 1, 1);
		} else {
			tier3Text.color = new Color(1, 1, 1, 0.5);
		}

		// Price
		switch (tier) {
			case 0:
				priceText.text = `${tier1Meta.cost} ${ItemUtil.GetItemDef(tier1Meta.currency).displayName}`;
				break;
			case 1:
				priceText.text = `${tier2Meta.cost} ${ItemUtil.GetItemDef(tier2Meta.currency).displayName}`;
				break;
			case 2:
				priceText.text = `${tier3Meta.cost} ${ItemUtil.GetItemDef(tier3Meta.currency).displayName}`;
				break;
			default:
				priceText.enabled = false;
		}

		if (tier < 3) {
			let canPurchase = false;
			if (tier < upgradeMeta.tiers.size()) {
				if (
					Game.localPlayer.character
						?.GetInventory()
						.HasEnough(upgradeMeta.tiers[tier].currency, upgradeMeta.tiers[tier].cost)
				) {
					canPurchase = true;
				}
			}
			if (canPurchase) {
				buttonImage.color = new Color(0.25, 0.72, 0.36, 1);
				buttonText.text = "Purchase";
			} else {
				buttonImage.color = new Color(0.67, 0.07, 0.15, 1);
				buttonText.text = "Not Enough";
			}
		} else {
			buttonImage.enabled = false;
			buttonText.enabled = false;
		}

		if (init) {
			CoreUI.SetupButton(buttonGO);
			CanvasAPI.OnClickEvent(buttonGO, () => {
				const currentTier = this.localUpgradeMap.get(upgradeType)?.currentUpgradeTier;
				if (currentTier !== undefined) {
					const nextTier = currentTier + 1;
					const result = Network.ClientToServer.TeamUpgrade.UpgradeRequest.client.FireServer(
						upgradeType,
						nextTier,
					);
					if (result) {
						AudioManager.PlayGlobal("@Easy/Core/Shared/Resources/Sound/ItemShopPurchase.wav", {
							volumeScale: 0.2,
						});
					}
				}
			});
		}
	}

	public Open(): void {
		this.UpdateUI();

		const bin = new Bin();
		const inv = Game.localPlayer.character?.GetInventory();
		if (inv) {
			inv.changed.Connect(() => {
				this.UpdateUI();
			});
		}

		if (Game.localPlayer.character) {
			const startingPos = Game.localPlayer.character.model.transform.position;
			bin.Add(
				SetInterval(0.1, () => {
					if (Game.localPlayer.character) {
						if (startingPos.sub(Game.localPlayer.character.model.transform.position).magnitude >= 1) {
							AppManager.Close();
						}
					}
				}),
			);
		}

		AppManager.Open(this.canvas, {
			onClose: () => {
				bin.Clean();
			},
		});
	}

	private GetUpgradeCard(upgradeType: TeamUpgradeType): GameObject {
		return this.content.FindChild(upgradeType)!.gameObject;
	}
}
