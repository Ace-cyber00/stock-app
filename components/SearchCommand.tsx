"use client"

import { useEffect, useState } from "react"
import { CommandDialog, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { useDebounce } from "@/hooks/useDebounce";
import WatchlistButton from "@/components/WatchlistButton";

export default function SearchCommand({
  renderAs = 'button',
  label = 'Add stock',
  initialStocks,
  externalOpen,
  onOpenChange
}: SearchCommandProps & { externalOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

  // Handle external open state
  useEffect(() => {
    if (externalOpen !== undefined) {
      setOpen(externalOpen)
    }
  }, [externalOpen])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        handleOpenChange(!open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  const handleSearch = async () => {
    if (!isSearchMode) return setStocks(initialStocks);

    setLoading(true)
    try {
      const results = await searchStocks(searchTerm.trim());
      setStocks(results);
    } catch {
      setStocks([])
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  const handleSelectStock = () => {
    handleOpenChange(false);
    setSearchTerm("");
    setStocks(initialStocks);
  }

  const handleWatchlistChange = (symbol: string, isAdded: boolean) => {
    // Update local state to reflect watchlist change
    setStocks(prev => prev?.map(stock =>
      stock.symbol === symbol
        ? { ...stock, isInWatchlist: isAdded }
        : stock
    ) || []);
  }

  return (
    <>
      {renderAs === 'text' && label ? (
        <span onClick={() => handleOpenChange(true)} className="text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          {label}
        </span>
      ) : renderAs === 'button' && label ? (
        <Button onClick={() => handleOpenChange(true)} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
          {label}
        </Button>
      ) : null}

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <div className="flex items-center border-b border-white/10 px-3 bg-gray-900/80 backdrop-blur-xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 h-4 w-4 shrink-0 opacity-50 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <CommandInput
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search stocks..."
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 text-white"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />}
        </div>
        <CommandList className="max-h-[400px] overflow-y-auto p-2 bg-gray-900/90 backdrop-blur-xl border-t border-white/5">
          {loading ? (
            <CommandEmpty className="py-6 text-center text-sm text-gray-500">Searching markets...</CommandEmpty>
          ) : displayStocks?.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2 opacity-20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <p>{isSearchMode ? 'No stocks found matching your query.' : 'No stocks available.'}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSearchMode ? `Search Results (${displayStocks?.length || 0})` : 'Trending Stocks'}
              </div>
              {displayStocks?.map((stock, i) => (
                <div key={stock.symbol} className="relative group">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10 transition-colors group">
                    <Link
                      href={`/stocks/${stock.symbol}`}
                      onClick={handleSelectStock}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-white/5 font-bold text-gray-400 group-hover:text-yellow-500 group-hover:border-yellow-500/30 transition-colors">
                        {stock.symbol.substring(0, 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-200 truncate group-hover:text-white transition-colors">
                            {stock.symbol}
                          </span>
                          <span className="text-xs text-gray-500 border border-gray-700 px-1.5 rounded bg-gray-800/50">
                            {stock.exchange}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 truncate group-hover:text-gray-300">
                          {stock.name}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center pl-2">
                      <WatchlistButton
                        symbol={stock.symbol}
                        company={stock.name}
                        isInWatchlist={stock.isInWatchlist}
                        type="icon"
                        onWatchlistChange={handleWatchlistChange}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
