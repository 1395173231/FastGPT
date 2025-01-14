import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase } from '@/service/mongo';
import { authUser } from '@/service/utils/auth';
import { GridFSStorage } from '@/service/lib/gridfs';
import { OtherFileId } from '@/constants/kb';
import type { FileInfo } from '@/types/plugin';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();

    const { fileId } = req.query as { kbId: string; fileId: string };
    // 凭证校验
    const { userId } = await authUser({ req, authToken: true });

    if (fileId === OtherFileId) {
      return jsonRes<FileInfo>(res, {
        data: {
          id: OtherFileId,
          size: 0,
          filename: 'kb.Other Data',
          uploadDate: new Date(),
          encoding: '',
          contentType: ''
        }
      });
    }

    const gridFs = new GridFSStorage('dataset', userId);

    const file = await gridFs.findAndAuthFile(fileId);

    jsonRes<FileInfo>(res, {
      data: file
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
