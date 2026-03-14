import { AddItemFlow } from "@/components/items/add-item-flow";

export default function NewItemPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[30px] border border-white/60 bg-white/80 p-6 shadow-sm">
        <div className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Add item</div>
        <h1 className="mt-2 font-serif text-4xl text-foreground">Capture something for later</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
          Save a screenshot, URL, or note. IntentVault will classify it, let you review the AI
          output, and then store the final version.
        </p>
      </div>
      <AddItemFlow />
    </div>
  );
}
