import { Building2, Globe2, Briefcase, FolderKanban, Users2, UserPlus, Mail } from 'lucide-react';

import type { TabConfig } from './types';

export const TABS: TabConfig[] = [

    { key: 'organizations', label: 'Organizations', icon: Building2, color: 'text-indigo-500', gradient: 'from-indigo-600 to-indigo-400' },

    { key: 'markets', label: 'Markets', icon: Globe2, color: 'text-blue-500', gradient: 'from-blue-600 to-blue-400' },

    { key: 'accounts', label: 'Accounts', icon: Briefcase, color: 'text-emerald-500', gradient: 'from-emerald-600 to-emerald-400' },

    { key: 'projects', label: 'Projects', icon: FolderKanban, color: 'text-violet-500', gradient: 'from-violet-600 to-violet-400' },

    { key: 'teams', label: 'Teams', icon: Users2, color: 'text-amber-500', gradient: 'from-amber-600 to-amber-400' },

    { key: 'members', label: 'Team Members', icon: UserPlus, color: 'text-cyan-500', gradient: 'from-cyan-600 to-cyan-400' },

    { key: 'users', label: 'Users', icon: Building2, color: 'text-rose-500', gradient: 'from-rose-600 to-rose-400' },

    { key: 'onboard-employee', label: 'Onboard Employees', icon: UserPlus, color: 'text-emerald-500', gradient: 'from-emerald-600 to-emerald-400' },

    { key: 'report-schedules', label: 'Schedule Reports', icon: Mail, color: 'text-violet-500', gradient: 'from-violet-600 to-violet-400' },

];

export const AVAILABLE_BADGES = [

    { name: 'none', label: 'None' },

    { name: 'Microsoft Azure AI Engineer', label: 'Azure AI' },

    { name: 'Amazon Web Services DevOps Engineer', label: 'AWS DevOps' },

    { name: 'Cloud Native Computing Foundation Kubernetes Administrator', label: 'CNCF CKA' },

    { name: 'ISC2 CISSP', label: 'ISC2 CISSP' },

    { name: 'Google Professional Data Engineer', label: 'Google Data' },

    { name: 'DevOps Guru', label: 'DevOps Guru' },

    { name: 'AI Pioneer', label: 'AI Pioneer' },

    { name: 'Cloud Architect', label: 'Cloud Architect' },

    { name: 'Security Champion', label: 'Security' },

    { name: 'Agile Master', label: 'Agile' },

    { name: 'Code Ninja', label: 'Ninja' },

    { name: 'Bug Hunter', label: 'Hunter' },

    { name: 'UI Wizard', label: 'UI Wizard' }

];
