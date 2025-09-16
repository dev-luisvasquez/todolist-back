import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

export enum TaskState {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed'
}

export class TaskDto {
    @ApiProperty({
        description: 'ID único de la tarea',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    })
    id: string;

    @ApiProperty({
        description: 'Título de la tarea',
        example: 'Completar proyecto de desarrollo'
    })
    title: string;

    @ApiPropertyOptional({
        description: 'Descripción detallada de la tarea',
        example: 'Finalizar el desarrollo del API REST para la gestión de tareas'
    })
    description?: string;

    @ApiProperty({
        description: 'Prioridad de la tarea',
        enum: TaskPriority,
        example: TaskPriority.HIGH
    })
    priority: TaskPriority;

    @ApiProperty({
        description: 'ID del usuario asignado a la tarea',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    })
    userId: string;

    @ApiProperty({
        description: 'Estado actual de la tarea',
        enum: TaskState,
        example: TaskState.PENDING
    })
    state: TaskState;

    @ApiPropertyOptional({
        description: 'Fecha de creación de la tarea',
        example: '2023-01-01T00:00:00.000Z'
    })
    created_at?: Date;

    @ApiPropertyOptional({
        description: 'Fecha de última actualización de la tarea',
        example: '2023-01-02T00:00:00.000Z'
    })
    updated_at?: Date;
}

export class CreateTaskDto {
    @ApiProperty({
        description: 'Título de la tarea',
        example: 'Completar proyecto de desarrollo',
        minLength: 1
    })
    title: string;

    @ApiPropertyOptional({
        description: 'Descripción detallada de la tarea',
        example: 'Finalizar el desarrollo del API REST para la gestión de tareas'
    })
    description?: string;

    @ApiProperty({
        description: 'Prioridad de la tarea',
        enum: TaskPriority,
        example: TaskPriority.HIGH
    })
    priority: TaskPriority;

    @ApiProperty({
        description: 'ID del usuario asignado a la tarea',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    })
    userId: string;

    @ApiProperty({
        description: 'Estado inicial de la tarea',
        enum: TaskState,
        example: TaskState.PENDING
    })
    state: TaskState;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class UpdateTaskStateDto {
    @ApiProperty({
        description: 'Nuevo estado de la tarea',
        enum: TaskState,
        example: TaskState.IN_PROGRESS
    })
    state: TaskState;
}

export class DeleteMultipleTasksDto {
    @ApiProperty({
        description: 'Array de IDs de las tareas a eliminar',
        type: [String],
        example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6g7-8901-bcde-f23456789012']
    })
    taskIds: string[];
}
