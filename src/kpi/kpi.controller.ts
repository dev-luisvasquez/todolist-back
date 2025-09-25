import { Controller, Get, Request, Query, ParseIntPipe } from '@nestjs/common';
import { KpiService } from './kpi.service';
import { AuthenticatedRequest } from '../auth/interfaces/auth.interface';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiBadRequestResponse,
    ApiQuery
} from '@nestjs/swagger';

@ApiTags('KPI')
@ApiBearerAuth()
@Controller('kpi')
export class KpiController {
    constructor(private readonly kpiService: KpiService) {}

    @Get('task-distribution')
    @ApiOperation({
        summary: 'Obtener distribución de tareas por estado',
        description: 'Devuelve la distribución de tareas agrupadas por su estado (pendiente, en progreso, completada) para el usuario autenticado.'
    })
    @ApiResponse({
        status: 200,
        description: 'Distribución de tareas obtenida exitosamente',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', description: 'ID del usuario' },
                distribution: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            state: { type: 'string', description: 'Estado de la tarea' },
                            count: { type: 'number', description: 'Cantidad de tareas en este estado' }
                        }
                    }
                },
                total: { type: 'number', description: 'Total de tareas' }
            }
        }
    })
    @ApiBadRequestResponse({ description: 'Token de autorización inválido' })
    async getTaskDistribution(@Request() req: AuthenticatedRequest) {
        const userId = req.user.id; // ID extraído del token por el middleware
        return this.kpiService.kpiDistributionTaskForState(userId);
    }

    @Get('tasks-by-priority')
    @ApiOperation({
        summary: 'Obtener distribución de tareas por prioridad',
        description: 'Devuelve la cantidad de tareas agrupadas por su nivel de prioridad para el usuario autenticado.'
    })
    @ApiResponse({
        status: 200,
        description: 'Distribución por prioridad obtenida exitosamente',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    priority: { type: 'string', description: 'Nivel de prioridad de la tarea' },
                    count: { type: 'number', description: 'Cantidad de tareas con esta prioridad' }
                }
            }
        }
    })
    @ApiBadRequestResponse({ description: 'Token de autorización inválido' })
    async getTasksByPriority(@Request() req: AuthenticatedRequest) {
        const userId = req.user.id;
        return this.kpiService.kpiTasksByPriority(userId);
    }

    @Get('completed-this-month')
    @ApiOperation({
        summary: 'Obtener tareas completadas este mes',
        description: 'Devuelve el número total de tareas completadas en el mes actual para el usuario autenticado.'
    })
    @ApiResponse({
        status: 200,
        description: 'Tareas completadas este mes obtenidas exitosamente',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', description: 'ID del usuario' },
                month: { type: 'string', description: 'Mes y año actual' },
                completedTasks: { type: 'number', description: 'Número de tareas completadas este mes' }
            }
        }
    })
    @ApiBadRequestResponse({ description: 'Token de autorización inválido' })
    async getCompletedThisMonth(@Request() req: AuthenticatedRequest) {
        const userId = req.user.id;
        return this.kpiService.kpiTasksCompletedThisMonth(userId);
    }

    @Get('completed-for-days')
    @ApiOperation({
        summary: 'Obtener tareas completadas por día',
        description: 'Devuelve las tareas completadas agrupadas por día en un rango específico de días (por defecto 7 días).'
    })
    @ApiQuery({
        name: 'days',
        required: false,
        type: Number,
        description: 'Número de días a consultar (por defecto: 7)',
        example: 7
    })
    @ApiResponse({
        status: 200,
        description: 'Tareas completadas por día obtenidas exitosamente',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', description: 'ID del usuario' },
                days: { type: 'number', description: 'Número de días consultados' },
                period: { type: 'string', description: 'Descripción del período' },
                totalTasks: { type: 'number', description: 'Total de tareas completadas en el período' },
                dateRange: {
                    type: 'object',
                    properties: {
                        start: { type: 'string', description: 'Fecha de inicio en formato ISO' },
                        end: { type: 'string', description: 'Fecha de fin en formato ISO' },
                        startDate: { type: 'string', description: 'Fecha de inicio en formato YYYY-MM-DD' },
                        endDate: { type: 'string', description: 'Fecha de fin en formato YYYY-MM-DD' }
                    }
                },
                tasksByDay: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            date: { type: 'string', description: 'Fecha en formato YYYY-MM-DD' },
                            dateISO: { type: 'string', description: 'Fecha en formato ISO completo' },
                            count: { type: 'number', description: 'Número de tareas completadas ese día' },
                            dayName: { type: 'string', description: 'Nombre del día de la semana' }
                        }
                    }
                }
            }
        }
    })
    @ApiBadRequestResponse({ description: 'Token de autorización inválido o parámetro days inválido' })
    async getCompletedForDays(
        @Request() req: AuthenticatedRequest,
        @Query('days', new ParseIntPipe({ optional: true })) days?: number
    ) {
        const userId = req.user.id;
        return this.kpiService.kpiTaskCompletedForDays(userId, days);
    }

    @Get('avg-completion-time')
    @ApiOperation({
        summary: 'Obtener tiempo promedio de finalización por prioridad',
        description: 'Devuelve el tiempo promedio que tarda en completarse una tarea, agrupado por nivel de prioridad.'
    })
    @ApiResponse({
        status: 200,
        description: 'Tiempo promedio de finalización obtenido exitosamente',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    priority: { type: 'string', description: 'Nivel de prioridad' },
                    avgCompletionTimeMinutes: { type: 'number', description: 'Tiempo promedio en minutos' },
                    avgCompletionTimeFormatted: { type: 'string', description: 'Tiempo promedio en formato DD:HH:MM' },
                    totalTasks: { type: 'number', description: 'Total de tareas consideradas para el cálculo' },
                    details: {
                        type: 'object',
                        properties: {
                            days: { type: 'number', description: 'Días del tiempo promedio' },
                            hours: { type: 'number', description: 'Horas del tiempo promedio' },
                            minutes: { type: 'number', description: 'Minutos del tiempo promedio' }
                        }
                    }
                }
            }
        }
    })
    @ApiBadRequestResponse({ description: 'Token de autorización inválido' })
    async getAvgCompletionTime(@Request() req: AuthenticatedRequest) {
        const userId = req.user.id;
        return this.kpiService.kpiTimeAvgCompletedTasksByPriority(userId);
    }
}
