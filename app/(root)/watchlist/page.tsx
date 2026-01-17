import { auth } from "@/lib/betterAuth/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getWatchlistByEmail } from "@/lib/actions/watchlist.actions";
import WatchlistButton from "@/components/WatchlistButton";
import Link from "next/link";
import SearchCommand from "@/components/SearchCommand";
import { searchStocks, getQuotes } from "@/lib/actions/finnhub.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";

export default async function WatchlistPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) redirect('/sign-in');

    const userEmail = session.user.email;
    const watchlist = userEmail ? await getWatchlistByEmail(userEmail) : [];

    // Get quotes for watchlist items
    const symbols = watchlist.map(item => item.symbol);
    const quotes = symbols.length > 0 ? await getQuotes(symbols) : {};

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
        <div className="flex min-h-screen w-full flex-col">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
                            My Watchlist
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Track your favorite stocks in real-time
                        </p>
                    </div>
                    <div className="w-full md:w-auto">
                        <SearchCommand
                            renderAs="button"
                            initialStocks={initialStocks}
                        />
                    </div>
                </div>

                {watchlist.length === 0 ? (
                    <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[400px] border border-gray-800 rounded-2xl bg-gray-900/50 backdrop-blur-sm p-8 text-center animate-in fade-in zoom-in duration-500">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="relative w-20 h-20 text-yellow-500"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-200 mb-2">Your watchlist is empty</h2>
                        <p className="text-gray-400 max-w-md mx-auto mb-8">
                            Start building your portfolio by adding stocks you want to track.
                        </p>
                        <SearchCommand
                            renderAs="button"
                            initialStocks={initialStocks}
                        />
                    </div>
                ) : (
                    <div className="w-full relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/40 backdrop-blur-md shadow-2xl">
                        {/* Glassmorphism Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-800/60 bg-gray-900/40 text-xs uppercase tracking-wider text-gray-400">
                                        <th className="py-4 px-6 font-medium">Symbol</th>
                                        <th className="py-4 px-6 font-medium">Company</th>
                                        <th className="py-4 px-6 font-medium text-right">Price</th>
                                        <th className="py-4 px-6 font-medium text-right">Change</th>
                                        <th className="py-4 px-6 font-medium text-right">% Change</th>
                                        <th className="py-4 px-6 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/60">
                                    {watchlist.map((stock) => {
                                        const quote = quotes[stock.symbol];
                                        const isPositive = quote?.d >= 0;
                                        const isNegative = quote?.d < 0;

                                        return (
                                            <tr
                                                key={stock.symbol}
                                                className="group transition-colors hover:bg-white/[0.02]"
                                            >
                                                <td className="py-4 px-6">
                                                    <Link
                                                        href={`/stocks/${stock.symbol}`}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <span className="font-bold text-lg text-white group-hover:text-yellow-500 transition-colors">
                                                            {stock.symbol}
                                                        </span>
                                                    </Link>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-gray-400 font-medium">
                                                        {stock.company}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="font-mono text-base font-semibold text-gray-200">
                                                        {quote?.c ? `$${quote.c.toFixed(2)}` : '—'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className={`font-mono font-medium ${isPositive ? 'text-teal-400' : isNegative ? 'text-red-400' : 'text-gray-400'}`}>
                                                        {quote?.d ? `${isPositive ? '+' : ''}${quote.d.toFixed(2)}` : '—'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-opacity-10 ${isPositive ? 'bg-teal-400/10 text-teal-400' : isNegative ? 'bg-red-400/10 text-red-400' : 'bg-gray-700 text-gray-400'}`}>
                                                        {quote?.dp ? `${isPositive ? '+' : ''}${quote.dp.toFixed(2)}%` : '—'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <WatchlistButton
                                                        symbol={stock.symbol}
                                                        company={stock.company}
                                                        isInWatchlist={true}
                                                        type="icon"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
