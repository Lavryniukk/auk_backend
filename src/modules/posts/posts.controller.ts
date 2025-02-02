import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JWTPayload, UserPayload } from 'src/shared/user-payload.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { PinPostBodyDto } from './dto/pin-post.dto';
import { SavePostBodyDto } from './dto/save-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard)
  @Post()
  createBlankPost(@UserPayload() payload: JWTPayload) {
    return this.postsService.save({
      id: undefined,
      heading: 'Heading',
      content: 'Post content...',
      subheading: 'Subheading',
      relatedPrograms: [],
      tags: [],
      authorId: +payload.sub,
    });
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  save(
    @Body() dto: SavePostBodyDto,
    @UserPayload() payload: JWTPayload,
    @Param('id') id: string,
  ) {
    return this.postsService.save({
      ...dto,
      id: +id,
      authorId: +payload.sub,
    });
  }

  @Get('my')
  @UseGuards(AuthGuard)
  myPosts(@UserPayload() payload: JWTPayload) {
    return this.postsService.postsByUserId(+payload.sub, false);
  }

  @UseGuards(AuthGuard)
  @Get('author/:id')
  postsByUserId(@UserPayload() payload: JWTPayload, @Param('id') id: string) {
    return this.postsService.postsByUserId(+id, true);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @UserPayload() { sub: userId }: JWTPayload) {
    return this.postsService.findOne(+userId, +id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@UserPayload() payload: JWTPayload, @Param('id') id: string) {
    return this.postsService.remove(+payload.sub, +id);
  }

  @UseGuards(AuthGuard)
  @Patch('publish/:id')
  publish(@Param('id') id: string, @UserPayload() { sub: userId }: JWTPayload) {
    return this.postsService.publish(+userId, +id);
  }

  @UseGuards(AuthGuard)
  @Patch('pin/:id')
  pin(
    @Body() dto: PinPostBodyDto,
    @Param('id') id: string,
    @UserPayload() { sub: userId }: JWTPayload,
  ) {
    return this.postsService.pinPost({ ...dto, postId: +id, userId: +userId });
  }

  @UseGuards(AuthGuard)
  @Patch('unpin/:id')
  unpin(@Param('id') id: string, @UserPayload() { sub: userId }: JWTPayload) {
    return this.postsService.unpinPost(+userId, +id);
  }
}
