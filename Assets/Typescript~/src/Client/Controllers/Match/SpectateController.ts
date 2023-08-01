import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { CameraController } from "Client/Controllers/Global/Camera/CameraController";
import { OrbitCameraMode } from "Client/Controllers/Global/Camera/DefaultCameraModes/OrbitCameraMode";
import { EntityController } from "Client/Controllers/Global/Entity/EntityController";
import { Entity } from "Shared/Entity/Entity";
import { Game } from "Shared/Game";
import { Keyboard, Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { LocalEntityController } from "../Global/Character/LocalEntityController";
import { PlayerController } from "../Global/Player/PlayerController";
import { BWController } from "./BWController";

@Controller({})
export class SpectateController implements OnStart {
	public readonly spectateCamDistance = 5;

	private spectateIndex = 0;
	private currentlySpectatingEntityId = 0;

	constructor(
		private readonly cameraController: CameraController,
		private readonly entityController: EntityController,
		private readonly bwController: BWController,
	) {}

	OnStart() {
		// Start spectating once player is eliminated:
		ClientSignals.PlayerEliminated.Connect((event) => {
			if (event.player !== Game.LocalPlayer) return;
			this.StartSpectating();
		});

		const keyboard = new Keyboard();
		keyboard.OnKeyDown(KeyCode.M, (event) => {
			this.StartSpectating();
		});
	}

	public ObserveSpectatorTarget(callback: (entity: Entity | undefined) => CleanupFunc): () => void {
		let cleanup: CleanupFunc;
		let found = false;
		if (this.currentlySpectatingEntityId) {
			const entity = Entity.FindById(this.currentlySpectatingEntityId);
			if (entity) {
				found = true;
				cleanup = callback(entity);
			}
		}
		if (!found) {
			cleanup = callback(undefined);
		}

		const bin = new Bin();

		bin.Add(
			ClientSignals.SpectatorTargetChanged.Connect((event) => {
				cleanup?.();
				cleanup = callback(event.entity);
			}),
		);

		return () => {
			bin.Clean();
		};
	}

	public StartSpectating() {
		const entities = this.GetSortedEntities();
		if (entities.size() === 0) return;

		const bin = new Bin();

		const orbitCamMode = new OrbitCameraMode(entities[0].model.transform, this.spectateCamDistance);
		this.cameraController.SetMode(orbitCamMode);
		Dependency<LocalEntityController>().ForceFirstPersonMode(false);

		this.GoToIncrement(orbitCamMode, 0);

		// Handle changing who is spectated:
		const mouse = bin.Add(new Mouse());
		mouse.LeftDown.Connect(() => {
			this.GoToIncrement(orbitCamMode, 1);
		});
		mouse.RightDown.Connect(() => {
			this.GoToIncrement(orbitCamMode, -1);
		});

		bin.Connect(ClientSignals.EntitySpawn, (event) => {
			this.FitIndexToId();
		});

		bin.Connect(ClientSignals.EntityDespawn, (entity) => {
			// If currently-spectated entity goes away, switch to the next entity:
			if (entity.id === this.currentlySpectatingEntityId) {
				this.FitIndexToId();
				this.GoToIncrement(orbitCamMode, 1);
			} else {
				this.FitIndexToId();
			}
		});

		// Clean up after camera mode is changed:
		bin.Connect(this.cameraController.cameraSystem.ModeChangedBegin, (newMode, oldMode) => {
			if (oldMode === orbitCamMode) {
				bin.Clean();
			}
		});
	}

	/** Adjust the index to reflect the currently-spectated ID. */
	private FitIndexToId() {
		this.spectateIndex = math.max(
			0,
			this.GetSortedEntities().findIndex((e) => e.id === this.currentlySpectatingEntityId),
		);
	}

	/** Increment the index and switch view to entity at that index. */
	private GoToIncrement(mode: OrbitCameraMode, inc: number) {
		const entities = this.GetSortedEntities();
		this.spectateIndex = (this.spectateIndex + inc) % entities.size();
		const entity = entities[this.spectateIndex];
		this.currentlySpectatingEntityId = entity.id;
		mode.SetTransform(entity.model.transform);
		ClientSignals.SpectatorTargetChanged.Fire({ entity });
	}

	/** Get a list of valid entities that can be spectated, sorted by ID. */
	private GetSortedEntities(): Entity[] {
		const team = Game.LocalPlayer.GetTeam();
		if (team) {
			const alivePlayers = this.bwController.GetAlivePlayersOnTeam(team).mapFiltered((p) => p.Character);
			if (alivePlayers.size() > 0) {
				return alivePlayers;
			}
		}
		// Allow spectating everyone when no more teammates are alive.
		return Dependency<PlayerController>()
			.GetPlayers()
			.filter((p) => !this.bwController.IsPlayerEliminated(p))
			.mapFiltered((p) => p.Character);

		// All entities
		// return this.entityController
		// 	.GetEntities()
		// 	.filter((e) => !e.IsLocalCharacter())
		// 	.sort((a, b) => a.id < b.id);
	}
}
