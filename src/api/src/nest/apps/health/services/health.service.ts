/**
 * Health Service
 * 
 * RESPONSIBILITY: System health monitoring and checks
 * ARCHITECTURE: NestJS service with health status logic
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(private readonly configService: ConfigService) {}

  /**
   * Get overall health status
   */
  async getHealthStatus(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    version: string;
    environment: string;
  }> {
    const uptime = Date.now() - this.startTime;
    const environment = process.env.NODE_ENV || 'development';
    const version = process.env.npm_package_version || '1.0.0';

    // Perform basic health checks
    const isHealthy = await this.performHealthChecks();

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      version: version,
      environment: environment,
    };
  }

  /**
   * Get readiness status
   */
  async getReadinessStatus(): Promise<{
    ready: boolean;
    checks: Record<string, boolean>;
  }> {
    const checks = {
      configuration: this.checkConfiguration(),
      storage: await this.checkStorageConfiguration(),
      dependencies: this.checkDependencies(),
    };

    const ready = Object.values(checks).every(check => check === true);

    return {
      ready,
      checks,
    };
  }

  /**
   * Perform basic health checks
   */
  private async performHealthChecks(): Promise<boolean> {
    try {
      // Check if basic services are available
      const configCheck = this.checkConfiguration();
      const storageCheck = await this.checkStorageConfiguration();
      const dependencyCheck = this.checkDependencies();

      const allChecks = [configCheck, storageCheck, dependencyCheck];
      const isHealthy = allChecks.every(check => check === true);

      this.logger.log('🏥 Health checks completed', {
        configuration: configCheck,
        storage: storageCheck,
        dependencies: dependencyCheck,
        overall: isHealthy,
      });

      return isHealthy;
    } catch (error) {
      this.logger.error('❌ Health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return false;
    }
  }

  /**
   * Check configuration availability
   */
  private checkConfiguration(): boolean {
    try {
      const requiredConfig = [
        'storage.connectionString',
        'storage.accountName',
        'storage.accountKey',
      ];

      for (const configKey of requiredConfig) {
        const value = this.configService.get(configKey);
        if (!value) {
          this.logger.warn('⚠️ Missing configuration', { configKey });
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error('❌ Configuration check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return false;
    }
  }

  /**
   * Check storage configuration
   */
  private async checkStorageConfiguration(): Promise<boolean> {
    try {
      const connectionString = this.configService.get<string>('storage.connectionString');
      const accountName = this.configService.get<string>('storage.accountName');
      const accountKey = this.configService.get<string>('storage.accountKey');

      if (!connectionString || !accountName || !accountKey) {
        this.logger.warn('⚠️ Storage configuration incomplete');
        return false;
      }

      // Additional storage connectivity checks could be added here
      // For now, just verify configuration is present

      return true;
    } catch (error) {
      this.logger.error('❌ Storage configuration check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return false;
    }
  }

  /**
   * Check dependencies
   */
  private checkDependencies(): boolean {
    try {
      // Check if critical dependencies are available
      const dependencies = [
        '@azure/storage-blob',
        '@nestjs/common',
        '@nestjs/core',
      ];

      for (const dependency of dependencies) {
        try {
          require.resolve(dependency);
        } catch (error) {
          this.logger.warn('⚠️ Missing dependency', { dependency });
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error('❌ Dependency check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return false;
    }
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(): {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  } {
    return {
      uptime: Date.now() - this.startTime,
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    };
  }
}
