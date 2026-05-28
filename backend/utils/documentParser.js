const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

/**
 * Extract text from different document formats
 */
async function extractTextFromDocument(filePath, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      return await extractFromPDF(filePath);
    } else if (mimeType === 'text/plain') {
      return extractFromText(filePath);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For .docx, we'll extract text from the XML
      return await extractFromDocx(filePath);
    } else {
      throw new Error('Unsupported file type: ' + mimeType);
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
}

async function extractFromPDF(filePath) {
  return new Promise((resolve, reject) => {
    const dataBuffer = fs.readFileSync(filePath);
    pdfParse(dataBuffer)
      .then((data) => {
        resolve(data.text);
      })
      .catch((error) => {
        reject(new Error('Failed to parse PDF: ' + error.message));
      });
  });
}

function extractFromText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

async function extractFromDocx(filePath) {
  // Simple extraction from DOCX ZIP file using adm-zip
  const AdmZip = require('adm-zip');
  
  try {
    const zip = new AdmZip(filePath);
    const docXml = zip.readAsText('word/document.xml');
    
    let text = '';
    // Extract paragraphs <w:p>
    const paragraphMatches = docXml.match(/<w:p[^>]*>([\s\S]*?)<\/w:p>/g) || [];
    
    if (paragraphMatches.length > 0) {
      const paragraphsText = paragraphMatches.map(p => {
        // Find all <w:t> inside this paragraph
        const textMatches = p.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
        return textMatches
          .map(match => match.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, ''))
          .join(''); // Join runs in a paragraph WITHOUT newlines
      });
      text = paragraphsText.join('\n');
    }
    
    // Fallback to global <w:t> tags extraction if paragraph extraction failed or is empty
    if (!text.trim()) {
      const textMatches = docXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
      text = textMatches
        .map(match => match.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, ''))
        .join('\n');
    }
    
    return text;
  } catch (error) {
    throw new Error('Failed to parse DOCX: ' + error.message);
  }
}

/**
 * Parse questions from extracted text (numbered list format)
 * Format: 1. Question text here?
 *         A) Option A
 *         B) Option B
 *         C) Option C
 *         D) Option D
 *         Answer: A
 */
function parseQuestionsFromText(text) {
  const questions = [];
  if (!text) return questions;
  
  // Replace non-breaking spaces with standard spaces
  text = text.replace(/\u00a0/g, ' ');
  
  // Split the entire text into lines
  const rawLines = text.split(/\r?\n|\r/).map(line => line.trim()).filter(line => line);
  
  let currentQuestion = null;
  
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    
    // Check if the line is an Answer line (supporting Answer:, Correct:, Correct Answer:, etc.)
    if (/^(?:correct\s+answer|answer|correct|ans)\b/i.test(line)) {
      if (currentQuestion) {
        // Parse correct answer letters from the line
        const cleanLine = line.replace(/^(?:correct\s+answer|answer|correct|ans)\s*:?\s*/i, '').trim();
        const correctLetters = cleanLine
          .split(/[\s,]+/)
          .map(s => s.trim().toUpperCase())
          .filter(s => s.length === 1 && s >= 'A' && s <= 'Z');
        
        if (correctLetters.length > 0) {
          const validLetters = [];
          correctLetters.forEach(letter => {
            const optionIndex = letter.charCodeAt(0) - 65; // A=0, B=1, etc.
            if (optionIndex >= 0 && optionIndex < currentQuestion.options.length) {
              currentQuestion.options[optionIndex].is_correct = true;
              validLetters.push(letter);
            }
          });
          if (validLetters.length > 0) {
            currentQuestion.correct_answer = validLetters.join(', ');
          }
        }
        
        // Push the completed question
        if (currentQuestion.options.length >= 2) {
          questions.push(currentQuestion);
        }
        currentQuestion = null;
      }
      continue;
    }
    
    // Check if the line contains inline options (at least A and B on the same line)
    const hasInlineOptions = /([A-Z])[\)\.]/i.test(line) && 
                             ((line.includes('A)') && line.includes('B)')) || 
                              (line.includes('A.') && line.includes('B.')));
    
    if (hasInlineOptions) {
      // Inline question block!
      const optionSplitRegex = /\s*([A-Z])[\)\.]\s*/;
      const parts = line.split(optionSplitRegex);
      if (parts.length >= 3) {
        // First part is the question text
        let questionText = parts[0].trim();
        // Clean leading question numbers
        questionText = questionText.replace(/^(?:q|question)?\s*\d+[\.\)]\s*/i, '').trim();
        
        // Push previous question if complete
        if (currentQuestion && currentQuestion.options.length >= 2) {
          questions.push(currentQuestion);
        }

        currentQuestion = {
          question_text: questionText,
          question_type: 'multiple_choice',
          marks: 1,
          options: [],
          correct_answer: null
        };
        
        // Match letter-option text pairs
        for (let j = 1; j < parts.length; j += 2) {
          const letter = parts[j];
          const text = parts[j + 1];
          if (letter && text) {
            currentQuestion.options.push({
              text: text.trim(),
              is_correct: false
            });
          }
        }
      }
    } else {
      // Check if it's a standard option line (e.g. A) Option Text)
      const optionRegex = /^([A-Z])[\)\.]\s*(.+)$/;
      const optionMatch = line.match(optionRegex);
      
      if (optionMatch) {
        const [, letter, optionText] = optionMatch;
        if (currentQuestion) {
          currentQuestion.options.push({
            text: optionText.trim(),
            is_correct: false
          });
        }
      } else {
        // If it's not an option and not an answer, it must be the start of a new question text!
        // We push any previous question if complete
        if (currentQuestion && currentQuestion.options.length >= 2) {
          questions.push(currentQuestion);
        }
        
        // Clean leading question numbers
        let questionText = line.replace(/^(?:q|question)?\s*\d+[\.\)]\s*/i, '').trim();
        currentQuestion = {
          question_text: questionText,
          question_type: 'multiple_choice',
          marks: 1,
          options: [],
          correct_answer: null
        };
      }
    }
  }
  
  // Push last question if any
  if (currentQuestion && currentQuestion.options.length >= 2) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

module.exports = {
  extractTextFromDocument,
  parseQuestionsFromText
};
