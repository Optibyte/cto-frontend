import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardFilterState {
    selectedMarket: string;
    selectedAccount: string;
    selectedProject: string;
    selectedTeam: string;
    selectedMember: string;
    isFiltering: boolean;
    dateRange: {
        from: string;
        to: string;
    } | null;
}

const initialState: DashboardFilterState = {
    selectedMarket: 'all',
    selectedAccount: 'all',
    selectedProject: 'all',
    selectedTeam: 'all',
    selectedMember: 'all',
    isFiltering: false,
    dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
    },
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setSelectedMarket(state, action: PayloadAction<string>) {
            state.selectedMarket = action.payload;
            state.selectedAccount = 'all';
            state.selectedProject = 'all';
            state.selectedTeam = 'all';
            state.selectedMember = 'all';
            state.isFiltering = true;
        },
        setSelectedAccount(state, action: PayloadAction<string>) {
            state.selectedAccount = action.payload;
            state.selectedProject = 'all';
            state.selectedTeam = 'all';
            state.selectedMember = 'all';
            state.isFiltering = true;
        },
        setSelectedProject(state, action: PayloadAction<string>) {
            state.selectedProject = action.payload;
            state.selectedTeam = 'all';
            state.selectedMember = 'all';
            state.isFiltering = true;
        },
        setSelectedTeam(state, action: PayloadAction<string>) {
            state.selectedTeam = action.payload;
            state.selectedMember = 'all';
            state.isFiltering = true;
        },
        setSelectedMember(state, action: PayloadAction<string>) {
            state.selectedMember = action.payload;
            state.isFiltering = true;
        },
        setDateRange(state, action: PayloadAction<{ from: string; to: string }>) {
            state.dateRange = action.payload;
            state.isFiltering = true;
        },
        setIsFiltering(state, action: PayloadAction<boolean>) {
            state.isFiltering = action.payload;
        },
        resetFilters() {
            return { ...initialState };
        },
    },
});

export const {
    setSelectedMarket,
    setSelectedAccount,
    setSelectedProject,
    setSelectedTeam,
    setSelectedMember,
    setDateRange,
    setIsFiltering,
    resetFilters,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
