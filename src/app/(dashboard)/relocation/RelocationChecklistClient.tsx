"use client";

import { useTransition } from "react";
import { toggleRelocationItem } from "@/lib/server-actions/relocation-actions";
import { Checkbox } from "@/components/ui/checkbox";

interface RelocationItem {
  id: string;
  country: string;
  item: string;
  category: string;
  done: boolean;
  dueDate: Date | null;
  notes: string | null;
}

export function RelocationChecklistClient({
  initialItems,
}: {
  initialItems: RelocationItem[];
}) {
  const [isPending, startTransition] = useTransition();

  // Group items by category
  const categories = Array.from(new Set(initialItems.map((item) => item.category)));

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleRelocationItem(id, !currentStatus);
    });
  };

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const categoryItems = initialItems.filter((i) => i.category === category);
        return (
          <div key={category} className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary">
              {category.replace("-", " ")}
            </h4>
            <div className="space-y-2">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]"
                >
                  <Checkbox
                    id={item.id}
                    checked={item.done}
                    disabled={isPending}
                    onCheckedChange={() => handleToggle(item.id, item.done)}
                    className="mt-0.5 border-white/30"
                  />
                  <div className="grid gap-1">
                    <label
                      htmlFor={item.id}
                      className={`text-sm font-medium leading-none cursor-pointer ${
                        item.done ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {item.item}
                    </label>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground">{item.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
