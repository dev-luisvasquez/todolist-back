import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TaskService {
    constructor(private readonly prisma: PrismaService) { }

    //GETs Tasks
    async getAllTasksByUser(userId: string, state?: 'pending' | 'in_progress' | 'completed') {
        try {
            const whereCondition: any = {
                user_id: userId,
            };

            // Si se proporciona un estado, agregarlo al filtro
            if (state) {
                whereCondition.state = state;
            }

            return await this.prisma.tasks.findMany({
                where: whereCondition,
            });
        } catch (error) {
            console.error('Error getting all tasks:', error);
            throw new HttpException('Could not retrieve tasks', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getTaskById(taskId: string) {
        try {
            const task = await this.prisma.tasks.findUnique({
                where: {
                    id: taskId,
                },
            });
            if (!task) {
                throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
            }
            return task;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            console.error('Error getting task by ID:', error);
            throw new HttpException('Could not retrieve task', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //Update Task
    async updateTask(taskId: string, data: {
        title?: string;
        description?: string,
        priority?: 'low' | 'medium' | 'high',
        state?: 'pending' | 'in_progress' | 'completed'
    }) {
        try {
            return await this.prisma.tasks.update({
                where: {
                    id: taskId,
                },
                data: {
                    title: data.title,
                    description: data.description,
                    priority: data.priority,
                    state: data.state,
                },
            });
        } catch (error) {
            console.error('Error updating task:', error);
            if (error.code === 'P2025') {
                throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
            }
            throw new HttpException('Could not update task', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateTaskState(taskId: string, state: 'pending' | 'in_progress' | 'completed') {
        try {
            if (state === 'completed') {
                return await this.prisma.tasks.update({
                    where: {
                        id: taskId,
                    },
                    data: {
                        state: state,
                        completed_at: new Date(),
                    },
                });
            } else {
                return await this.prisma.tasks.update({
                    where: {
                        id: taskId,
                    },
                    data: {
                        state: state,
                        completed_at: null,
                    },
                });
            }

        } catch (error) {
            console.error('Error updating task state:', error);
            if (error.code === 'P2025') {
                throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
            }
            throw new HttpException('Could not update task state', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //delete Task
    async deleteTaskById(taskId: string) {
        try {
            const result = await this.prisma.tasks.deleteMany({
                where: {
                    id: taskId,
                },
            });
            if (result.count === 0) {
                throw new HttpException('Task not found or was already deleted', HttpStatus.NOT_FOUND);
            }
            return {
                message: 'Task deleted successfully',
                deletedCount: 'Tasks deleted: ' + result.count
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            console.error('Error deleting task by user ID:', error);
            throw new HttpException('Could not delete task', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteAllTasksByUserId(userId: string) {
        try {
            return await this.prisma.tasks.deleteMany({
                where: {
                    user_id: userId,
                },
            });
        } catch (error) {
            console.error('Error deleting all tasks by user ID:', error);
            throw new HttpException('Could not delete user tasks', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //Create Task
    async createTask(data: {
        title: string;
        description?: string,
        priority: 'low' | 'medium' | 'high',
        userId: string,
        state: 'pending' | 'in_progress' | 'completed'
    }) {
        try {
            const task = await this.prisma.tasks.create({
                data: {
                    id: uuidv4(),
                    user_id: data.userId,
                    title: data.title,
                    description: data.description ?? '',
                    priority: data.priority,
                    state: data.state,
                },
            });
            console.log(task);
            return task;
        } catch (error) {
            console.error('Error creating task:', error);
            throw new HttpException('Could not create task', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //delete Multiple Tasks
    async deleteMultipleTasks(taskIds: string[]) {
        try {
            if (!taskIds || taskIds.length === 0) {
                throw new HttpException('No task IDs provided', HttpStatus.BAD_REQUEST);
            }

            const result = await this.prisma.tasks.deleteMany({
                where: {
                    id: {
                        in: taskIds
                    }
                },
            });

            if (result.count === 0) {
                throw new HttpException('No tasks found with the provided IDs', HttpStatus.NOT_FOUND);
            }

            return {
                message: `${result.count} task(s) deleted successfully`,
                deletedCount: result.count,
                requestedCount: taskIds.length
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            console.error('Error deleting multiple tasks:', error);
            throw new HttpException('Could not delete tasks', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

