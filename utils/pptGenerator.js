
import pptxgen from "pptxgenjs";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const generatePPT = async (slideData, fileName = "presentation.pptx") => {
  console.log('Starting PPT generation with data:', JSON.stringify(slideData, null, 2));
  
  if (!slideData) {
    const error = new Error('slideData is required');
    console.error('PPT Generation Error:', error.message);
    throw error;
  }

  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log(`Creating uploads directory: ${UPLOADS_DIR}`);
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  try {
    const pptx = new pptxgen();
    
   
    const titleSlide = pptx.addSlide();
    const titleText = slideData.title || 'AI Generated Presentation';
    
    console.log('Adding title slide with text:', titleText);
    
    titleSlide.addText(titleText, { 
      x: 1, 
      y: 1, 
      w: '90%',
      h: 2,
      fontSize: 36,
      bold: true,
      align: 'center',
      valign: 'middle'
    });

    
    if (slideData.slides && Array.isArray(slideData.slides)) {
      slideData.slides.forEach((slide) => {
        const s = pptx.addSlide();
       
        s.addText(slide.title || 'Slide', { 
          x: 0.5, 
          y: 0.5, 
          fontSize: 24, 
          bold: true 
        });
        
      
        if (slide.content && Array.isArray(slide.content)) {
          slide.content.forEach((line, i) => {
            if (line && line.trim() !== '') {
              s.addText(line, { 
                x: 0.8, 
                y: 1.2 + i * 0.6, 
                fontSize: 16,
                w: '90%',
                h: 0.5,
                bullet: true
              });
            }
          });
        }
      });
    } else {

      const s = pptx.addSlide();
      s.addText('AI Response', { x: 0.5, y: 0.5, fontSize: 24, bold: true });
      const content = typeof slideData === 'string' ? slideData : JSON.stringify(slideData, null, 2);
      s.addText(content, { x: 0.8, y: 1.2, fontSize: 12, w: '90%' });
    }

    const filePath = path.join(UPLOADS_DIR, fileName);
    
   
    const buffer = await pptx.write('nodebuffer');
    
 
    await fs.promises.writeFile(filePath, buffer);
    
    console.log(`PPT saved successfully at: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Error generating PPT:', error);
    throw new Error(`Failed to generate presentation: ${error.message}`);
  }
};
