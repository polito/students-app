import { openDatabaseAsync } from 'expo-sqlite';

export interface FileRecord {
  id: string;
  ctx: string;
  ctxId: string;
  path: string;
  filename: string;
  mime: string;
  checksum?: string;
  sizeKb: number;
  downloadTime: string;
  updateTime?: string;
}

let dbQueue: Promise<any> = Promise.resolve();

function queueDb<T>(fn: () => Promise<T>): Promise<T> {
  return (dbQueue = dbQueue
    .then(async () => {
      const result = await fn();
      await new Promise(res => setTimeout(res, 0));
      return result;
    })
    .catch(async error => {
      await new Promise(res => setTimeout(res, 0));
      throw error;
    }));
}

class FileDatabase {
  private db: any;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    this.db = await openDatabaseAsync('files.db');
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS files (
        id VARCHAR(64) PRIMARY KEY NOT NULL,
        ctx VARCHAR(64) NOT NULL,
        ctxId VARCHAR(64) NOT NULL,
        path VARCHAR(2048) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        mime VARCHAR(64) NOT NULL,
        checksum VARCHAR(64),
        sizeKb INT NOT NULL,
        downloadTime DATETIME NOT NULL,
        updateTime DATETIME NULL
      );
    `);
  }

  private async ensureInitialized(): Promise<void> {
    await this.initPromise;
  }

  async insertFile(file: FileRecord): Promise<void> {
    await this.ensureInitialized();
    return queueDb(async () => {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO files 
         (id, ctx, ctxId, path, filename, mime, checksum, sizeKb, downloadTime, updateTime) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          file.id,
          file.ctx,
          file.ctxId,
          file.path,
          file.filename,
          file.mime,
          file.checksum || null,
          file.sizeKb,
          file.downloadTime,
          file.updateTime || null,
        ],
      );
    });
  }

  async updateFile(id: string, updates: Partial<FileRecord>): Promise<void> {
    await this.ensureInitialized();
    return queueDb(async () => {
      const entries = Object.entries(updates).filter(([key]) => key !== 'id');
      const fields = entries.map(([key]) => `${key} = ?`).join(', ');
      const values = entries.map(([, value]) => value);
      values.push(id);

      await this.db.runAsync(`UPDATE files SET ${fields} WHERE id = ?`, values);
    });
  }

  async getFilesByArea(area: string): Promise<FileRecord[]> {
    await this.ensureInitialized();
    return queueDb(async () => {
      const result = await this.db.getAllAsync(
        'SELECT * FROM files WHERE ctx || "-" || ctxId = ?',
        [area],
      );
      return result || [];
    });
  }

  async getFilesByContext(ctx: string, ctxId: string): Promise<FileRecord[]> {
    await this.ensureInitialized();
    return queueDb(async () => {
      const result = await this.db.getAllAsync(
        'SELECT * FROM files WHERE ctx = ? AND ctxId = ?',
        [ctx, ctxId],
      );
      return result || [];
    });
  }

  async getFileById(id: string): Promise<FileRecord | null> {
    await this.ensureInitialized();
    return queueDb(async () => {
      const result = await this.db.getFirstAsync(
        'SELECT * FROM files WHERE id = ?',
        [id],
      );
      return result || null;
    });
  }

  async getAllFiles(): Promise<FileRecord[]> {
    await this.ensureInitialized();
    return queueDb(async () => {
      const result = await this.db.getAllAsync('SELECT * FROM files');
      return result || [];
    });
  }

  async deleteFile(id: string): Promise<void> {
    await this.ensureInitialized();
    return queueDb(async () => {
      await this.db.runAsync('DELETE FROM files WHERE id = ?', [id]);
    });
  }

  async deleteFilesByArea(area: string): Promise<void> {
    await this.ensureInitialized();
    return queueDb(async () => {
      await this.db.runAsync(
        'DELETE FROM files WHERE ctx || "-" || ctxId = ?',
        [area],
      );
    });
  }

  async deleteFilesByContext(ctx: string, ctxId: string): Promise<void> {
    await this.ensureInitialized();
    return queueDb(async () => {
      await this.db.runAsync('DELETE FROM files WHERE ctx = ? AND ctxId = ?', [
        ctx,
        ctxId,
      ]);
    });
  }

  async deleteAllFiles(): Promise<void> {
    await this.ensureInitialized();
    return queueDb(async () => {
      await this.db.runAsync('DELETE FROM files');
    });
  }

  async getTotalSize(): Promise<number> {
    await this.ensureInitialized();
    return queueDb(async () => {
      const result = await this.db.getFirstAsync(
        'SELECT COALESCE(SUM(sizeKb), 0) as total FROM files',
      );
      return result?.total || 0;
    });
  }

  async getTotalSizeByArea(area: string): Promise<number> {
    await this.ensureInitialized();
    return queueDb(async () => {
      const result = await this.db.getFirstAsync(
        'SELECT COALESCE(SUM(sizeKb), 0) as total FROM files WHERE ctx || "-" || ctxId = ?',
        [area],
      );
      return result?.total || 0;
    });
  }

  async getTotalSizeByContext(ctx: string, ctxId: string): Promise<number> {
    await this.ensureInitialized();
    return queueDb(async () => {
      const result = await this.db.getFirstAsync(
        'SELECT COALESCE(SUM(sizeKb), 0) as total FROM files WHERE ctx = ? AND ctxId = ?',
        [ctx, ctxId],
      );
      return result?.total || 0;
    });
  }
}

let fileDatabaseInstance: FileDatabase | null = null;

export const getFileDatabase = (): FileDatabase => {
  if (!fileDatabaseInstance) {
    fileDatabaseInstance = new FileDatabase();
  }
  return fileDatabaseInstance;
};
