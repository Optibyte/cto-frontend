import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { setSelectedTemplate, toggleFavorite, hydrateTemplates } from '../redux/slices/templateSlice';

const SELECTED_TEMPLATE_STORAGE_KEY = 'compass_selected_dashboard_template';
const FAVORITE_TEMPLATES_STORAGE_KEY = 'compass_favorite_dashboard_templates';

export function useTemplate() {
    const dispatch = useAppDispatch();
    const { selectedTemplate, favoriteTemplates, isHydrated } = useAppSelector((state) => state.template);

    // Hydrate state from localStorage on initial mount (client-side only)
    useEffect(() => {
        if (!isHydrated && typeof window !== 'undefined') {
            try {
                const savedSelected = localStorage.getItem(SELECTED_TEMPLATE_STORAGE_KEY);
                const savedFavorites = localStorage.getItem(FAVORITE_TEMPLATES_STORAGE_KEY);

                dispatch(hydrateTemplates({
                    selectedTemplate: savedSelected || 'set7',
                    favoriteTemplates: savedFavorites ? JSON.parse(savedFavorites) : [],
                }));
            } catch (error) {
                console.error('Failed to hydrate templates state from localStorage:', error);
                dispatch(hydrateTemplates({}));
            }
        }
    }, [isHydrated, dispatch]);

    const selectTemplate = (templateId: string) => {
        dispatch(setSelectedTemplate(templateId));
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(SELECTED_TEMPLATE_STORAGE_KEY, templateId);
            } catch (error) {
                console.error('Failed to save selected template to localStorage:', error);
            }
        }
    };

    const toggleFavoriteTemplate = (templateId: string) => {
        dispatch(toggleFavorite(templateId));
        
        // Compute the next favorites array to update localStorage immediately
        let nextFavorites = [...favoriteTemplates];
        const index = nextFavorites.indexOf(templateId);
        if (index >= 0) {
            nextFavorites.splice(index, 1);
        } else {
            nextFavorites.push(templateId);
        }

        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(FAVORITE_TEMPLATES_STORAGE_KEY, JSON.stringify(nextFavorites));
            } catch (error) {
                console.error('Failed to save favorite templates to localStorage:', error);
            }
        }
    };

    return {
        selectedTemplate,
        favoriteTemplates,
        isHydrated,
        selectTemplate,
        toggleFavoriteTemplate,
    };
}
