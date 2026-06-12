'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useTemplate } from '@/hooks/useTemplate';
import { SearchBar } from './SearchBar';
import { FilterTabs, FilterCategory } from './FilterTabs';
import { TemplateGrid } from './TemplateGrid';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { TemplateSetData } from './TemplateCard';

export const TEMPLATE_SETS: TemplateSetData[] = [
    {
        id: "set1",
        title: "Set 1 - Standard Analytics",
        category: "Analytics",
        description: "Standard agile dashboard containing Line, Vertical Bar, Donut, Area, and Scatter charts, along with a Velocity Trend indicator. Perfect for general metrics tracking.",
        charts: ["Line Chart", "Vertical Bar Chart", "Donut Chart", "Area Chart", "Scatter Plot", "Velocity Trend"]
    },
    {
        id: "set2",
        title: "Set 2 - Executive Overview",
        category: "Analytics",
        description: "High-level summary dashboards featuring Horizontal Bars, Stacked Bars, Pies, Line with Targets, and Area Range charts for comparison and objective tracking.",
        charts: ["Horizontal Bar Chart", "Stacked Bar Chart", "Pie Chart", "Line Chart with Target", "Area Range Chart"]
    },
    {
        id: "set3",
        title: "Set 3 - Business Flow",
        category: "Business",
        description: "Business and flow-focused template containing Stacked Area, Gauge, Bubble, Treemap, and Waterfall charts to monitor value streams and business impact.",
        charts: ["Stacked Area", "Gauge", "Bubble", "Treemap", "Waterfall"]
    },
    {
        id: "set4",
        title: "Set 4 - Advanced Diagnostics",
        category: "Monitoring",
        description: "Deep statistical diagnostic charts like Radar, Box Plot, Violin Plot, Candlestick, and Funnel. Designed for quality analysis and throughput bottleneck detection.",
        charts: ["Radar", "Box Plot", "Violin Plot", "Candlestick", "Funnel"]
    },
    {
        id: "set5",
        title: "Set 5 - Hierarchical Flow",
        category: "Business",
        description: "Visualizes structural and process flows using Pyramid, Sankey, Circular Progress, Semi Donut, and Step Line charts to understand hierarchical distribution.",
        charts: ["Pyramid", "Sankey", "Circular Progress", "Semi Donut", "Step Line"]
    },
    {
        id: "set6",
        title: "Set 6 - Performance Monitor",
        category: "Monitoring",
        description: "Operations and performance tracking using Bullet, Range Bar, Multi Line, Donut, and Scatter charts. Perfect for continuous SLA and KPI tracking.",
        charts: ["Bullet", "Range Bar", "Multi Line", "Donut", "Scatter"]
    },
    {
        id: "set7",
        title: "Set 7 - Relay Operations",
        category: "Relay",
        description: "The official Relay process control charts, including Velocity Trends, Sprint Metrics, Control Limits (I-MR), Frequency Distribution, and Team Contributions.",
        charts: ["Relay Velocity Trend", "Relay Velocity by Sprint", "Relay Control Chart", "Relay Velocity Distribution", "Relay Team Contribution"]
    }
];

export function TemplateGallery() {
    const router = useRouter();
    const {
        selectedTemplate,
        favoriteTemplates,
        selectTemplate,
        toggleFavoriteTemplate,
    } = useTemplate();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('All');
    const [previewSet, setPreviewSet] = useState<TemplateSetData | null>(null);

    // Apply template set selection
    const handleSelectTemplate = (id: string) => {
        selectTemplate(id);
        const name = TEMPLATE_SETS.find(s => s.id === id)?.title || id;
        toast.success("Template Applied Successfully", {
            description: `Dashboard charts updated to ${name}.`,
            action: {
                label: "Go to Dashboard",
                onClick: () => router.push('/metrics-dashboard')
            }
        });
    };

    // Toggle Favorite
    const handleToggleFavorite = (id: string) => {
        const isFavorite = favoriteTemplates.includes(id);
        toggleFavoriteTemplate(id);
        if (isFavorite) {
            toast.info("Removed from Favorites");
        } else {
            toast.success("Added to Favorites");
        }
    };

    // Filter sets based on search and category
    const filteredSets = TEMPLATE_SETS.filter((set) => {
        // Search query filter (matches set name or any chart in the set)
        const matchesSearch = 
            set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            set.charts.some(chart => chart.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        // Category tab filter
        if (selectedCategory === 'All') return true;
        if (selectedCategory === 'Favorites') return favoriteTemplates.includes(set.id);
        return set.category === selectedCategory;
    });

    return (
        <div className="space-y-8 max-w-6xl mx-auto px-4 md:px-6">
            {/* Navigation Header */}
            <div className="flex flex-col gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push('/metrics-dashboard')}
                        className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </button>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shadow-sm shadow-violet-500/10">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                                Template Gallery
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                Choose a professional chart dashboard preset to update your workspace
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters Section */}
            <div className="space-y-4">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
                <FilterTabs 
                    selected={selectedCategory} 
                    onSelect={setSelectedCategory} 
                    favoritesCount={favoriteTemplates.length} 
                />
            </div>

            {/* Gallery Grid */}
            <TemplateGrid
                sets={filteredSets}
                selectedTemplate={selectedTemplate}
                favoriteTemplates={favoriteTemplates}
                onSelect={handleSelectTemplate}
                onPreview={(set) => setPreviewSet(set)}
                onToggleFavorite={handleToggleFavorite}
                currentFilter={selectedCategory}
            />

            {/* Preview Modal */}
            <TemplatePreviewModal
                set={previewSet}
                isOpen={!!previewSet}
                onClose={() => setPreviewSet(null)}
                onSelect={() => previewSet && handleSelectTemplate(previewSet.id)}
                isSelected={previewSet ? selectedTemplate === previewSet.id : false}
            />
        </div>
    );
}
