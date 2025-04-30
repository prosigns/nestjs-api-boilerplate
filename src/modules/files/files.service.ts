import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FileEntity } from './entities/file.entity';
import { createWriteStream, unlink, existsSync, mkdirSync } from 'fs';
import { join, basename, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define a more specific File type
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
    // Ensure uploads directory exists
    const uploadDir = this.getUploadDir();
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
  }

  private getUploadDir(): string {
    const uploadDir = this.configService.get('files.uploadDestination') || './uploads';
    return join(process.cwd(), uploadDir);
  }

  async saveFile(file: MulterFile): Promise<FileEntity> {
    try {
      const uploadDir = this.getUploadDir();
      const fileId = uuidv4();
      const fileExt = extname(file.originalname);
      const fileName = `${fileId}${fileExt}`;
      const filePath = join(uploadDir, fileName);
      const relativePath = join(
        basename(uploadDir),
        fileName,
      );

      // Save the file
      const writeStream = createWriteStream(filePath);
      writeStream.write(file.buffer);
      writeStream.end();

      // Save file info in the database
      const fileEntity = await this.prisma.file.create({
        data: {
          filename: file.originalname,
          path: relativePath,
          mimetype: file.mimetype,
          size: file.size,
        },
      });

      return new FileEntity(fileEntity);
    } catch (error) {
      throw new InternalServerErrorException('Failed to save file');
    }
  }

  async findAll(): Promise<FileEntity[]> {
    const files = await this.prisma.file.findMany();
    return files.map(file => new FileEntity(file));
  }

  async findOne(id: string): Promise<FileEntity> {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return new FileEntity(file);
  }

  async remove(id: string): Promise<void> {
    // Find the file
    const file = await this.findOne(id);

    // Delete the physical file
    const filePath = join(process.cwd(), file.path);
    
    if (existsSync(filePath)) {
      await new Promise<void>((resolve, reject) => {
        unlink(filePath, (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    }

    // Delete from the database
    await this.prisma.file.delete({
      where: { id },
    });
  }
} 