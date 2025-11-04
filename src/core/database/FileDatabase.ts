import { openDatabaseSync } from 'expo-sqlite';

export interface FileRecord {
  id: string;
  area: string;
  path: string;
  filename: string;
  mime: string;
  checksum?: string;
  sizeKb: number;
  downloadTime: string;
  updateTime?: string;
}

class FileDatabase {
  private db: any;

  constructor() {
    this.db = openDatabaseSync('files.db');
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS files (
        id VARCHAR(64) PRIMARY KEY NOT NULL,
        area VARCHAR(64) NOT NULL,
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

  async insertFile(file: FileRecord): Promise<void> {
    this.db.runSync(
      `INSERT OR REPLACE INTO files 
       (id, area, path, filename, mime, checksum, sizeKb, downloadTime, updateTime) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        file.id,
        file.area,
        file.path,
        file.filename,
        file.mime,
        file.checksum || null,
        file.sizeKb,
        file.downloadTime,
        file.updateTime || null,
      ],
    );
  }

  async updateFile(id: string, updates: Partial<FileRecord>): Promise<void> {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(updates).filter(
      (_, index) => Object.keys(updates)[index] !== 'id',
    );
    values.push(id);

    this.db.runSync(`UPDATE files SET ${fields} WHERE id = ?`, values);
  }

  async getFilesByArea(area: string): Promise<FileRecord[]> {
    const result = this.db.getAllSync('SELECT * FROM files WHERE area = ?', [
      area,
    ]);
    return result || [];
  }

  async getFileById(id: string): Promise<FileRecord | null> {
    const result = this.db.getFirstSync('SELECT * FROM files WHERE id = ?', [
      id,
    ]);
    return result || null;
  }

  async getAllFiles(): Promise<FileRecord[]> {
    const result = this.db.getAllSync('SELECT * FROM files');
    return result || [];
  }

  async deleteFile(id: string): Promise<void> {
    this.db.runSync('DELETE FROM files WHERE id = ?', [id]);
  }

  async deleteFilesByArea(area: string): Promise<void> {
    this.db.runSync('DELETE FROM files WHERE area = ?', [area]);
  }

  async deleteAllFiles(): Promise<void> {
    this.db.runSync('DELETE FROM files');
  }

  async getTotalSize(): Promise<number> {
    const result = this.db.getFirstSync(
      'SELECT COALESCE(SUM(sizeKb), 0) as total FROM files',
    );
    return result?.total || 0;
  }

  async getTotalSizeByArea(area: string): Promise<number> {
    const result = this.db.getFirstSync(
      'SELECT COALESCE(SUM(sizeKb), 0) as total FROM files WHERE area = ?',
      [area],
    );
    return result?.total || 0;
  }
}

let fileDatabaseInstance: FileDatabase | null = null;

export const getFileDatabase = (): FileDatabase => {
  if (!fileDatabaseInstance) {
    fileDatabaseInstance = new FileDatabase();
  }
  return fileDatabaseInstance;
};
