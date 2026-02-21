import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardFilterState {
    selectedProject: string;
    selectedTeam: string;
    isFiltering: boolean;
}

const initialState: DashboardFilterState = {
    selectedProject: 'all',
    selectedTeam: 'all',
    isFiltering: false,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setSelectedProject(state, action: PayloadAction<string>) {
            state.selectedProject = action.payload;
            state.selectedTeam = 'all'; // Reset team when project changes
            state.isFiltering = true;
        },
        setSelectedTeam(state, action: PayloadAction<string>) {
            state.selectedTeam = action.payload;
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
    setSelectedProject,
    setSelectedTeam,
    setIsFiltering,
    resetFilters,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
