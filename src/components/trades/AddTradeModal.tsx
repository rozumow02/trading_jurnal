"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AddTradeModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants(), "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all")}>
        <Plus className="w-4 h-4 mr-2" />
        Add Trade
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-white/10 glass text-foreground">
        <DialogHeader>
          <DialogTitle>Add New Trade</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the details of your new trade below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 mt-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="symbol" className="text-right text-xs uppercase tracking-wider text-muted-foreground">
              Symbol
            </Label>
            <Input id="symbol" placeholder="BTC" className="col-span-3 bg-white/5 border-white/10" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="direction" className="text-right text-xs uppercase tracking-wider text-muted-foreground">
              Direction
            </Label>
            <Input id="direction" placeholder="long / short" className="col-span-3 bg-white/5 border-white/10" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right text-xs uppercase tracking-wider text-muted-foreground">
              Quantity
            </Label>
            <Input id="quantity" type="number" placeholder="0.10" className="col-span-3 bg-white/5 border-white/10" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="buy_price" className="text-right text-xs uppercase tracking-wider text-muted-foreground">
              Entry Price
            </Label>
            <Input id="buy_price" type="number" placeholder="76478.00" className="col-span-3 bg-white/5 border-white/10" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sell_price" className="text-right text-xs uppercase tracking-wider text-muted-foreground">
              Exit Price
            </Label>
            <Input id="sell_price" type="number" placeholder="76760.00" className="col-span-3 bg-white/5 border-white/10" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="bg-transparent border-white/10 hover:bg-white/5">
            Cancel
          </Button>
          <Button type="submit" onClick={() => setOpen(false)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
            Save Trade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
