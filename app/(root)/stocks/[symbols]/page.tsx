import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants";
import { auth } from "@/lib/betterAuth/auth";
import { headers } from "next/headers";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions"; // You'll need to export this if not already

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbols } = await params;
  const symbol = symbols;
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

  // Fetch session and watchlist status
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let isInWatchlist = false;
  if (session?.user?.email) {
    const watchlistSymbols = await getWatchlistSymbolsByEmail(session.user.email);
    isInWatchlist = watchlistSymbols.includes(symbol.toUpperCase());
  }

  return (
    <div className="flex flex-col min-h-screen w-full container py-8 gap-8">
      {/* Header Area */}
      <div className="flex items-center justify-between glass-panel p-6 rounded-xl">
        <div>
          <span className="text-gray-400 text-sm font-medium">Stock Details</span>
          <h1 className="text-3xl font-bold text-white tracking-tight">{symbol.toUpperCase()}</h1>
        </div>
        <div>
          <WatchlistButton
            symbol={symbol.toUpperCase()}
            company={symbol.toUpperCase()} // Ideally fetch company name, but symbol suffices for now
            isInWatchlist={isInWatchlist}
            showTrashIcon={false}
          />
        </div>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">
        {/* Main Chart Column (2/3 width on large screens) */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          <div className="glass-card rounded-xl p-1 overflow-hidden">
            <TradingViewWidget
              scriptUrl={`${scriptUrl}symbol-info.js`}
              config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
              height={170}
              className="w-full"
            />
          </div>

          <div className="glass-card rounded-xl p-1 overflow-hidden h-[600px]">
            <TradingViewWidget
              scriptUrl={`${scriptUrl}advanced-chart.js`}
              config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
              className="custom-chart w-full h-full"
              height={600}
            />
          </div>

          <div className="glass-card rounded-xl p-1 overflow-hidden h-[500px]">
            <TradingViewWidget
              scriptUrl={`${scriptUrl}advanced-chart.js`}
              config={BASELINE_WIDGET_CONFIG(symbol)}
              className="custom-chart w-full h-full"
              height={500} // Slightly smaller baseline chart
            />
          </div>
        </div>

        {/* Sidebar Column (1/3 width) */}
        <div className="flex flex-col gap-8">
          <div className="glass-card rounded-xl p-1 overflow-hidden">
            <TradingViewWidget
              scriptUrl={`${scriptUrl}technical-analysis.js`}
              config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
              height={400}
              className="w-full"
            />
          </div>

          <div className="glass-card rounded-xl p-1 overflow-hidden">
            <TradingViewWidget
              scriptUrl={`${scriptUrl}company-profile.js`}
              config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
              height={400} // Adjusted height
              className="w-full"
            />
          </div>

          <div className="glass-card rounded-xl p-1 overflow-hidden">
            <TradingViewWidget
              scriptUrl={`${scriptUrl}financials.js`}
              config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
              height={500}
              className="w-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
}