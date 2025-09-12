import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';

export interface PdfGenerationOptions {
  title: string;
  content: string;
  userRequest?: string;
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

export interface PdfGenerationResult {
  success: boolean;
  filePath?: string;
  downloadUrl?: string;
  error?: string;
}

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'pdf');

  constructor(private readonly configService: ConfigService) {
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async generatePdf(options: PdfGenerationOptions, userContext: any): Promise<PdfGenerationResult> {
    let browser: puppeteer.Browser | null = null;
    
    try {
      this.logger.log(`Generating PDF: ${options.title}`);
      
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      const htmlContent = this.generateHtmlContent(options, userContext);
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const fileName = `${Date.now()}-${this.sanitizeFileName(options.title)}.pdf`;
      const filePath = path.join(this.uploadsDir, fileName);
      
      const pdfOptions: puppeteer.PDFOptions = {
        path: filePath,
        format: options.format || 'A4',
        landscape: options.orientation === 'landscape',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      };

      await page.pdf(pdfOptions);
      
      const baseUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
      const downloadUrl = `${baseUrl}/uploads/pdf/${fileName}`;
      
      this.logger.log(`PDF generated successfully: ${fileName}`);
      
      return {
        success: true,
        filePath,
        downloadUrl
      };
      
    } catch (error) {
      this.logger.error(`PDF generation failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private generateHtmlContent(options: PdfGenerationOptions, userContext: any): string {
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${options.title}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #fff;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #2563eb;
                padding: 20px;
                margin-bottom: 20px;
            }
            .header h1 {
                color: #2563eb;
                margin: 0;
                font-size: 28px;
            }
            .header .date {
                color: #6b7280;
                font-size: 14px;
                margin-top: 10px;
            }
            .content {
                margin-bottom: 30px;
                padding: 0 20px;
            }
            .content h1, .content h2, .content h3, .content h4, .content h5, .content h6 {
                color: #1f2937;
                margin-top: 25px;
                margin-bottom: 15px;
            }
            .content h1 {
                font-size: 24px;
                border-bottom: 2px solid #2563eb;
                padding-bottom: 10px;
            }
            .content h2 {
                font-size: 20px;
                border-left: 4px solid #2563eb;
                padding-left: 15px;
            }
            .content h3 {
                font-size: 18px;
                color: #374151;
            }
            .content p {
                margin-bottom: 15px;
                text-align: justify;
            }
            .content ul, .content ol {
                margin-bottom: 15px;
                padding-left: 25px;
            }
            .content li {
                margin-bottom: 5px;
            }
            .content table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .content th, .content td {
                border: 1px solid #e5e7eb;
                padding: 8px 12px;
                text-align: left;
            }
            .content th {
                background-color: #f9fafb;
                font-weight: 600;
            }
            .content .highlight {
                background-color: #fef3c7;
                padding: 2px 4px;
                border-radius: 3px;
            }
            .content .info-box {
                background-color: #f0f9ff;
                border: 1px solid #0ea5e9;
                border-radius: 6px;
                padding: 15px;
                margin: 15px 0;
            }
            .content .warning-box {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 15px;
                margin: 15px 0;
            }
            .content .error {
                color: #dc2626;
                background-color: #fee2e2;
                padding: 10px;
                border-radius: 4px;
                border: 1px solid #fca5a5;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
            }
            @media print {
                body { margin: 0; }
                .content { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${options.title}</h1>
            <div class="date">Généré le ${currentDate}</div>
        </div>
        
        <div class="content">
            ${options.content}
        </div>
        
        <div class="footer">
          <p>Document généré automatiquement par NexaFlow AI Assistant</p>
          <p>© 2025 NexaFlow. Tous droits réservés.</p>
        </div>
    </body>
    </html>
    `;
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}