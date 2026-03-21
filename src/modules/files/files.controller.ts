import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
  ParseUUIDPipe,
  StreamableFile,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

interface RequestWithUser extends Request {
  user: { id: string };
}

@ApiTags('files')
@Controller('files')
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(
    @Req() req: RequestWithUser,
    @UploadedFile() file: MulterFile,
  ): Promise<FileEntity> {
    return this.filesService.saveFile(file, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID (owner only)' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async getFile(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { stream, file } = await this.filesService.getReadStreamForUser(
      id,
      req.user.id,
    );

    res.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
    });

    return new StreamableFile(stream);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete file by ID (owner only)' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async deleteFile(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.filesService.removeForUser(id, req.user.id);
  }
}
