import { auth } from "@/lib/betterAuth/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getWatchlistByEmail } from "@/lib/actions/watchlist.actions";
import WatchlistButton from "@/components/WatchlistButton";
import Link from "next/link";
import SearchCommand from "@/components/SearchCommand";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";

export default async function WatchlistPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) redirect('/sign-in');

    const userEmail = session.user.email;
    const watchlist = userEmail ? await getWatchlistByEmail(userEmail) : [];

    // Get stocks with watchlist status for the search command
    let initialStocks: StockWithWatchlistStatus[] = [];
    if (userEmail) {
        const watchlistSymbols = await getWatchlistSymbolsByEmail(userEmail);
        const stocks = await searchStocks();
        initialStocks = stocks.map(stock => ({
            ...stock,
            isInWatchlist: watchlistSymbols.includes(stock.symbol)
        }));
    }

    return (
        <div className="flex min-h-screen">
            {watchlist.length === 0 ? (
                <div className="watchlist-empty-container flex">
                    <div className="watchlist-empty">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="watchlist-star"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
                            />
                        </svg>
                        <h2 className="empty-title">Your watchlist is empty</h2>
                        <p className="empty-description">
                            Search for stocks and add them to your watchlist to track their performance and get personalized updates.
                        </p>
                        <SearchCommand
                            renderAs="button"
                            initialStocks={initialStocks}
                        />
                    </div>
                </div>
            ) : (
                <div className="watchlist-container w-full">
                    <div className="watchlist">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="watchlist-title">My Watchlist</h1>
                            <SearchCommand
                                renderAs="button"
                                initialStocks={initialStocks}
                            />
                        </div>
                        <div className="watchlist-table">
                            <table className="w-full">
                                <thead>
                                    <tr className="table-header-row">
                                        <th className="table-header text-left py-3 px-4">Symbol</th>
                                        <th className="table-header text-left py-3 px-4">Company</th>
                                        <th className="table-header text-left py-3 px-4">Added</th>
                                        <th className="table-header text-right py-3 px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {watchlist.map((stock) => (
                                        <tr key={stock.symbol} className="table-row">
                                            <td className="table-cell py-4 px-4">
                                                <Link
                                                    href={`/stocks/${stock.symbol}`}
                                                    className="text-yellow-500 font-semibold hover:text-yellow-400 transition-colors"
                                                >
                                                    {stock.symbol}
                                                </Link>
                                            </td>
                                            <td className="table-cell py-4 px-4 text-gray-400">
                                                {stock.company}
                                            </td>
                                            <td className="table-cell py-4 px-4 text-gray-500 text-sm">
                                                {new Date(stock.addedAt).toLocaleDateString()}
                                            </td>
                                            <td className="table-cell py-4 px-4 text-right">
                                                <WatchlistButton
                                                    symbol={stock.symbol}
                                                    company={stock.company}
                                                    isInWatchlist={true}
                                                    type="icon"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
