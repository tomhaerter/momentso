export function useWorkspaces() {
  return useFetch("/api/workspaces", { key: "workspaces" })
}
