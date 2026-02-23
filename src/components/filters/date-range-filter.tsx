'use client';

import { useAppDispatch, useAppSelector } from '@/redux/store';
import { setDateRange, setIsFiltering } from '@/redux/slices/dashboardSlice';
import { DateRangePicker } from '@/components/shared/date-range-picker';
import { Calendar as CalendarIcon } from 'lucide-react';

export function DateRangeFilter() {
    const dispatch = useAppDispatch();
    const { dateRange } = useAppSelector((s) => s.dashboard);

    const value = dateRange ? {
        from: new Date(dateRange.from),
        to: new Date(dateRange.to)
    } : undefined;

    const handleRangeChange = (range: { from: Date; to: Date }) => {
        dispatch(setDateRange({
            from: range.from.toISOString(),
            to: range.to.toISOString()
        }));

        // Simulate filtering delay
        setTimeout(() => dispatch(setIsFiltering(false)), 400);
    };

    return (
        <div className="flex items-center gap-2">
            <DateRangePicker
                value={value}
                onChange={handleRangeChange}
            />
        </div>
    );
}
