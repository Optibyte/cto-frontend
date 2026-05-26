import { 
    Award, ShieldCheck, Database, Server, Cpu, Brain, Infinity, 
    Terminal, Bug, Wand2, Compass, Layers, Shield
} from 'lucide-react';
import React from 'react';

export interface BadgeStyle {
    bg: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    glow: string;
}

export const getBadgeStyles = (badgeName: string): BadgeStyle => {
    const name = badgeName.toLowerCase();
    
    if (name.includes('azure ai engineer')) {
        return {
            bg: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
            icon: Cpu,
            label: 'Azure AI Engineer',
            glow: 'shadow-blue-500/10 shadow-sm'
        };
    }
    if (name.includes('web services devops') || name.includes('aws devops')) {
        return {
            bg: 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400',
            icon: Infinity,
            label: 'AWS DevOps Engineer',
            glow: 'shadow-orange-500/10 shadow-sm'
        };
    }
    if (name.includes('kubernetes administrator') || name.includes('cncf') || name.includes('kubernetes')) {
        return {
            bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
            icon: Compass,
            label: 'CNCF CKA',
            glow: 'shadow-cyan-500/10 shadow-sm'
        };
    }
    if (name.includes('cissp') || name.includes('isc2')) {
        return {
            bg: 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400',
            icon: ShieldCheck,
            label: 'ISC2 CISSP',
            glow: 'shadow-rose-500/10 shadow-sm'
        };
    }
    if (name.includes('google professional data') || name.includes('google data') || name.includes('professional data engineer')) {
        return {
            bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
            icon: Database,
            label: 'Google Data Engineer',
            glow: 'shadow-emerald-500/10 shadow-sm'
        };
    }
    if (name.includes('devops guru')) {
        return {
            bg: 'bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400',
            icon: Server,
            label: 'DevOps Guru',
            glow: 'shadow-violet-500/10 shadow-sm'
        };
    }
    if (name.includes('ai pioneer')) {
        return {
            bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
            icon: Brain,
            label: 'AI Pioneer',
            glow: 'shadow-indigo-500/10 shadow-sm'
        };
    }
    if (name.includes('cloud architect')) {
        return {
            bg: 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400',
            icon: Layers,
            label: 'Cloud Architect',
            glow: 'shadow-sky-500/10 shadow-sm'
        };
    }
    if (name.includes('security champion')) {
        return {
            bg: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
            icon: Shield,
            label: 'Security Champion',
            glow: 'shadow-red-500/10 shadow-sm'
        };
    }
    if (name.includes('scrum master') || name.includes('agile master')) {
        return {
            bg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
            icon: Award,
            label: 'Agile Master',
            glow: 'shadow-amber-500/10 shadow-sm'
        };
    }
    if (name.includes('code ninja')) {
        return {
            bg: 'bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-300',
            icon: Terminal,
            label: 'Code Ninja',
            glow: 'shadow-slate-500/10 shadow-sm'
        };
    }
    if (name.includes('bug hunter')) {
        return {
            bg: 'bg-pink-500/10 border-pink-500/30 text-pink-600 dark:text-pink-400',
            icon: Bug,
            label: 'Bug Hunter',
            glow: 'shadow-pink-500/10 shadow-sm'
        };
    }
    if (name.includes('ui wizard')) {
        return {
            bg: 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400',
            icon: Wand2,
            label: 'UI Wizard',
            glow: 'shadow-fuchsia-500/10 shadow-sm'
        };
    }
    
    // Fallback
    return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
        icon: Award,
        label: badgeName,
        glow: 'shadow-amber-500/10 shadow-sm'
    };
};
