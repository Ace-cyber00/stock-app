import { Button } from "@/components/ui/button"
import TradingViewWidget from "@/components/TradingViewWidget"
import { HEATMAP_WIDGET_CONFIG, MARKET_DATA_WIDGET_CONFIG, MARKET_OVERVIEW_WIDGET_CONFIG, TOP_STORIES_WIDGET_CONFIG } from "@/lib/constants"
import { auth } from "@/lib/betterAuth/auth"
import { headers } from "next/headers"

const Home = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userName = session?.user?.name || "Investor";
  const scriptUrl = "https://s3.tradingview.com/external-embedding/embed-widget-"

  return (
    <div className="flex flex-col min-h-screen home-wrapper w-full gap-8">

      {/* Welcome Header */}
      <div className="w-full mb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Good Morning, <span className="text-yellow-500">{userName}</span>
        </h1>
        <p className="text-gray-400">Here's what's happening in the markets today.</p>
      </div>

      <section className="grid w-full gap-8 md:gap-10 home-section">
        <div className="md:col-span-1 xl:col-span-1 h-full">
          <div className="glass-card rounded-xl p-1 h-[600px] overflow-hidden">
            <TradingViewWidget
              title="Market Overview"
              scriptUrl={`${scriptUrl}market-overview.js`}
              config={MARKET_OVERVIEW_WIDGET_CONFIG}
              className="custom-chart h-full w-full"
              height={600}
            />
          </div>
        </div>
        <div className="md-col span-2 xl:col-span-2 h-full">
          <div className="glass-card rounded-xl p-1 h-[600px] overflow-hidden">
            <TradingViewWidget
              title="Stock Heatmap"
              scriptUrl={`${scriptUrl}stock-heatmap.js`}
              config={HEATMAP_WIDGET_CONFIG}
              height={600}
            />
          </div>
        </div>
      </section>

      <section className="grid w-full gap-8 md:gap-10 home-section">
        <div className="h-full md:col-span-1 xl:col-span-1">
          <div className="glass-card rounded-xl p-4 h-[600px] overflow-hidden">
            <h3 className="text-xl font-semibold mb-4 text-gray-200">Top Stories</h3>
            <TradingViewWidget
              title=''
              scriptUrl={`${scriptUrl}timeline.js`}
              config={TOP_STORIES_WIDGET_CONFIG}
              className="custom-chart"
              height={540}
            />
          </div>
        </div>
        <div className="md-col span-2 xl:col-span-2">
          <div className="glass-card rounded-xl p-1 h-[600px] overflow-hidden">
            <TradingViewWidget
              title=''
              scriptUrl={`${scriptUrl}market-quotes.js`}
              config={MARKET_DATA_WIDGET_CONFIG}
              height={600}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home


