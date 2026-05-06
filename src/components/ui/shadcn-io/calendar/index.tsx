'use client';

import { getDay, getDaysInMonth, isSameDay } from 'date-fns';
import { atom, useAtom } from 'jotai';

import {
  Check,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Info,
  CalendarClock,
  CalendarCheck,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  createContext,
  memo,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type CalendarState = {
  month: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  year: number;
};

const monthAtom = atom<CalendarState['month']>(
  new Date().getMonth() as CalendarState['month']
);
const yearAtom = atom<CalendarState['year']>(new Date().getFullYear());

export const useCalendarMonth = () => useAtom(monthAtom);
export const useCalendarYear = () => useAtom(yearAtom);

type CalendarContextProps = {
  locale: Intl.LocalesArgument;
  startDay: number;
};

const CalendarContext = createContext<CalendarContextProps>({
  locale: 'en-US',
  startDay: 0,
});

export type Status = {
  id: string;
  name: string;
  color: string;
};

export type Feature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: Status;
};

type ComboboxProps = {
  value: string;
  setValue: (value: string) => void;
  data: {
    value: string;
    label: string;
  }[];
  labels: {
    button: string;
    empty: string;
    search: string;
  };
  className?: string;
};

export const monthsForLocale = (
  localeName: Intl.LocalesArgument,
  monthFormat: Intl.DateTimeFormatOptions['month'] = 'long'
) => {
  const format = new Intl.DateTimeFormat(localeName, { month: monthFormat })
    .format;

  return [...new Array(12).keys()].map((m) =>
    format(new Date(Date.UTC(2021, m, 2)))
  );
};

export const daysForLocale = (
  locale: Intl.LocalesArgument,
  startDay: number
) => {
  const weekdays: string[] = [];
  const baseDate = new Date(2024, 0, startDay);

  for (let i = 0; i < 7; i++) {
    weekdays.push(
      new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(baseDate)
    );
    baseDate.setDate(baseDate.getDate() + 1);
  }

  return weekdays;
};

const Combobox = ({
  value,
  setValue,
  data,
  labels,
  className,
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className={cn('justify-between capitalize font-normal border-zinc-200 shadow-none hover:bg-accent hover:text-accent-foreground px-2 py-1.5 text-xs/relaxed bg-transparent', className)}
          variant="outline"
        >
          {value
            ? data.find((item) => item.value === value)?.label
            : labels.button}
          <ChevronDownIcon className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command
          className="w-full"
          filter={(value, search) => {
            const label = data.find((item) => item.value === value)?.label;

            return label?.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={labels.search} className="w-full" />
          <CommandList className="w-full max-h-72 overflow-y-auto custom-scrollbar">
            <CommandEmpty>{labels.empty}</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  className="capitalize"
                  key={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                  }}
                  value={item.value}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

type OutOfBoundsDayProps = {
  day: number;
};

const OutOfBoundsDay = ({ day }: OutOfBoundsDayProps) => (
  <div className="relative h-full w-full bg-neutral-100 p-1 text-neutral-500 text-xs dark:bg-neutral-800 dark:text-neutral-400">
    {day}
  </div>
);

export type CalendarBodyProps = {
  features: Feature[];
  children: (props: { feature: Feature }) => ReactNode;
};

export const CalendarBody = ({ features, children }: CalendarBodyProps) => {
  const [month] = useCalendarMonth();
  const [year] = useCalendarYear();
  const { startDay } = useContext(CalendarContext);

  // Memoize expensive date calculations
  const currentMonthDate = useMemo(
    () => new Date(year, month, 1),
    [year, month]
  );
  const daysInMonth = useMemo(
    () => getDaysInMonth(currentMonthDate),
    [currentMonthDate]
  );
  const firstDay = useMemo(
    () => (getDay(currentMonthDate) - startDay + 7) % 7,
    [currentMonthDate, startDay]
  );

  // Memoize previous month calculations
  const prevMonthData = useMemo(() => {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthDays = getDaysInMonth(new Date(prevMonthYear, prevMonth, 1));
    const prevMonthDaysArray = Array.from(
      { length: prevMonthDays },
      (_, i) => i + 1
    );
    return { prevMonthDays, prevMonthDaysArray };
  }, [month, year]);

  // Memoize next month calculations
  const nextMonthData = useMemo(() => {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonthDays = getDaysInMonth(new Date(nextMonthYear, nextMonth, 1));
    const nextMonthDaysArray = Array.from(
      { length: nextMonthDays },
      (_, i) => i + 1
    );
    return { nextMonthDaysArray };
  }, [month, year]);

  // Memoize features filtering by day to avoid recalculating on every render
  const featuresByDay = useMemo(() => {
    const result: { [day: number]: Feature[] } = {};
    for (let day = 1; day <= daysInMonth; day++) {
      result[day] = features.filter((feature) => {
        return isSameDay(new Date(feature.endAt), new Date(year, month, day));
      });
    }
    return result;
  }, [features, daysInMonth, year, month]);

  const days: ReactNode[] = [];

  for (let i = 0; i < firstDay; i++) {
    const day =
      prevMonthData.prevMonthDaysArray[
      prevMonthData.prevMonthDays - firstDay + i
      ];

    if (day) {
      days.push(<OutOfBoundsDay day={day} key={`prev-${i}`} />);
    }
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const featuresForDay = featuresByDay[day] || [];

    days.push(
      <div
        className="relative flex w-full flex-col gap-1 p-1 text-red-600 text-xs  font-extrabold"
        key={day}
      >
        {day}
        <div className="flex flex-col gap-0.5">
          {featuresForDay.slice(0, 3).map((feature) => children({ feature }))}
        </div>
        {featuresForDay.length > 3 && (
          <span className="block text-neutral-500 text-[10px] dark:text-neutral-400">
            +{featuresForDay.length - 3} more
          </span>
        )}
      </div>
    );
  }

  const remainingDays = 7 - ((firstDay + daysInMonth) % 7);
  if (remainingDays < 7) {
    for (let i = 0; i < remainingDays; i++) {
      const day = nextMonthData.nextMonthDaysArray[i];

      if (day) {
        days.push(<OutOfBoundsDay day={day} key={`next-${i}`} />);
      }
    }
  }

  return (
    <div className="grid flex-grow grid-cols-7 border border-t-0 rounded-b-lg overflow-hidden">
      {days.map((day, index) => (
        <div
          className={cn(
            'relative h-[15vh] overflow-hidden border-t border-r',
            index % 7 === 6 && 'border-r-0'
          )}
          key={index}
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export type CalendarDatePickerProps = {
  className?: string;
  children: ReactNode;
};

export const CalendarDatePicker = ({
  className,
  children,
}: CalendarDatePickerProps) => (
  <div className={cn('flex items-center gap-1', className)}>{children}</div>
);

export type CalendarMonthPickerProps = {
  className?: string;
};

export const CalendarMonthPicker = ({
  className,
}: CalendarMonthPickerProps) => {
  const [month, setMonth] = useCalendarMonth();
  const { locale } = useContext(CalendarContext);

  // Memoize month data to avoid recalculating date formatting
  const monthData = useMemo(() => {
    return monthsForLocale(locale).map((month, index) => ({
      value: index.toString(),
      label: month,
    }));
  }, [locale]);

  return (
    <Combobox
      className={className}
      data={monthData}
      labels={{
        button: 'Select month',
        empty: 'No month found',
        search: 'Search month',
      }}
      setValue={(value) =>
        setMonth(Number.parseInt(value) as CalendarState['month'])
      }
      value={month.toString()}
    />
  );
};

export type CalendarYearPickerProps = {
  className?: string;
  start: number;
  end: number;
};

export const CalendarYearPicker = ({
  className,
  start,
  end,
}: CalendarYearPickerProps) => {
  const [year, setYear] = useCalendarYear();

  return (
    <Combobox
      className={className}
      data={Array.from({ length: end - start + 1 }, (_, i) => ({
        value: (start + i).toString(),
        label: (start + i).toString(),
      }))}
      labels={{
        button: 'Select year',
        empty: 'No year found',
        search: 'Search year',
      }}
      setValue={(value) => setYear(Number.parseInt(value))}
      value={year.toString()}
    />
  );
};

export type CalendarDatePaginationProps = {
  className?: string;
  stats?: {
    totalScheduled: number;
    totalDone: number;
    totalBooked: number;
  };
};

export const CalendarDatePagination = ({
  className,
  stats,
}: CalendarDatePaginationProps) => {
  const [month, setMonth] = useCalendarMonth();
  const [year, setYear] = useCalendarYear();

  const handlePreviousMonth = useCallback(() => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth((month - 1) as CalendarState['month']);
    }
  }, [month, year, setMonth, setYear]);

  const handleNextMonth = useCallback(() => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth((month + 1) as CalendarState['month']);
    }
  }, [month, year, setMonth, setYear]);

  return (
    <div className={cn('flex items-center gap-2 mr-2', className)}>
      <Button onClick={handlePreviousMonth} size="icon" variant="outline" className="h-8 w-8">
        <ChevronLeftIcon size={15} />
      </Button>
      <Button onClick={handleNextMonth} size="icon" variant="outline" className="h-8 w-8">
        <ChevronRightIcon size={15} />
      </Button>

      {stats && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <Info size={15} />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              className="p-0 border-none shadow-none bg-transparent"
              arrowClassName="bg-white fill-white"
              sideOffset={10}
              align="end"
            >
              <div className="flex flex-col gap-0 w-44 bg-white dark:bg-zinc-900 p-1 rounded-xl border shadow-xl">
                <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 p-1">
                            <CalendarClock className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground">Scheduled</p>
                    </div>
                    <p className="text-xs font-bold">{stats.totalScheduled}</p>
                </div>
                <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border-t dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 p-1">
                            <CalendarCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground">Done</p>
                    </div>
                    <p className="text-xs font-bold">{stats.totalDone}</p>
                </div>
                <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border-t dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full bg-amber-100 dark:bg-amber-900/40 p-1">
                            <Check className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground">Booked</p>
                    </div>
                    <p className="text-xs font-bold">{stats.totalBooked}</p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export type CalendarDateProps = {
  children: ReactNode;
};

export const CalendarDate = ({ children }: CalendarDateProps) => (
  <div className="flex items-center justify-between p-1">{children}</div>
);

export type CalendarHeaderProps = {
  className?: string;
};

export const CalendarHeader = ({ className }: CalendarHeaderProps) => {
  const { locale, startDay } = useContext(CalendarContext);

  // Memoize days data to avoid recalculating date formatting
  const daysData = useMemo(() => {
    return daysForLocale(locale, startDay);
  }, [locale, startDay]);

  return (
    <div className={cn('grid flex-grow grid-cols-7 border rounded-none', className)}>
      {daysData.map((day) => (
        <div 
          className={cn(
            "p-3 text-center text-xs font-medium text-red-600"
          )} 
          key={day}
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export type CalendarItemProps = {
  feature: Feature;
  className?: string;
};

export const CalendarItem = memo(
  ({ feature, className }: CalendarItemProps) => (
    <div className={cn('flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors', className)}>
      <div
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{
          backgroundColor: feature.status.color,
        }}
      />
      <span className="truncate text-[10px] leading-tight font-medium">{feature.name}</span>
    </div>
  )
);

CalendarItem.displayName = 'CalendarItem';

export type CalendarProviderProps = {
  locale?: Intl.LocalesArgument;
  startDay?: number;
  children: ReactNode;
  className?: string;
};

export const CalendarProvider = ({
  locale = 'en-US',
  startDay = 0,
  children,
  className,
}: CalendarProviderProps) => (
  <CalendarContext.Provider value={{ locale, startDay }}>
    <div className={cn('relative flex flex-col ', className)}>{children}</div>
  </CalendarContext.Provider>
);
