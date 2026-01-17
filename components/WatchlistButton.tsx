"use client";
import React, { useMemo, useState, useTransition } from "react";
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// WatchlistButton implementation that handles server actions.
// It toggles local state immediately for optimistic UI,
// then calls the appropriate server action.

interface WatchlistButtonProps {
  symbol: string;
  company: string;
  isInWatchlist: boolean;
  showTrashIcon?: boolean;
  type?: "button" | "icon";
  onWatchlistChange?: (symbol: string, isAdded: boolean) => void;
}

const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist,
  showTrashIcon = false,
  type = "button",
  onWatchlistChange,
}: WatchlistButtonProps) => {
  const [added, setAdded] = useState<boolean>(!!isInWatchlist);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const label = useMemo(() => {
    if (type === "icon") return added ? "" : "";
    return added ? "Remove from Watchlist" : "Add to Watchlist";
  }, [added, type]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const next = !added;
    setAdded(next); // Optimistic update

    // Call optional prop callback if provided
    onWatchlistChange?.(symbol, next);

    startTransition(async () => {
      try {
        let result;
        if (next) {
          result = await addToWatchlist(symbol, company);
          if (result.success) {
            toast.success(`Added ${symbol} to watchlist`);
          } else {
            throw new Error(result.error);
          }
        } else {
          result = await removeFromWatchlist(symbol);
          if (result.success) {
            toast.success(`Removed ${symbol} from watchlist`);
          } else {
            throw new Error(result.error);
          }
        }
        router.refresh();
      } catch (error: any) {
        setAdded(!next); // Revert on error
        toast.error(next ? `Failed to add ${symbol}` : `Failed to remove ${symbol}`, {
          description: error.message || "Please try again later"
        });
      }
    });
  };

  if (type === "icon") {
    return (
      <button
        title={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
        aria-label={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
        className={`watchlist-icon-btn p-2 rounded-full hover:bg-gray-700/50 transition-colors ${added ? "text-yellow-500" : "text-gray-400"} ${isPending ? "opacity-70 cursor-wait" : ""}`}
        onClick={handleClick}
        disabled={isPending}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={added ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      className={`watchlist-btn ${added ? "watchlist-remove" : ""} ${isPending ? "opacity-70 cursor-wait" : ""}`}
      onClick={handleClick}
      disabled={isPending}
    >
      {showTrashIcon && added ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 mr-2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 4v6m4-6v6m4-6v6" />
        </svg>
      ) : null}
      <span>{label}</span>
    </button>
  );
};

export default WatchlistButton;