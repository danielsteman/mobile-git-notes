import { githubProvider } from "./github";
import type { GitProvider } from "./types";

// For now, only GitHub is supported. This can be swapped in the future.
export const provider: GitProvider = githubProvider;
