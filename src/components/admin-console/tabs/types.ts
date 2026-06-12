export interface AdminRowProps {
    item: any;
    projects?: any[];
    teams?: any[];
    onBadgeAssign?: (userId: string, badgeName: string) => Promise<void>;
    onTriggerReport?: (id: string) => Promise<void>;
}
