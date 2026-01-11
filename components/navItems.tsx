"use client";

import { NAV_ITEMS } from "@/lib/constants";
import Link from "next/link"
import { usePathname } from "next/navigation";
import { useState } from "react";
import SearchCommand from "./SearchCommand";

const NavItems = ({initialStocks = []}: {initialStocks?: StockWithWatchlistStatus[]}) => {
   
    const pathname = usePathname()  
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    const isActive = (path: string)=>{
        if(path === '/' ) return pathname ==='/';

        return pathname.startsWith(path)
    }
    
    const handleNavClick = (e: React.MouseEvent, href: string) => {
        if (href === '/search') {
            e.preventDefault()
            setIsSearchOpen(true)
        }
    }
    
  return (
    <>
    <ul className="flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium">
        {NAV_ITEMS.map(({href , label}) => (
            <li key = {href}>
                <Link 
                    href = {href} 
                    onClick={(e) => handleNavClick(e, href)}
                    className={`hover:text-yellow-500 transtion-colors ${
                        isActive(href)? 'text-gray-100' : ''
                    }`}
                >
                    {label}
                
                </Link>
            </li>
        ))}
      
    </ul>
    <SearchCommand 
        renderAs="text" 
        label="" 
        initialStocks={initialStocks}
        externalOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
    />
    </>
  )
}

export default NavItems
