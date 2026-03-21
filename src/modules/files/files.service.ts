import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FileEntity } from './entities/file.entity';
import { existsSync, mkdirSync, createReadStream, promises as fsPromises } from 'fs';
import type { ReadStream } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer: Buffer;
}

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const uploadDir = this.getUploadDir();
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
  }

  private getUploadDir(): string {
    const uploadDir =
      this.configService.get('files.uploadDestination') || './uploads';
    return path.join(process.cwd(), uploadDir);
  }

  private getAllowedMimeTypes(): string[] {
    const raw = this.configService.get<string>('files.allowedMimeTypes');
    if (!raw || raw.trim() === '') {
      return DEFAULT_ALLOWED_MIME_TYPES;
    }
    return raw
      .split(',')
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);
  }

  private assertMimeAllowed(mimetype: string): void {
    const allowed = this.getAllowedMimeTypes();
    if (!allowed.includes(mimetype.toLowerCase())) {
      throw new BadRequestException('File type not allowed');
    }
  }

  /** Ensures resolved path stays under the upload root (no path traversal). */
  private assertPathUnderUploadRoot(absolutePath: string): string {
    const root = path.resolve(this.getUploadDir());
    const target = path.resolve(absolutePath);
    const prefix = root + path.sep;
    if (target !== root && !target.startsWith(prefix)) {
      throw new ForbiddenException('Invalid file path');
    }
    return target;
  }

  async saveFile(file: MulterFile, userId: string): Promise<FileEntity> {
    this.assertMimeAllowed(file.mimetype);

    try {
      const uploadDir = this.getUploadDir();
      const fileId = uuidv4();
      const fileExt = path.extname(file.originalname);
      const fileName = `${fileId}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      const relativePath = path.join(path.basename(uploadDir), fileName);

      await fsPromises.writeFile(filePath, file.buffer);
      this.assertPathUnderUploadRoot(filePath);

      const fileEntity = await this.prisma.file.create({
        data: {
          filename: file.originalname,
          path: relativePath,
          mimetype: file.mimetype,
          size: file.size,
          userId,
        },
      });

      return new FileEntity(fileEntity);
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to save file');
    }
  }

  async findAll(): Promise<FileEntity[]> {
    const files = await this.prisma.file.findMany();
    return files.map((file) => new FileEntity(file));
  }

  async findOneForUser(id: string, userId: string): Promise<FileEntity> {
    const file = await this.prisma.file.findFirst({
      where: { id, userId },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return new FileEntity(file);
  }

  /** Resolved path + stream after ownership and path-safety checks. */
  async getReadStreamForUser(
    id: string,
    userId: string,
  ): Promise<{ stream: ReadStream; file: FileEntity }> {
    const file = await this.findOneForUser(id, userId);
    const absolutePath = path.join(process.cwd(), file.path);
    this.assertPathUnderUploadRoot(absolutePath);
    return {
      stream: createReadStream(absolutePath),
      file,
    };
  }

  async removeForUser(id: string, userId: string): Promise<void> {
    const file = await this.findOneForUser(id, userId);
    const absolutePath = path.join(process.cwd(), file.path);
    const safePath = this.assertPathUnderUploadRoot(absolutePath);

    if (existsSync(safePath)) {
      await fsPromises.unlink(safePath);
    }

    await this.prisma.file.delete({
      where: { id },
    });
  }
}
