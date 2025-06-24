export type Priority = 'Must Have' | 'Should Have' | 'Could Have';

export type AcceptanceCriterion = {
  label: string;
  checkedDev?: boolean;
  checkedDevAt?: Date | null;
  checkedTest?: boolean;
  checkedTestAt?: Date | null;
};

export type KanbanStatus = 'todo' | 'inProgress' | 'blocked' | 'toTest' | 'done';

export interface UserStory {
  id: string; // Saisi manuellement
  projectId: string; // Ajouté pour clé composite
  order: number;
  epic: string;
  userRole: string; // Nouveau champ : "En tant que..."
  title: string;
  acceptanceCriteria: AcceptanceCriterion[];
  priority: Priority;
  estimation: number;
  justification: string;
  estimatedStartDate: Date | null;
  estimatedEndDate: Date | null;
  dependency: string;
  status: KanbanStatus;
  kanbanOrder?: number;
  comment?: string;
  blockedSince?: Date;
}
