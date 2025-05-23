import prisma from "../db/db.config.js";

import { fileQueue } from "../jobs/fileQueue.js"; // adjust path if needed


 



export class uploadController {
  static async uploadFile(req, res) {
    try {
      const file = req.file;
      const { title, description } = req.body;
      const userId = req.user?.id;
      console.log(userId, title);

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const newFile = await prisma.files.create({
        data: {
          userId: userId,
          originalFilename: file.originalname,
          storagePath: file.path,
          title: title || null,
          description: description || null,
        },
      });

      
      await fileQueue.add("process-file", {
        fileId: newFile.id,
        storagePath: file.path,
      });

      return res.status(201).json({
        fileId: newFile.id,
        status: "uploaded",
      });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ message: "Upload failed, try again later" });
    }
  }

    static async index(req, res) {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = 10;

        try {
            const skip = (page - 1) * pageSize;

            const [files, totalFiles] = await Promise.all([
                prisma.files.findMany({
                    where: { userId: userId },
                    skip,
                    take: pageSize,
                    orderBy: { uploadedAt: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        originalFilename: true,
                        uploadedAt: true,
                        status: true,
                        description: true,
                    },
                }),
                prisma.files.count({ where: { userId: userId } }),
            ]);

            const totalPages = Math.ceil(totalFiles / pageSize);

            return res.status(200).json({
                page,
                pageSize,
                totalFiles,
                totalPages,
                files,
            });
        } catch (error) {
            console.error('Error fetching user files:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    static async getFileById(req, res) {
        const fileId = parseInt(req.params.id);
        const userId = req.user.id;

        try {
            const file = await prisma.files.findUnique({
                where: { id: fileId },

            });

            if (!file) {
                return res.status(404).json({ message: 'File not found' });
            }

            if (file.userId !== userId) {
                return res.status(403).json({ message: 'Access denied' });
            }

            return res.json({
                metadata: {
                    id: file.id,
                    original_filename: file.originalFilename,
                    title: file.title,
                    description: file.description,
                    uploaded_at: file.createdAt,
                    size: file.size || null,
                },
                status: file.status || 'unknown',
                extracted_data: file.extractedData || null,
            });
        } catch (err) {
            console.error('Get file error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
}
