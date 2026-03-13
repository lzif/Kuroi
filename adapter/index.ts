import { ProviderAdapter } from "./ProviderAdapter";
import { SamehadakuV2Adapter } from "./SamehadakuV2Adapter";

// Add other legacy adapters here once they are refactored to use the new ProviderAdapter interface
// import { OtakudesuAdapter } from "./OtakudesuAdapter";
// import { NimegamiAdapter } from "./NimegamiAdapter";

export const providers: ProviderAdapter[] = [
  new SamehadakuV2Adapter(),
  // new OtakudesuAdapter(),
  // new NimegamiAdapter(),
];

export function getProviderByName(name: string): ProviderAdapter | undefined {
  return providers.find((p) => p.name.toLowerCase() === name.toLowerCase());
}
