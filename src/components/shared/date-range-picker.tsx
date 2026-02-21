'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface DateRange {
    from: Date;
    to: Date;
}

interface DateRangePickerProps {
    value?: DateRange;
    onChange?: (range: DateRange) => void;
}

type PresetKey = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<PresetKey>('today');
    const [customRange, setCustomRange] = useState<{ from: Date | null; to: Date | null }>({
        from: null,
        to: null,
    });
    const [currentMonth1, setCurrentMonth1] = useState(new Date());
    const [currentMonth2, setCurrentMonth2] = useState(() => {
        const next = new Date();
        next.setMonth(next.getMonth() + 1);
        return next;
    });

    const presets: Record<PresetKey, { label: string; getRange: () => DateRange }> = {
        today: {
            label: 'Today',
            getRange: () => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const end = new Date(today);
                end.setHours(23, 59, 59, 999);
                return { from: today, to: end };
            },
        },
        yesterday: {
            label: 'Yesterday',
            getRange: () => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);
                const end = new Date(yesterday);
                end.setHours(23, 59, 59, 999);
                return { from: yesterday, to: end };
            },
        },
        last7days: {
            label: 'Last 7 Days',
            getRange: () => {
                const end = new Date();
                end.setHours(23, 59, 59, 999);
                const start = new Date();
                start.setDate(start.getDate() - 6);
                start.setHours(0, 0, 0, 0);
                return { from: start, to: end };
            },
        },
        last30days: {
            label: 'Last 30 Days',
            getRange: () => {
                const end = new Date();
                end.setHours(23, 59, 59, 999);
                const start = new Date();
                start.setDate(start.getDate() - 29);
                start.setHours(0, 0, 0, 0);
                return { from: start, to: end };
            },
        },
        thisMonth: {
            label: 'This Month',
            getRange: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                return { from: start, to: end };
            },
        },
        lastMonth: {
            label: 'Last Month',
            getRange: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                return { from: start, to: end };
            },
        },
        custom: {
            label: 'Custom Range',
            getRange: () => {
                return {
                    from: customRange.from || new Date(),
                    to: customRange.to || new Date(),
                };
            },
        },
    };

    const displayText = useMemo(() => {
        if (value) {
            const formatDate = (date: Date) => {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            };
            return `${formatDate(value.from)} - ${formatDate(value.to)}`;
        }
        const range = presets[selectedPreset].getRange();
        const formatDate = (date: Date) => {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        };
        if (selectedPreset === 'today') {
            return formatDate(range.from);
        }
        return `${formatDate(range.from)} - ${formatDate(range.to)}`;
    }, [value, selectedPreset, customRange]);

    const handlePresetClick = (preset: PresetKey) => {
        setSelectedPreset(preset);
        if (preset !== 'custom') {
            setCustomRange({ from: null, to: null });
        }
    };

    const handleApply = () => {
        const range = selectedPreset === 'custom' && customRange.from && customRange.to
            ? { from: customRange.from, to: customRange.to }
            : presets[selectedPreset].getRange();

        onChange?.(range);
        setIsOpen(false);
    };

    const handleDateClick = (date: Date) => {
        if (selectedPreset !== 'custom') {
            setSelectedPreset('custom');
        }

        if (!customRange.from || (customRange.from && customRange.to)) {
            setCustomRange({ from: date, to: null });
        } else if (customRange.from && !customRange.to) {
            if (date < customRange.from) {
                setCustomRange({ from: date, to: customRange.from });
            } else {
                setCustomRange({ from: customRange.from, to: date });
            }
        }
    };

    const isDateInRange = (date: Date) => {
        if (selectedPreset === 'custom') {
            if (!customRange.from) return false;
            if (!customRange.to) return date.toDateString() === customRange.from.toDateString();
            return date >= customRange.from && date <= customRange.to;
        }
        const range = presets[selectedPreset].getRange();
        return date >= range.from && date <= range.to;
    };

    const isDateSelected = (date: Date): boolean => {
        if (selectedPreset === 'custom') {
            return !!(
                (customRange.from && date.toDateString() === customRange.from.toDateString()) ||
                (customRange.to && date.toDateString() === customRange.to.toDateString())
            );
        }
        return false;
    };

    return (
        <>
            <Button variant="outline" className="gap-2" onClick={() => setIsOpen(true)}>
                <CalendarIcon className="h-4 w-4" />
                <span>{displayText}</span>
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-6xl sm:max-w-6xl w-full bg-[#0F172A] border-gray-700" showCloseButton={false}>
                    <DialogHeader className="relative">
                        <DialogTitle className="text-white text-lg">Select Date Range</DialogTitle>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute right-0 top-0 p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </DialogHeader>

                    <div className="flex gap-6 py-4">
                        {/* Preset Options */}
                        <div className="w-52 space-y-1">
                            {(Object.keys(presets) as PresetKey[]).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => handlePresetClick(key)}
                                    className={cn(
                                        'w-full text-left px-4 py-3 rounded-md text-sm transition-colors font-medium',
                                        selectedPreset === key
                                            ? 'bg-[#8B5CF6] text-white'
                                            : 'text-gray-300 hover:bg-gray-700'
                                    )}
                                >
                                    {presets[key].label}
                                </button>
                            ))}
                        </div>

                        {/* Calendar Views */}
                        <div className="flex-1 flex gap-6">
                            <CalendarView
                                currentMonth={currentMonth1}
                                onMonthChange={setCurrentMonth1}
                                onDateClick={handleDateClick}
                                isDateInRange={isDateInRange}
                                isDateSelected={isDateSelected}
                            />
                            <CalendarView
                                currentMonth={currentMonth2}
                                onMonthChange={setCurrentMonth2}
                                onDateClick={handleDateClick}
                                isDateInRange={isDateInRange}
                                isDateSelected={isDateSelected}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApply}
                            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
                            disabled={selectedPreset === 'custom' && (!customRange.from || !customRange.to)}
                        >
                            Apply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

interface CalendarViewProps {
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    onDateClick: (date: Date) => void;
    isDateInRange: (date: Date) => boolean;
    isDateSelected: (date: Date) => boolean;
}

function CalendarView({
    currentMonth,
    onMonthChange,
    onDateClick,
    isDateInRange,
    isDateSelected,
}: CalendarViewProps) {
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay();

    const prevMonth = () => {
        const prev = new Date(currentMonth);
        prev.setMonth(prev.getMonth() - 1);
        onMonthChange(prev);
    };

    const nextMonth = () => {
        const next = new Date(currentMonth);
        next.setMonth(next.getMonth() + 1);
        onMonthChange(next);
    };

    const days = [];
    const prevMonthDays = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        0
    ).getDate();

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const date = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() - 1,
            prevMonthDays - i
        );
        days.push({ date, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        days.push({ date, isCurrentMonth: true });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            i
        );
        days.push({ date, isCurrentMonth: false });
    }

    return (
        <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    className="p-1.5 hover:bg-gray-700 rounded-md text-gray-300 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-base font-semibold text-white">{monthName}</h3>
                <button
                    onClick={nextMonth}
                    className="p-1.5 hover:bg-gray-700 rounded-md text-gray-300 transition-colors"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-semibold text-gray-400 py-2"
                    >
                        {day}
                    </div>
                ))}
                {days.map(({ date, isCurrentMonth }, index) => {
                    const inRange = isDateInRange(date);
                    const selected = isDateSelected(date);
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                        <button
                            key={index}
                            onClick={() => isCurrentMonth && onDateClick(date)}
                            disabled={!isCurrentMonth}
                            className={cn(
                                'aspect-square text-sm rounded-md transition-colors',
                                !isCurrentMonth && 'text-gray-600 cursor-not-allowed',
                                isCurrentMonth && 'text-gray-300 hover:bg-gray-700',
                                inRange && 'bg-[#8B5CF6]/20',
                                selected && 'bg-[#8B5CF6] text-white font-semibold',
                                isToday && !selected && 'border-2 border-[#8B5CF6]'
                            )}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
