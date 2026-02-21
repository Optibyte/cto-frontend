import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DrilldownLevel } from '@/lib/mock-data/drilldown';

interface DrilldownState {
    level: DrilldownLevel;
    selectedTeam: string | null;
    selectedTeamName: string | null;
    selectedManager: string | null;
    selectedManagerName: string | null;
    selectedTL: string | null;
    selectedTLName: string | null;
    selectedEmployee: string | null;
    selectedEmployeeName: string | null;
    loading: boolean;
}

const initialState: DrilldownState = {
    level: 'team',
    selectedTeam: null,
    selectedTeamName: null,
    selectedManager: null,
    selectedManagerName: null,
    selectedTL: null,
    selectedTLName: null,
    selectedEmployee: null,
    selectedEmployeeName: null,
    loading: false,
};

const drilldownSlice = createSlice({
    name: 'drilldown',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        drillToManager(state, action: PayloadAction<{ teamId: string; teamName: string }>) {
            state.level = 'manager';
            state.selectedTeam = action.payload.teamId;
            state.selectedTeamName = action.payload.teamName;
        },
        drillToTL(state, action: PayloadAction<{ managerId: string; managerName: string }>) {
            state.level = 'tl';
            state.selectedManager = action.payload.managerId;
            state.selectedManagerName = action.payload.managerName;
        },
        drillToEmployee(state, action: PayloadAction<{ tlId: string; tlName: string }>) {
            state.level = 'employee';
            state.selectedTL = action.payload.tlId;
            state.selectedTLName = action.payload.tlName;
        },
        drillToProjectDetail(state, action: PayloadAction<{ employeeId: string; employeeName: string }>) {
            state.level = 'project';
            state.selectedEmployee = action.payload.employeeId;
            state.selectedEmployeeName = action.payload.employeeName;
        },
        goBack(state) {
            switch (state.level) {
                case 'project':
                    state.level = 'employee';
                    state.selectedEmployee = null;
                    state.selectedEmployeeName = null;
                    break;
                case 'employee':
                    state.level = 'tl';
                    state.selectedTL = null;
                    state.selectedTLName = null;
                    break;
                case 'tl':
                    state.level = 'manager';
                    state.selectedManager = null;
                    state.selectedManagerName = null;
                    break;
                case 'manager':
                    state.level = 'team';
                    state.selectedTeam = null;
                    state.selectedTeamName = null;
                    break;
            }
        },
        goToLevel(state, action: PayloadAction<DrilldownLevel>) {
            const target = action.payload;
            if (target === 'team') {
                return { ...initialState };
            }
            if (target === 'manager') {
                state.level = 'manager';
                state.selectedManager = null;
                state.selectedManagerName = null;
                state.selectedTL = null;
                state.selectedTLName = null;
                state.selectedEmployee = null;
                state.selectedEmployeeName = null;
            }
            if (target === 'tl') {
                state.level = 'tl';
                state.selectedTL = null;
                state.selectedTLName = null;
                state.selectedEmployee = null;
                state.selectedEmployeeName = null;
            }
            if (target === 'employee') {
                state.level = 'employee';
                state.selectedEmployee = null;
                state.selectedEmployeeName = null;
            }
        },
        resetDrilldown() {
            return { ...initialState };
        },
    },
});

export const {
    setLoading,
    drillToManager,
    drillToTL,
    drillToEmployee,
    drillToProjectDetail,
    goBack,
    goToLevel,
    resetDrilldown,
} = drilldownSlice.actions;

export default drilldownSlice.reducer;
