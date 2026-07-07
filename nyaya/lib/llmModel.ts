// Single source of truth for the LLM served through NVIDIA's
// OpenAI-compatible endpoint. Kept dependency-free so both the Node action
// runtime (lib/llm.ts) and the default Convex runtime (convex/analysisData.ts)
// can import it.
export const LLM_MODEL = "minimaxai/minimax-m3";
