/**
 * Queue Client Utilities
 * 
 * RESPONSIBILITY: Shared utilities for queue operations
 * ARCHITECTURE: Common queue operations for native functions
 */

/**
 * Queue message types
 */
export type QueueMessageType = 'payment_notification' | 'email_notification' | 'cleanup_task';

/**
 * Base queue message interface
 */
export interface BaseQueueMessage {
  type: QueueMessageType;
  data: any;
  timestamp: string;
  correlationId: string;
  retryCount?: number;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Queue client for sending messages
 */
export class QueueClient {
  private connectionString: string;
  private queueName: string;

  constructor(connectionString: string, queueName: string = 'task-queue') {
    this.connectionString = connectionString;
    this.queueName = queueName;
  }

  /**
   * Send a message to the queue
   */
  async sendMessage(
    type: QueueMessageType,
    data: any,
    options?: {
      correlationId?: string;
      priority?: 'low' | 'normal' | 'high';
      delaySeconds?: number;
    }
  ): Promise<void> {
    const message: BaseQueueMessage = {
      type,
      data,
      timestamp: new Date().toISOString(),
      correlationId: options?.correlationId || this.generateCorrelationId(),
      retryCount: 0,
      priority: options?.priority || 'normal'
    };

    // In a real implementation, this would use Azure Storage Queue SDK
    console.log('📨 Sending queue message:', {
      queueName: this.queueName,
      messageType: type,
      correlationId: message.correlationId
    });

    // Simulate queue send
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(paymentData: any, correlationId?: string): Promise<void> {
    await this.sendMessage('payment_notification', paymentData, {
      correlationId,
      priority: 'high'
    });
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(emailData: any, correlationId?: string): Promise<void> {
    await this.sendMessage('email_notification', emailData, {
      correlationId,
      priority: 'normal'
    });
  }

  /**
   * Send cleanup task
   */
  async sendCleanupTask(cleanupData: any, correlationId?: string): Promise<void> {
    await this.sendMessage('cleanup_task', cleanupData, {
      correlationId,
      priority: 'low'
    });
  }

  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Create queue client instance
 */
export function createQueueClient(queueName?: string): QueueClient {
  const connectionString = process.env.AzureWebJobsStorage || process.env.AZURE_STORAGE_CONNECTION_STRING;
  
  if (!connectionString) {
    throw new Error('Azure Storage connection string not configured');
  }

  return new QueueClient(connectionString, queueName);
}
