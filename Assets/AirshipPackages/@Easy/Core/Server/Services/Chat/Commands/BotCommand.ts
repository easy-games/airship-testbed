import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";

export class BotCommand extends ChatCommand {
	constructor() {
		super("bot", [], "[amount]");
	}

	public Execute(player: Player, args: string[]): void {
		let amount = 1;
		if (args.size() === 1) {
			let a = tonumber(args[0]);
			if (a === undefined || a <= 0) {
				player.SendMessage("Invalid usage. /bot [amount]");
				return;
			}
			amount = a;
		}

		player.SendMessage(`Spawning ${amount} bot${amount > 1 ? "s" : ""}...`);
		for (let i = 0; i < amount; i++) {
			const bot = Airship.Players.AddBotPlayer();
			bot.ObserveCharacter((character) => {
				if (character) {
					this.StartRandomMovement(character);
				}
			});
		}
		player.SendMessage(
			ColorUtil.ColoredText(Theme.green, `Finished spawning ${amount} bot${amount > 1 ? "s" : ""}!`),
		);
	}

	private StartRandomMovement(character: Character): void {
		const bin = new Bin();

		let randDirectionComponent = () => {
			let r = math.random();
			if (r < 1 / 3) {
				return -1;
			} else if (r < 2 / 3) {
				return 0;
			} else {
				return 1;
			}
		};

		const doMove = () => {
			let direction = new Vector3(randDirectionComponent(), 0, randDirectionComponent());
			character.movement.SetMoveInput(
				direction,
				math.random() < 0.2,
				math.random() < 0.5,
				math.random() < 0.2,
				false,
			);
			let lookVec = new Vector3(
				randDirectionComponent() * math.random(),
				randDirectionComponent() * math.random(),
				randDirectionComponent() * math.random(),
			);
			character.movement.SetLookVector(lookVec);
		};
		doMove();

		bin.Add(
			SetInterval(1.5, () => {
				doMove();
			}),
		);
		bin.Add(
			character.onDespawn.Connect(() => {
				bin.Clean();
			}),
		);
	}
}
