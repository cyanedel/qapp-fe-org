import { create } from "zustand"
import type { CollectionDetailsValues } from "@/types/collection"

interface CollectionDraft {
  orgId: string
  summary: CollectionDetailsValues
}

interface CollectionDraftState {
  draft: CollectionDraft | null
  saveSummary: (summary: CollectionDetailsValues, orgId: string) => void
  clearDraft: () => void
}

export const useCollectionDraftStore = create<CollectionDraftState>((set) => ({
  draft: null,
  saveSummary: (summary, orgId) => set({ draft: { summary, orgId } }),
  clearDraft: () => set({ draft: null }),
}))
