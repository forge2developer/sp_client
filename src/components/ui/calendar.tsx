"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type DateRange = {
  from: Date | undefined
  to?: Date | undefined
}

interface CalendarProps {
  className?: string
  selected?: DateRange
  onSelect?: (range: DateRange | undefined) => void
}

export function Calendar({ className, selected, onSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 3, 1)) // Starting at April 2026 as per image
  
  const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)

  const renderMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const monthName = date.toLocaleString('default', { month: 'long' })
    
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    // Add empty slots for the first week
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />)
    }
    
    // Add day buttons
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d)
      const isToday = dayDate.toDateString() === new Date().toDateString()
      const isFuture = dayDate > new Date()
      
      const isSelected = selected?.from && dayDate.getTime() === selected.from.getTime()
      const isEnd = selected?.to && dayDate.getTime() === selected.to.getTime()
      const isInRange = selected?.from && selected?.to && 
                       dayDate.getTime() > selected.from.getTime() && 
                       dayDate.getTime() < selected.to.getTime()

      days.push(
        <button
          key={d}
          disabled={isFuture}
          onClick={() => {
            if (!selected?.from || (selected.from && selected.to)) {
              onSelect?.({ from: dayDate, to: undefined })
            } else {
              if (dayDate < selected.from) {
                onSelect?.({ from: dayDate, to: selected.from })
              } else {
                onSelect?.({ from: selected.from, to: dayDate })
              }
            }
          }}
          className={cn(
            "h-9 w-9 text-sm rounded-lg transition-all flex items-center justify-center relative",
            isSelected || isEnd ? "bg-red-600 text-white font-bold z-10 rounded-lg shadow-sm" : "hover:bg-muted",
            isInRange && "bg-muted/50 text-foreground rounded-none dark:bg-muted/30",
            isSelected && selected?.to && "rounded-r-none rounded-l-lg",
            isEnd && "rounded-l-none rounded-r-lg",
            isToday && !isSelected && !isEnd && "border border-red-500/20",
            isFuture && "opacity-20 cursor-not-allowed"
          )}
        >
          {d}
        </button>
      )
    }
    
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-7 gap-x-0 gap-y-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="h-9 w-9 flex items-center justify-center text-[10px] uppercase font-bold text-muted-foreground">
              {d}
            </div>
          ))}
          {days}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("p-4 bg-background border rounded-lg shadow-xl", className)}>
      <div className="flex items-center justify-between mb-6 px-2">
        <button 
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          className="p-2 hover:bg-muted rounded-full transition-colors flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm font-bold tracking-tight text-center min-w-[130px]">
              {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
          </span>
          <span className="text-sm font-bold tracking-tight text-center min-w-[130px] hidden md:block">
            {nextMonthDate.toLocaleString('default', { month: 'long' })} {nextMonthDate.getFullYear()}
          </span>
        </div>
        <button 
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          className="p-2 hover:bg-muted rounded-full transition-colors flex-shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-0 justify-center">
        {renderMonth(currentDate)}
        {renderMonth(nextMonthDate)}
      </div>
    </div>
  )
}
