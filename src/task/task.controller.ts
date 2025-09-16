import { Controller, Body, Param, Get, Post, Delete, Patch, Put } from '@nestjs/common';
import { TaskService } from './task.service';
import { 
    CreateTaskDto, 
    UpdateTaskDto, 
    UpdateTaskStateDto, 
    DeleteMultipleTasksDto, 
    TaskDto 
} from './dto/task.dto';
import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiParam, 
    ApiBody,
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiBadRequestResponse 
} from '@nestjs/swagger';

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOperation({ 
      summary: 'Obtener todas las tareas',
      description: 'Obtiene una lista de todas las tareas registradas en el sistema'
  })
  @ApiResponse({ 
      status: 200, 
      description: 'Lista de tareas obtenida exitosamente',
      type: [TaskDto]
  })
  getAllTasks() {
    return this.taskService.getAllTasks();
  }

  @Get(':id')
  @ApiOperation({ 
      summary: 'Obtener tarea por ID',
      description: 'Obtiene la información de una tarea específica por su ID'
  })
  @ApiParam({ 
      name: 'id', 
      description: 'ID único de la tarea',
      example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  @ApiResponse({ 
      status: 200, 
      description: 'Tarea encontrada exitosamente',
      type: TaskDto
  })
  @ApiNotFoundResponse({ 
      description: 'Tarea no encontrada'
  })
  getTaskById(@Param('id') id: string) {
    return this.taskService.getTaskById(id);
  }

  @Post()
  @ApiOperation({ 
      summary: 'Crear nueva tarea',
      description: 'Crea una nueva tarea en el sistema'
  })
  @ApiBody({ 
      type: CreateTaskDto,
      description: 'Datos de la tarea a crear'
  })
  @ApiResponse({ 
      status: 201, 
      description: 'Tarea creada exitosamente',
      type: TaskDto
  })
  @ApiBadRequestResponse({ 
      description: 'Datos de entrada inválidos'
  })
  createTask(@Body() taskData: CreateTaskDto) {
    return this.taskService.createTask(taskData); 
  }

  @Patch(':id/state')
  @ApiOperation({ 
      summary: 'Actualizar estado de tarea',
      description: 'Actualiza únicamente el estado de una tarea específica'
  })
  @ApiParam({ 
      name: 'id', 
      description: 'ID único de la tarea',
      example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  @ApiBody({ 
      type: UpdateTaskStateDto,
      description: 'Nuevo estado de la tarea'
  })
  @ApiResponse({ 
      status: 200, 
      description: 'Estado de la tarea actualizado exitosamente',
      type: TaskDto
  })
  @ApiNotFoundResponse({ 
      description: 'Tarea no encontrada'
  })
  @ApiBadRequestResponse({ 
      description: 'Estado inválido'
  })
  updateTaskState(
    @Param('id') id: string,
    @Body() updateStateDto: UpdateTaskStateDto,
  ) {
    return this.taskService.updateTaskState(id, updateStateDto.state);
  }

  @Put(':id')
  @ApiOperation({ 
      summary: 'Actualizar tarea completa',
      description: 'Actualiza toda la información de una tarea específica'
  })
  @ApiParam({ 
      name: 'id', 
      description: 'ID único de la tarea',
      example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  @ApiBody({ 
      type: UpdateTaskDto,
      description: 'Datos actualizados de la tarea'
  })
  @ApiResponse({ 
      status: 200, 
      description: 'Tarea actualizada exitosamente',
      type: TaskDto
  })
  @ApiNotFoundResponse({ 
      description: 'Tarea no encontrada'
  })
  @ApiBadRequestResponse({ 
      description: 'Datos de entrada inválidos'
  })
  updateTaskById(
    @Param('id') id: string,
    @Body() taskData: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(id, taskData);
  }

  @Delete()
  @ApiOperation({ 
      summary: 'Eliminar múltiples tareas',
      description: 'Elimina múltiples tareas del sistema usando sus IDs'
  })
  @ApiBody({ 
      type: DeleteMultipleTasksDto,
      description: 'Lista de IDs de tareas a eliminar'
  })
  @ApiResponse({ 
      status: 200, 
      description: 'Tareas eliminadas exitosamente'
  })
  @ApiBadRequestResponse({ 
      description: 'Lista de IDs inválida'
  })
  deleteMultipleTasks(@Body() body: DeleteMultipleTasksDto) {
    if (!body.taskIds || !Array.isArray(body.taskIds)) {
      throw new Error('taskIds must be an array');
    }

    return this.taskService.deleteMultipleTasks(body.taskIds);
  }

  @Delete(':id')
  @ApiOperation({ 
      summary: 'Eliminar tarea por ID',
      description: 'Elimina una tarea específica del sistema'
  })
  @ApiParam({ 
      name: 'id', 
      description: 'ID único de la tarea',
      example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  @ApiResponse({ 
      status: 200, 
      description: 'Tarea eliminada exitosamente',
      type: TaskDto
  })
  @ApiNotFoundResponse({ 
      description: 'Tarea no encontrada'
  })
  deleteTask(@Param('id') id: string) {
    return this.taskService.deleteTaskById(id);
  }
}
