import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BlogsService } from '../services/blogs.service';
import { Blog } from '../entities/blog.entity';

@ApiTags('Public Blogs')
@Controller('public-blogs')
export class PublicBlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active blogs for public display' })
  @ApiResponse({ status: 200, type: [Blog] })
  findAllActive(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<Blog[]> {
    return this.blogsService.findAllActive(
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
    );
  }

  @Get('detail/:title')
  @ApiOperation({ summary: 'Get a specific active blog by its title (slug)' })
  @ApiResponse({ status: 200, type: Blog })
  findByTitle(@Param('title') title: string): Promise<Blog> {
    return this.blogsService.findByTitle(title);
  }
}
