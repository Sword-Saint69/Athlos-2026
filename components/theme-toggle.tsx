"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 transition-all duration-300 hover:scale-110 hover:bg-accent"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="animate-in fade-in zoom-in-95 duration-200 max-h-[300px] overflow-y-auto"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="transition-colors duration-200 hover:bg-accent"
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="transition-colors duration-200 hover:bg-accent"
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("moss")}
          className="transition-colors duration-200 hover:bg-accent"
        >
          Moss
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("strawberry")}
          className="transition-colors duration-200 hover:bg-accent"
        >
          Strawberry
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("ocean")}
          className="transition-colors duration-200 hover:bg-accent"
        >
          Ocean
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("lavender")}
          className="transition-colors duration-200 hover:bg-accent"
        >
          Lavender
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("midnight")}
          className="transition-colors duration-200 hover:bg-accent"
        >
          Midnight
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("sunset")}
          className="transition-colors duration-200 hover:bg-accent"
        >
          Sunset
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("forest")}
          className="transition-colors duration-200 hover:bg-accent"
        >
          Forest
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("rose")}
          className="transition-colors duration-200 hover:bg-accent"
        >
          Rose
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("amber")}
          className="transition-colors duration-200 hover:bg-accent"
        >
          Amber
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("emerald")}
          className="transition-colors duration-200 hover:bg-accent"
        >
          Emerald
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("cobalt")}
          className="transition-colors duration-200 hover:bg-accent"
        >
          Cobalt
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("violet")}
          className="transition-colors duration-200 hover:bg-accent"
        >
          Violet
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="transition-colors duration-200 hover:bg-accent"
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}