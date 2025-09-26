import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {DateTime} from 'luxon'


@Injectable()
export class KpiService {
    constructor(private readonly prisma: PrismaService) { }

    async kpiDistributionTaskForState(userId: string) {
        // Obtener la distribución de tareas por estado para el usuario específico
        const result = await this.prisma.tasks.groupBy({
            by: ['state'],
            where: {
                user_id: userId
            },
            _count: {
                state: true
            }
        });

        // Transformar el resultado a un formato más legible
        const distribution = result.map(item => ({
            state: item.state,
            count: item._count.state
        }));

        return {
            userId,
            distribution,
            total: distribution.reduce((sum, item) => sum + item.count, 0)
        };
    }

    async kpiTasksPendingByPriority(userId: string) {
        // KPI adicional: distribución por prioridad
        const result = await this.prisma.tasks.groupBy({
            by: ['priority'],
            where: {
                user_id: userId,
                state: 'pending'
            },
            _count: {
                priority: true
            }
        });

        return result.map(item => ({
            priority: item.priority,
            count: item._count.priority
        }));
    }

    async kpiTasksCompletedThisMonth(userId: string) {
        // KPI adicional: tareas completadas este mes
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        const completedTasks = await this.prisma.tasks.count({
            where: {
                user_id: userId,
                state: 'completed',
                completed_at: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });

        return {
            userId,
            month: new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
            completedTasks
        };
    }

    async kpiTaskCompletedForDays(userId: string, days: number = 7) {
        // KPI adicional: tareas completadas por día en los últimos X días
        const endDate = DateTime.now().endOf('day'); // Final del día actual (23:59:59)
        const startDate = DateTime.now().minus({ days: days - 1 }).startOf('day'); // Inicio del primer día del rango (00:00:00)

        const tasks = await this.prisma.tasks.findMany({
            where: {
                user_id: userId,
                state: 'completed',
                completed_at: {
                    gte: startDate.toJSDate(), // Desde el inicio del primer día
                    lte: endDate.toJSDate() // Hasta el final del día actual
                }
            },
            select: {
                completed_at: true
            }
        });

        // Procesar las tareas para agruparlas por día usando Luxon
        const tasksByDay = new Map<string, number>();
        
        tasks.forEach(task => {
            if (task.completed_at) {
                const taskDate = DateTime.fromJSDate(task.completed_at);
                const dateKey = taskDate.toISODate(); // YYYY-MM-DD format
                if (dateKey) { // Verificar que dateKey no sea null
                    tasksByDay.set(dateKey, (tasksByDay.get(dateKey) || 0) + 1);
                }
            }
        });

        // Generar todos los días en el rango, incluyendo días sin tareas
        const allDays: Array<{ date: string; dateISO: string; count: number; dayName: string }> = [];
        let currentDate = startDate; // Ya está en startOf('day')

        while (currentDate.toISODate() <= endDate.toISODate()) {
            const dateKey = currentDate.toISODate();
            if (dateKey) { // Verificar que dateKey no sea null
                const count = tasksByDay.get(dateKey) || 0;
                
                allDays.push({
                    date: dateKey,
                    dateISO: currentDate.toISO(), // ISO del día
                    count,
                    dayName: currentDate.toFormat('ccc', { locale: 'es' })// Nombre del día en español
                });
            }
            
            currentDate = currentDate.plus({ days: 1 });
        }

        return {
            userId,
            days,
            period: `Últimos ${days} días`,
            totalTasks: tasks.length,
            dateRange: {
                start: startDate.toISO(),
                end: endDate.toISO(),
                startDate: startDate.toISODate(),
                endDate: endDate.toISODate()
            },
            tasksByDay: allDays
        };
    }

    async kpiTimeAvgCompletedTasksByPriority(userId: string) {
        // KPI adicional: tiempo promedio para completar tareas por prioridad
        // Usando herramientas nativas de Prisma en lugar de queryRaw
        const completedTasks = await this.prisma.tasks.findMany({
            where: {
                user_id: userId,
                state: 'completed',
                completed_at: {
                    not: null
                }
            },
            select: {
                priority: true,
                created_at: true,
                completed_at: true
            }
        });

        // Agrupar y calcular promedio usando JavaScript
        const priorityGroups = new Map<string, { totalTime: number; count: number }>();

        completedTasks.forEach(task => {
            if (task.completed_at && task.created_at) {
                const completionTimeMs = task.completed_at.getTime() - task.created_at.getTime();
                const completionTimeMinutes = completionTimeMs / (1000 * 60); // Convertir a minutos

                const existing = priorityGroups.get(task.priority) || { totalTime: 0, count: 0 };
                priorityGroups.set(task.priority, {
                    totalTime: existing.totalTime + completionTimeMinutes,
                    count: existing.count + 1
                });
            }
        });

        // Función auxiliar para formatear tiempo en DD:HH:MM
        const formatDuration = (minutes: number): string => {
            const totalMinutes = Math.floor(minutes);
            const days = Math.floor(totalMinutes / (24 * 60));
            const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
            const mins = totalMinutes % 60;

            // Formato DD:HH:MM con padding de ceros
            return `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        };

        // Calcular promedios
        const result = Array.from(priorityGroups.entries()).map(([priority, data]) => {
            const avgMinutes = data.totalTime / data.count;
            return {
                priority,
                avgCompletionTimeMinutes: parseFloat(avgMinutes.toFixed(2)),
                avgCompletionTimeFormatted: formatDuration(avgMinutes),
                totalTasks: data.count,
                details: {
                    days: Math.floor(avgMinutes / (24 * 60)),
                    hours: Math.floor((avgMinutes % (24 * 60)) / 60),
                    minutes: Math.floor(avgMinutes % 60)
                }
            };
        });

        return result;
    }
}
