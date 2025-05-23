import { Queue, Worker } from "bullmq";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileTypeFromBuffer } from "file-type";
import mime from "mime-types";
import { redisConnection, defaultQueueConfig } from "../config/queue.js";
import prisma from "../db/db.config.js";

const queueName = "file-processing";

export const fileQueue = new Queue(queueName, {
    connection: redisConnection,
    defaultJobOptions: defaultQueueConfig,
});

export const fileWorker = new Worker(
    queueName,
    async (job) => {
        const { fileId, storagePath } = job.data;

        // Update file status to PROCESSING
        await prisma.files.update({
            where: { id: fileId },
            data: { status: "PROCESSING" },
        });

        try {
            // Read the file from disk
            const fileBuffer = await fs.readFile(path.resolve(storagePath));

            // Detect file type from buffer or fallback to mime lookup
            const typeInfo = await fileTypeFromBuffer(fileBuffer);
            const mimeType = typeInfo?.mime || mime.lookup(storagePath) || "unknown";

            let extractedData = `File type: ${mimeType}\n`;

            // Handle based on file type
            if (mimeType.startsWith("text")) {
                const previewText = fileBuffer.toString("utf-8", 0, 500); // First 500 chars
                extractedData += `Preview: ${previewText}`;
            } else if (mimeType.startsWith("image")) {
                extractedData += `This is an image. Size: ${fileBuffer.length} bytes.`;
            } else if (mimeType.startsWith("video")) {
                extractedData += "This is a video file. Basic processing done.";
            } else {
                // PDF and other types
                const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
                extractedData = `File type: ${mimeType}\nSHA-256 Hash: ${hash}`;
            }

            // Update file status and save extracted data
            await prisma.files.update({
                where: { id: fileId },
                data: {
                    status: "PROCESSED",
                    extractedData,
                },
            });
        } catch (error) {
            console.error("Error processing file:", error.message);

            // Mark file as FAILED and save error message
            await prisma.files.update({
                where: { id: fileId },
                data: {
                    status: "FAILED",
                    extractedData: `Error: ${error.message}`,
                },
            });
        }
    },
    { connection: redisConnection }
);
