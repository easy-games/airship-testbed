import { GeneratorDto } from "@Easy/Core/Shared/Generator/GeneratorMeta";

export interface GeneratorState {
	dto: GeneratorDto;
	stackSize: number;
	stackLimit: number;
	originalSpawnRate: number;
	split?: {
		range: number;
	};
	ticker?: () => void;
}
