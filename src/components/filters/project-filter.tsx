'use client';

import { useAppDispatch, useAppSelector } from '@/redux/store';
import { setSelectedProject, setIsFiltering } from '@/redux/slices/dashboardSlice';
import { PROJECTS } from '@/lib/mock-data/dashboard-filtered';
import { ChevronDown, FolderKanban, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function ProjectFilter() {
    const dispatch = useAppDispatch();
    const { selectedProject } = useAppSelector((s) => s.dashboard);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const allOptions = [{ id: 'all', name: 'All Projects' }, ...PROJECTS.map(p => ({ id: p.id, name: p.name }))];
    const current = allOptions.find((o) => o.id === selectedProject) || allOptions[0];

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (id: string) => {
        dispatch(setSelectedProject(id));
        setOpen(false);
        // Simulate filtering delay
        setTimeout(() => dispatch(setIsFiltering(false)), 400);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-border/50 bg-card/90 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 min-w-[160px]"
            >
                <FolderKanban className="h-4 w-4 text-primary" />
                <span className="flex-1 text-left truncate">{current.name}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-border/50 bg-card shadow-2xl shadow-black/30 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-border/30">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Select Project</p>
                    </div>
                    <div className="py-1 max-h-64 overflow-y-auto">
                        {allOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(option.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-all duration-150 hover:bg-primary/10 ${selectedProject === option.id
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-foreground'
                                    }`}
                            >
                                <span className="flex-1 text-left">{option.name}</span>
                                {selectedProject === option.id && (
                                    <Check className="h-4 w-4 text-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
