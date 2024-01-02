import { DenyRegionService } from "@Easy/Core/Server/Services/Block/DenyRegionService";
import { GeneratorService } from "@Easy/Core/Server/Services/Generator/GeneratorService";
import { GeneratorState } from "@Easy/Core/Server/Services/Generator/GeneratorState";
import { TeamService } from "@Easy/Core/Server/Services/Team/TeamService";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { Team } from "@Easy/Core/Shared/Team/Team";
import { MathUtil } from "@Easy/Core/Shared/Util/MathUtil";
import { Task } from "@Easy/Core/Shared/Util/Task";
import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { LoadedMap } from "./Map/LoadedMap";
import { MapService } from "./Map/MapService";

/** Generator deny region size. */
const DENY_REGION_SIZE = new Vector3(2, 3, 2);

@Service({})
export class GeneratorSpawnService implements OnStart {
	/** Loaded map data. */
	private loadedMap: LoadedMap | undefined;
	/** Mapping of team to generator ids. */
	private teamMap = new Map<Team, string[]>();

	constructor(
		private readonly mapService: MapService,
		private readonly generatorService: GeneratorService,
		private readonly teamService: TeamService,
		private readonly denyRegionService: DenyRegionService,
	) {}

	OnStart(): void {
		Task.Spawn(() => {
			// Wait map loaded and match started before creating generators.
			this.loadedMap = this.mapService.WaitForMapLoaded();
			ServerSignals.MatchStart.Connect(() => this.CreateMapGenerators());
		});
	}

	// Create map generators.
	private CreateMapGenerators(): void {
		const loadedMap = this.mapService.GetLoadedMap();
		if (!loadedMap) return;

		// Team generators.
		for (let team of this.teamService.GetTeams()) {
			const ironGeneratorPos = loadedMap.GetWorldPosition(team.id + "_generator");
			const generatorId = this.generatorService.CreateGenerator(ironGeneratorPos.position, {
				item: ItemType.IRON,
				spawnRate: 1,
				stackLimit: 100,
				nameLabel: true,
				nameOverride: "Team Generator",
				split: {
					range: 30,
				},
			});

			this.denyRegionService.CreateDenyRegion(MathUtil.FloorVec(ironGeneratorPos.position), DENY_REGION_SIZE);

			const teamGenerators = this.teamMap.get(team);
			if (teamGenerators) {
				teamGenerators.push(generatorId);
			} else {
				this.teamMap.set(team, [generatorId]);
			}
		}

		// Map generators.
		const diamondGenerators = loadedMap.GetWorldPositionsForTag("diamond");
		diamondGenerators.forEach((mapPosition) => {
			this.generatorService.CreateGenerator(mapPosition.position, {
				item: ItemType.DIAMOND,
				spawnRate: 25,
				stackLimit: 6,
				nameLabel: true,
				spawnTimeLabel: true,
			});
			// Create deny region on generator.
			this.denyRegionService.CreateDenyRegion(MathUtil.FloorVec(mapPosition.position), DENY_REGION_SIZE);
		});

		const emeraldGenerators = loadedMap.GetWorldPositionsForTag("emerald");
		emeraldGenerators.forEach((mapPosition) => {
			this.generatorService.CreateGenerator(mapPosition.position, {
				item: ItemType.EMERALD,
				spawnRate: 45,
				stackLimit: 3,
				nameLabel: true,
				spawnTimeLabel: true,
			});
			// Create deny region on generator.
			this.denyRegionService.CreateDenyRegion(MathUtil.FloorVec(mapPosition.position), DENY_REGION_SIZE);
		});
	}

	/**
	 * Register a new generator as belonging to a team.
	 * @param team A team.
	 * @param generatorId A generator id.
	 */
	public RegisterNewGeneratorForTeam(team: Team, generatorId: string): void {
		const teamGenerators = this.GetTeamGenerators(team);
		const generator = this.generatorService.GetGeneratorById(generatorId);
		if (!generator) return;
		if (!teamGenerators) {
			this.teamMap.set(team, [generatorId]);
		} else {
			this.teamMap.get(team)?.push(generatorId);
		}
	}

	/**
	 * Fetch all generators for team.
	 * @param team A team.
	 * @returns Generator state dtos for team.
	 */
	public GetTeamGenerators(team: Team): GeneratorState[] | undefined {
		return this.teamMap.get(team)?.mapFiltered((id) => this.generatorService.GetGeneratorById(id));
	}

	/**
	 * Fetch all generators for team that drop a particular item.
	 * @param team A team.
	 * @param generatorDropType Type of item generator drops.
	 * @returns Generator state dtos for team that drop `generatorDropType`.
	 */
	public GetTeamGeneratorByType(team: Team, generatorDropType: ItemType): GeneratorState[] | undefined {
		const teamGeneratorsIds = this.teamMap.get(team);
		if (!teamGeneratorsIds) return undefined;
		const generators = teamGeneratorsIds
			.mapFiltered((id) => {
				return this.generatorService.GetGeneratorById(id);
			})
			.filter((generatorState) => {
				return generatorState.dto.item === generatorDropType;
			});
		return generators;
	}
}
