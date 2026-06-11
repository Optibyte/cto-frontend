import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TemplateState {
    selectedTemplate: string;
    favoriteTemplates: string[];
    isHydrated: boolean;
}

const initialState: TemplateState = {
    selectedTemplate: 'set7', // Set 7 (Relay) is the default
    favoriteTemplates: [],
    isHydrated: false,
};

const templateSlice = createSlice({
    name: 'template',
    initialState,
    reducers: {
        setSelectedTemplate(state, action: PayloadAction<string>) {
            state.selectedTemplate = action.payload;
        },
        toggleFavorite(state, action: PayloadAction<string>) {
            const setTemplateId = action.payload;
            const index = state.favoriteTemplates.indexOf(setTemplateId);
            if (index >= 0) {
                state.favoriteTemplates.splice(index, 1);
            } else {
                state.favoriteTemplates.push(setTemplateId);
            }
        },
        hydrateTemplates(state, action: PayloadAction<{ selectedTemplate?: string; favoriteTemplates?: string[] }>) {
            if (action.payload.selectedTemplate !== undefined) {
                state.selectedTemplate = action.payload.selectedTemplate;
            }
            if (action.payload.favoriteTemplates !== undefined) {
                state.favoriteTemplates = action.payload.favoriteTemplates;
            }
            state.isHydrated = true;
        },
    },
});

export const {
    setSelectedTemplate,
    toggleFavorite,
    hydrateTemplates,
} = templateSlice.actions;

export default templateSlice.reducer;
