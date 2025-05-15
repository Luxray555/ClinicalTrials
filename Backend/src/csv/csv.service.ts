import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import * as csvParser from 'csv-parser';
import { cleanString } from '@/lib/utils/common';

@Injectable()
export class CsvService {
    async parseCsv(buffer: Buffer): Promise<{ rows: any[]; columns: string[] }> {
        return new Promise((resolve, reject) => {
            const results: any[] = [];
            let columns: string[] = [];

            // Convert buffer to string & read first line to detect delimiter
            const csvString = buffer.toString();
            const firstLine = csvString.split('\n')[0];
            const detectedDelimiter = firstLine.includes(';') ? ';' : ','; // Auto-detect

            const stream = Readable.from(csvString);
            stream
                .pipe(csvParser({
                    separator: detectedDelimiter,
                    mapHeaders: ({ header }) => {
                        const cleanedHeader = cleanString(header);
                        columns.push(cleanedHeader); // Collect cleaned column names
                        return cleanedHeader;
                    },
                    skipLines: 0
                }))
                .on('data', (row) => {
                    const cleanedRow = Object.fromEntries(
                        Object.entries(row).map(([key, value]: any[]) => [key, cleanString(value)])
                    );
                    results.push(cleanedRow);
                })
                .on('end', () => resolve({ rows: results, columns: [...new Set(columns)] })) // Remove duplicates
                .on('error', (err) => reject(err));
        });
    }


    extractColumns(buffer: Buffer): string[] {
        const csvString = buffer.toString();
        const firstLine = csvString.split('\n')[0];
        const detectedDelimiter = firstLine.includes(';') ? ';' : ',';

        return firstLine.split(detectedDelimiter).map((col) =>
            col
                .trim()                      // Remove leading/trailing spaces
                .replace(/^["']|["']$/g, '') // Remove surrounding quotes (single or double)
            // .replace(/\s+/g, ' ')        // Normalize multiple spaces
            // .replace(/[^\w\sÀ-ÿ]/g, '')  // Remove special characters except letters, digits & spaces
            // .toLowerCase()               // Convert to lowercase for consistency
            // .replace(/\s+/g, '_')        // Replace spaces with underscores
        );
    }



}

