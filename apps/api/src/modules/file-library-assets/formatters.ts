import type { FileLibraryAsset } from '@onlyjs/db/client';
import { BaseFormatter } from '../../utils';
import { fileLibraryAssetResponseDto } from './dtos';
import type { FileLibraryAssetShowResponse } from './types';

export abstract class FileLibraryAssetFormatter {
  static response(data: FileLibraryAsset) {
    const convertedData = BaseFormatter.convertData<FileLibraryAssetShowResponse>(
      { ...data, size: data.size.toString() },
      fileLibraryAssetResponseDto,
    );
    return convertedData;
  }
}
