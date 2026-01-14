"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      formatters={{
        formatWeekdayName: (date) => {
          const days = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du']
          return days[date.getDay() === 0 ? 6 : date.getDay() - 1]
        }
      }}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-white/30 hover:bg-white/20"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 gap-0 mb-2",
        head_cell: "text-white/70 w-full h-9 font-normal text-[0.65rem] uppercase flex items-center justify-center",
        weekdays: "grid grid-cols-7 gap-0 mb-2",
        weekday: "text-white/70 w-full h-9 font-normal text-[0.65rem] uppercase flex items-center justify-center",
        row: "grid grid-cols-7 gap-0 mt-0",
        cell: "h-9 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-white/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 hover:text-white"
        ),
        day_button: "h-9 w-9 p-0 font-normal hover:bg-white/10 hover:text-white",
        selected: "bg-white text-black hover:bg-white hover:text-black focus:bg-white focus:text-black",
        day_selected: "bg-white text-black hover:bg-white hover:text-black focus:bg-white focus:text-black",
        day_today: "bg-white/20 text-white font-semibold",
        today: "bg-white/20 text-white font-semibold",
        day_outside: "text-white/40 opacity-50",
        outside: "text-white/40 opacity-50",
        day_disabled: "text-white/30 opacity-50 line-through",
        disabled: "text-white/30 opacity-50 line-through",
        day_range_middle: "aria-selected:bg-white/20 aria-selected:text-white",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }