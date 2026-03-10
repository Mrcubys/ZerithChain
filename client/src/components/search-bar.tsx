import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({ placeholder = "Search by block height, tx hash, or address...", className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const result = await res.json();

      if (result.type === "block") {
        setLocation(`/explorer/block/${(result.data as { height: number }).height}`);
      } else if (result.type === "tx") {
        setLocation(`/explorer/tx/${(result.data as { hash: string }).hash}`);
      } else if (result.type === "address") {
        setLocation(`/explorer/address/${(result.data as { address: string }).address}`);
      } else {
        toast({
          title: "Not found",
          description: "No results found for your search query.",
          variant: "destructive",
        });
      }
      setQuery("");
    } catch {
      toast({ title: "Search failed", description: "Could not complete search.", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSearch} className={`flex gap-2 ${className ?? ""}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          data-testid="input-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9 font-mono text-sm bg-card border-border/50"
        />
      </div>
      <Button type="submit" data-testid="button-search" size="default">
        <Search className="w-4 h-4 mr-1.5" />
        Search
      </Button>
    </form>
  );
}
