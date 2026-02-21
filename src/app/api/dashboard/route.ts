import { NextRequest, NextResponse } from 'next/server';
import {
    mockTeams,
    mockManagers,
    mockTLs,
    mockEmployees,
    mockProjects,
    getManagersByTeam,
    getTLsByManager,
    getEmployeesByTL,
    getProjectsByFilters,
} from '@/lib/mock-data/drilldown';
import {
    getFilteredKPIData,
    getFilteredTeamPerformance,
    getFilteredSLAStatus,
    getFilteredActivities,
} from '@/lib/mock-data/dashboard-filtered';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');
    const teamFilter = searchParams.get('teamFilter');
    const team = searchParams.get('team');
    const manager = searchParams.get('manager');
    const tl = searchParams.get('tl');
    const employee = searchParams.get('employee');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // ===== Dashboard filter mode (project/teamFilter) =====
    if (project !== null) {
        const projectId = project || 'all';
        const teamId = teamFilter || 'all';
        return NextResponse.json({
            mode: 'dashboard',
            filters: { project: projectId, team: teamId },
            kpis: getFilteredKPIData(projectId, teamId),
            teamPerformance: getFilteredTeamPerformance(projectId, teamId),
            slaStatus: getFilteredSLAStatus(projectId, teamId),
            activities: getFilteredActivities(projectId, teamId),
        });
    }

    // ===== Drill-down mode (team/manager/tl/employee) =====

    // Team level — return all teams
    if (!team) {
        return NextResponse.json({
            level: 'team',
            data: mockTeams,
        });
    }

    // Manager level — return managers for a team
    if (team && !manager) {
        const managers = getManagersByTeam(team);
        const teamData = mockTeams.find(t => t.id === team);
        return NextResponse.json({
            level: 'manager',
            team: teamData,
            data: managers,
        });
    }

    // TL level — return TLs for a manager
    if (manager && !tl) {
        const tls = getTLsByManager(manager);
        const managerData = mockManagers.find(m => m.id === manager);
        return NextResponse.json({
            level: 'tl',
            manager: managerData,
            data: tls,
        });
    }

    // Employee level — return employees for a TL
    if (tl && !employee) {
        const employees = getEmployeesByTL(tl);
        const tlData = mockTLs.find(t => t.id === tl);
        return NextResponse.json({
            level: 'employee',
            tl: tlData,
            data: employees,
        });
    }

    // Project level — return projects for an employee
    if (employee) {
        const projects = getProjectsByFilters({ employeeId: employee });
        const employeeData = mockEmployees.find(e => e.id === employee);
        return NextResponse.json({
            level: 'project',
            employee: employeeData,
            data: projects,
        });
    }

    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
}

