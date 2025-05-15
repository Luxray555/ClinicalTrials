import { GoogleGenAI } from '@google/genai';
import { Injectable, HttpException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: "AIzaSyChjB9rrBV-zQiUKy6C-XVCxH9RQZhsDQ4" });

    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: [
        'What is your favorite color?',
      ],
      config: {
        outputDimensionality: 712,

      },
    });
    console.log(JSON.stringify(response));
    // console.log(response.text);
    // console.log('await bcrypt.hash(createAdminDto.password, 10)', await bcrypt.hash("admin123", 10))
    // console.log('await bcrypt.hash(createAdminDto.password, 10)', await bcrypt.hash("ilyes123", 10))

    return 'Hello World!';
  }
}
