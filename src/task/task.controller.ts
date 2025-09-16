import { Controller, Body, Param, Get, Post, Delete, Patch, Put } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('tasks') // plural es más común
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // Obtener todas las tareas
  @Get()
  getAllTasks() {
    return this.taskService.getAllTasks();
  }

  // Obtener una tarea por id
  @Get(':id')
  getTaskById(@Param('id') id: string) {
    return this.taskService.getTaskById(id);
  }

  // Crear tarea
  @Post()
  createTask(@Body() taskData: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    userId: string;
    state: 'pending' | 'in_progress' | 'completed';
  }) {
    return this.taskService.createTask(taskData); 
  }

  // Actualizar solo el estado de una tarea
  @Patch(':id/state')
  updateTaskState(
    @Param('id') id: string,
    @Body('state') state: 'pending' | 'in_progress' | 'completed',
  ) {
    return this.taskService.updateTaskState(id, state);
  }

  // Actualizar una tarea completa por id
  @Put(':id')
  updateTaskById(
    @Param('id') id: string,
    @Body() taskData: {
      title: string;
      description?: string;
      priority: 'low' | 'medium' | 'high';
      userId: string;
      state: 'pending' | 'in_progress' | 'completed';
    },
  ) {
    return this.taskService.updateTask(id, taskData);
  }

  // Eliminar múltiples tareas
  @Delete()
  deleteMultipleTasks(@Body() body: { taskIds: string[] }) {
    if (!body.taskIds || !Array.isArray(body.taskIds)) {
      throw new Error('taskIds must be an array');
    }

    return this.taskService.deleteMultipleTasks(body.taskIds);
  }

  // Eliminar una tarea
  @Delete(':id')
  deleteTask(@Param('id') id: string) {
    return this.taskService.deleteTaskById(id);
  }
}
