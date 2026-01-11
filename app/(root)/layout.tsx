import Header from "@/components/header"
import { auth } from "@/lib/betterAuth/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { searchStocks } from "@/lib/actions/finnhub.actions"
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions"


const Layout  = async({children} : {children : React.ReactNode}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if(!session?.user) redirect('/sign-in')

    const user ={
      id: session.user.id,
      name:session.user.name,
      email:session.user.email,
    }
  
  // Fetch stocks with watchlist status for search
  const userEmail = session.user.email
  let initialStocks: StockWithWatchlistStatus[] = []
  if (userEmail) {
    const watchlistSymbols = await getWatchlistSymbolsByEmail(userEmail)
    const stocks = await searchStocks()
    initialStocks = stocks.map(stock => ({
      ...stock,
      isInWatchlist: watchlistSymbols.includes(stock.symbol)
    }))
  } else {
    initialStocks = await searchStocks()
  }
  
  return (
    <main className="min-h-screen text-gray-400">
      {/* Headers */}
      <Header user = {user} initialStocks={initialStocks} />
      <div className="container py-10">
        {children}
      </div>

    </main>
  )
}

export default Layout
