import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DrilldownLevel = 'project' | 'cto' | 'pm' | 'tl' | 'employee' | 'employeeProjects' | 'team' | 'member';

interface DrilldownState {
    level: DrilldownLevel;
    selectedProject: string | null;
    selectedProjectName: string | null;
    selectedCTO: string | null;
    selectedCTOName: string | null;
    selectedPM: string | null;
    selectedPMName: string | null;
    selectedTL: string | null;
    selectedTLName: string | null;
    selectedEmployee: string | null;
    selectedEmployeeName: string | null;
    selectedTeam: string | null;
    selectedTeamName: string | null;
    loading: boolean;
}

const initialState: DrilldownState = {
    level: 'project',
    selectedProject: null,
    selectedProjectName: null,
    selectedCTO: null,
    selectedCTOName: null,
    selectedPM: null,
    selectedPMName: null,
    selectedTL: null,
    selectedTLName: null,
    selectedEmployee: null,
    selectedEmployeeName: null,
    selectedTeam: null,
    selectedTeamName: null,
    loading: false,
};

const drilldownSlice = createSlice({
    name: 'drilldown',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        drillToCTO(state, action: PayloadAction<{ projectId: string; projectName: string }>) {
            state.level = 'cto';
            state.selectedProject = action.payload.projectId;
            state.selectedProjectName = action.payload.projectName;
        },
        drillToPM(state, action: PayloadAction<{ ctoId: string; ctoName: string }>) {
            state.level = 'pm';
            state.selectedCTO = action.payload.ctoId;
            state.selectedCTOName = action.payload.ctoName;
        },
        drillToTL(state, action: PayloadAction<{ pmId: string; pmName: string }>) {
            state.level = 'tl';
            state.selectedPM = action.payload.pmId;
            state.selectedPMName = action.payload.pmName;
        },
        drillToEmployee(state, action: PayloadAction<{ tlId: string; tlName: string }>) {
            state.level = 'employee';
            state.selectedTL = action.payload.tlId;
            state.selectedTLName = action.payload.tlName;
        },
        drillToEmployeeProjects(state, action: PayloadAction<{ employeeId: string; employeeName: string }>) {
            state.level = 'employeeProjects';
            state.selectedEmployee = action.payload.employeeId;
            state.selectedEmployeeName = action.payload.employeeName;
        },
        drillToTeam(state, action: PayloadAction<{ projectId: string; projectName: string }>) {
            state.level = 'team';
            state.selectedProject = action.payload.projectId;
            state.selectedProjectName = action.payload.projectName;
        },
        drillToMember(state, action: PayloadAction<{ teamId: string; teamName: string }>) {
            state.level = 'member';
            state.selectedTeam = action.payload.teamId;
            state.selectedTeamName = action.payload.teamName;
        },
        goBack(state) {
            switch (state.level) {
                case 'employeeProjects':
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
                    state.level = 'pm';
                    state.selectedPM = null;
                    state.selectedPMName = null;
                    break;
                case 'pm':
                    state.level = 'cto';
                    state.selectedCTO = null;
                    state.selectedCTOName = null;
                    break;
                case 'cto':
                    state.level = 'project';
                    state.selectedProject = null;
                    state.selectedProjectName = null;
                    break;
                case 'member':
                    state.level = 'team';
                    state.selectedTeam = null;
                    state.selectedTeamName = null;
                    break;
                case 'team':
                    state.level = 'project';
                    state.selectedProject = null;
                    state.selectedProjectName = null;
                    break;
            }
        },
        goToLevel(state, action: PayloadAction<DrilldownLevel>) {
            const target = action.payload;
            if (target === 'project') {
                return { ...initialState };
            }
            if (target === 'cto') {
                state.level = 'cto';
                state.selectedCTO = null;
                state.selectedCTOName = null;
                state.selectedPM = null;
                state.selectedPMName = null;
                state.selectedTL = null;
                state.selectedTLName = null;
                state.selectedEmployee = null;
                state.selectedEmployeeName = null;
            }
            if (target === 'pm') {
                state.level = 'pm';
                state.selectedPM = null;
                state.selectedPMName = null;
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
            if (target === 'team') {
                state.level = 'team';
                state.selectedTeam = null;
                state.selectedTeamName = null;
            }
            if (target === 'member') {
                state.level = 'member';
            }
        },
        resetDrilldown() {
            return { ...initialState };
        },
    },
});

export const {
    setLoading,
    drillToCTO,
    drillToPM,
    drillToTL,
    drillToEmployee,
    drillToEmployeeProjects,
    drillToTeam,
    drillToMember,
    goBack,
    goToLevel,
    resetDrilldown,
} = drilldownSlice.actions;

export default drilldownSlice.reducer;
