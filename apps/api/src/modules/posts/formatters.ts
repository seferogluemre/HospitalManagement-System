import type { Post } from '@onlyjs/db/client';
import { BaseFormatter } from '../../utils';
import { postResponseDto } from './dtos';
import type { PostShowResponse } from './types';

export abstract class PostFormatter {
  static response(data: Post & { author: { id: string; name: string } }) {
    const convertedData = BaseFormatter.convertData<PostShowResponse>(
      {
        ...data,
        author: {
          id: data.author.id,
          name: data.author.name,
        },
      },
      postResponseDto,
    );
    return convertedData;
  }
}
