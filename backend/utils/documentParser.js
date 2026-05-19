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
    
    // Simple regex-based text extraction from XML
    // Remove XML tags and extract text between <w:t> tags
    const textMatches = docXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    const text = textMatches
      .map(match => match.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, ''))
      .join('\n');
    
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
  
  // Split by numbered questions (1., 2., etc.)
  const questionBlocks = text.split(/\n\s*\d+\.\s+/).filter(block => block.trim());
  
  questionBlocks.forEach((block, index) => {
    const lines = block.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) return;
    
    const questionText = lines[0];
    const question = {
      question_text: questionText,
      question_type: 'multiple_choice',
      marks: 1,
      options: [],
      correct_answer: null
    };
    
    let currentCorrectLetter = null;
    
    // Extract options (A, B, C, D, etc.)
    const optionRegex = /^([A-Z])\)\s*(.+)$/;
    let correctAnswerLine = '';
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for answer line
      if (line.toLowerCase().startsWith('answer:') || line.toLowerCase().startsWith('correct:')) {
        correctAnswerLine = line;
        continue;
      }
      
      // Parse option
      const optionMatch = line.match(optionRegex);
      if (optionMatch) {
        const [, letter, optionText] = optionMatch;
        question.options.push({
          text: optionText.trim(),
          is_correct: false
        });
        
        // Update correct answer if we already found it
        if (currentCorrectLetter === letter) {
          question.options[question.options.length - 1].is_correct = true;
        }
      }
    }
    
    // Parse correct answer
    if (correctAnswerLine) {
      const answerMatch = correctAnswerLine.match(/(?:answer|correct)\s*:\s*([A-Z])/i);
      if (answerMatch) {
        const correctLetter = answerMatch[1];
        const optionIndex = correctLetter.charCodeAt(0) - 65; // A=0, B=1, etc.
        
        if (optionIndex >= 0 && optionIndex < question.options.length) {
          question.options[optionIndex].is_correct = true;
          question.correct_answer = correctLetter;
        }
      }
    }
    
    // Only add if we have the question text and at least 2 options
    if (question.options.length >= 2) {
      questions.push(question);
    }
  });
  
  return questions;
}

module.exports = {
  extractTextFromDocument,
  parseQuestionsFromText
};
