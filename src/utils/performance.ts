import { PerformanceEvaluation, Task, User } from '../types';

export interface EmployeePerformance {
  user: User;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  criteria: {
    result: number;
    quality: number;
    productivity: number;
    discipline: number;
    teamwork: number;
  };
  evaluation?: PerformanceEvaluation;
  rating: number;
  bonusPoints: number;
  rank: number;
}

const parseRuDate = (value?: string): Date | null => {
  if (!value) return null;

  const [datePart] = value.split(' ');
  const [day, month, year] = datePart.split('.').map(Number);

  if (!day || !month || !year) return null;

  return new Date(year, month - 1, day);
};

const isTaskOverdue = (task: Task): boolean => {
  if (task.status === 'DONE') return false;

  const deadline = parseRuDate(task.deadline);
  if (!deadline) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  return deadline < today;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

export const calculateEmployeePerformance = (
  users: User[],
  tasks: Task[],
  evaluations: PerformanceEvaluation[] = [],
): EmployeePerformance[] => {
  const employees = users.filter((user) => user.role === 'EMPLOYEE');

  const performance = employees.map((user) => {
    const employeeTasks = tasks.filter((task) => task.assigneeId === user.id);
    const totalTasks = employeeTasks.length;
    const completedTasks = employeeTasks.filter((task) => task.status === 'DONE').length;
    const inProgressTasks = employeeTasks.filter((task) => task.status === 'IN_PROGRESS').length;
    const pendingTasks = employeeTasks.filter((task) => task.status === 'PENDING').length;
    const overdueTasks = employeeTasks.filter(isTaskOverdue).length;
    const evaluation = evaluations.find((item) => item.employeeId === user.id);
    const managerQuality = evaluation ? evaluation.quality * 20 : 60;
    const managerDiscipline = evaluation ? evaluation.discipline * 20 : 60;
    const managerTeamwork = evaluation ? evaluation.teamwork * 20 : 60;

    if (totalTasks === 0) {
      const criteria = {
        result: 0,
        quality: managerQuality,
        productivity: 0,
        discipline: managerDiscipline,
        teamwork: managerTeamwork,
      };
      const rating = Math.round(
        criteria.result * 0.30 +
        criteria.quality * 0.20 +
        criteria.productivity * 0.20 +
        criteria.discipline * 0.15 +
        criteria.teamwork * 0.15,
      );

      return {
        user,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks,
        criteria,
        evaluation,
        rating,
        bonusPoints: rating * 5,
        rank: 0,
      };
    }

    const completionRate = completedTasks / totalTasks;
    const progressRate = inProgressTasks / totalTasks;
    const overdueRate = overdueTasks / totalTasks;
    const activeRate = (completedTasks + inProgressTasks) / totalTasks;

    const criteria = {
      result: clamp(Math.round(completionRate * 100), 0, 100),
      quality: managerQuality,
      productivity: clamp(Math.round(activeRate * 100), 0, 100),
      discipline: clamp(Math.round(managerDiscipline - overdueRate * 35), 0, 100),
      teamwork: managerTeamwork,
    };

    const rating = Math.round(
      criteria.result * 0.30 +
      criteria.quality * 0.20 +
      criteria.productivity * 0.20 +
      criteria.discipline * 0.15 +
      criteria.teamwork * 0.15,
    );

    const bonusPoints = Math.max(
      0,
      rating * 8 + completedTasks * 40 + inProgressTasks * 15 - overdueTasks * 30,
    );

    return {
      user,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      criteria,
      evaluation,
      rating,
      bonusPoints,
      rank: 0,
    };
  });

  return performance
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.completedTasks !== a.completedTasks) return b.completedTasks - a.completedTasks;
      return b.bonusPoints - a.bonusPoints;
    })
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
};
