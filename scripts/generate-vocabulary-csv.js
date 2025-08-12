#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Dummy vocabulary data for English learning
const vocabularyQuestions = [
  {
    question: "What is the meaning of 'abundant'?",
    options: ["Scarce", "Plentiful", "Empty", "Missing"],
    correctAnswer: "Plentiful",
    explanation: "Abundant means existing in large quantities; plentiful."
  },
  {
    question: "Choose the synonym of 'diminish':",
    options: ["Increase", "Reduce", "Maintain", "Expand"],
    correctAnswer: "Reduce",
    explanation: "Diminish means to make or become less; reduce in size or importance."
  },
  {
    question: "What does 'eloquent' mean?",
    options: ["Silent", "Fluent and persuasive", "Confused", "Angry"],
    correctAnswer: "Fluent and persuasive",
    explanation: "Eloquent describes fluent or persuasive speaking or writing."
  },
  {
    question: "Select the antonym of 'generous':",
    options: ["Kind", "Stingy", "Helpful", "Caring"],
    correctAnswer: "Stingy",
    explanation: "Generous means giving freely; stingy means unwilling to give or spend."
  },
  {
    question: "What is the meaning of 'inevitable'?",
    options: ["Avoidable", "Uncertain", "Certain to happen", "Unlikely"],
    correctAnswer: "Certain to happen",
    explanation: "Inevitable means certain to happen; unavoidable."
  },
  {
    question: "Choose the correct spelling:",
    options: ["Occassion", "Occasion", "Ocasion", "Occation"],
    correctAnswer: "Occasion",
    explanation: "The correct spelling is 'occasion' - a particular event or ceremony."
  },
  {
    question: "What does 'meticulous' mean?",
    options: ["Careless", "Very careful about details", "Quick", "Lazy"],
    correctAnswer: "Very careful about details",
    explanation: "Meticulous means showing great attention to detail; very careful and precise."
  },
  {
    question: "Select the synonym of 'obsolete':",
    options: ["Modern", "Outdated", "New", "Current"],
    correctAnswer: "Outdated",
    explanation: "Obsolete means no longer in use; outdated or superseded."
  },
  {
    question: "What is the antonym of 'optimistic'?",
    options: ["Hopeful", "Positive", "Pessimistic", "Cheerful"],
    correctAnswer: "Pessimistic",
    explanation: "Optimistic means hopeful; pessimistic means expecting the worst."
  },
  {
    question: "What does 'profound' mean?",
    options: ["Shallow", "Deep and meaningful", "Simple", "Surface-level"],
    correctAnswer: "Deep and meaningful",
    explanation: "Profound means having deep insight or great depth of knowledge."
  },
  {
    question: "Choose the synonym of 'reluctant':",
    options: ["Eager", "Unwilling", "Ready", "Excited"],
    correctAnswer: "Unwilling",
    explanation: "Reluctant means unwilling or hesitant to do something."
  },
  {
    question: "What is the meaning of 'spontaneous'?",
    options: ["Planned", "Unplanned and natural", "Forced", "Delayed"],
    correctAnswer: "Unplanned and natural",
    explanation: "Spontaneous means performed without being planned or rehearsed."
  },
  {
    question: "Select the antonym of 'tranquil':",
    options: ["Peaceful", "Calm", "Chaotic", "Quiet"],
    correctAnswer: "Chaotic",
    explanation: "Tranquil means peaceful and calm; chaotic means in complete disorder."
  },
  {
    question: "What does 'ubiquitous' mean?",
    options: ["Rare", "Present everywhere", "Hidden", "Absent"],
    correctAnswer: "Present everywhere",
    explanation: "Ubiquitous means present, appearing, or found everywhere."
  },
  {
    question: "Choose the correct spelling:",
    options: ["Embarass", "Embarrass", "Embaras", "Embarrase"],
    correctAnswer: "Embarrass",
    explanation: "The correct spelling is 'embarrass' - to cause someone to feel awkward."
  },
  {
    question: "What is the synonym of 'vivid'?",
    options: ["Dull", "Bright and clear", "Faded", "Blurry"],
    correctAnswer: "Bright and clear",
    explanation: "Vivid means producing powerful feelings or strong, clear images in the mind."
  },
  {
    question: "What does 'zealous' mean?",
    options: ["Lazy", "Very enthusiastic", "Bored", "Indifferent"],
    correctAnswer: "Very enthusiastic",
    explanation: "Zealous means having great energy or enthusiasm for a cause or objective."
  },
  {
    question: "Select the antonym of 'verbose':",
    options: ["Wordy", "Talkative", "Concise", "Lengthy"],
    correctAnswer: "Concise",
    explanation: "Verbose means using more words than needed; concise means brief and clear."
  },
  {
    question: "What is the meaning of 'whimsical'?",
    options: ["Serious", "Playfully quaint", "Angry", "Boring"],
    correctAnswer: "Playfully quaint",
    explanation: "Whimsical means playfully quaint or fanciful, especially in an appealing way."
  },
  {
    question: "Choose the synonym of 'arduous':",
    options: ["Easy", "Difficult", "Simple", "Effortless"],
    correctAnswer: "Difficult",
    explanation: "Arduous means involving hard work; difficult and tiring."
  },
  {
    question: "What does 'benevolent' mean?",
    options: ["Mean", "Kind and generous", "Selfish", "Cruel"],
    correctAnswer: "Kind and generous",
    explanation: "Benevolent means well-meaning and kindly; generous in spirit."
  },
  {
    question: "Select the antonym of 'candid':",
    options: ["Honest", "Frank", "Deceptive", "Open"],
    correctAnswer: "Deceptive",
    explanation: "Candid means truthful and straightforward; deceptive means misleading."
  },
  {
    question: "What is the meaning of 'diligent'?",
    options: ["Lazy", "Hardworking", "Careless", "Slow"],
    correctAnswer: "Hardworking",
    explanation: "Diligent means having or showing care and conscientiousness in work."
  },
  {
    question: "Choose the correct spelling:",
    options: ["Definately", "Definitly", "Definitely", "Definatley"],
    correctAnswer: "Definitely",
    explanation: "The correct spelling is 'definitely' - without doubt; certainly."
  },
  {
    question: "What does 'ephemeral' mean?",
    options: ["Permanent", "Lasting briefly", "Eternal", "Stable"],
    correctAnswer: "Lasting briefly",
    explanation: "Ephemeral means lasting for a very short time; transitory."
  },
  {
    question: "Select the synonym of 'frugal':",
    options: ["Wasteful", "Economical", "Expensive", "Lavish"],
    correctAnswer: "Economical",
    explanation: "Frugal means economical in use or expenditure; not wasteful."
  },
  {
    question: "What is the antonym of 'gregarious'?",
    options: ["Social", "Outgoing", "Solitary", "Friendly"],
    correctAnswer: "Solitary",
    explanation: "Gregarious means sociable; solitary means done or existing alone."
  },
  {
    question: "What does 'hackneyed' mean?",
    options: ["Original", "Overused and unoriginal", "Creative", "Fresh"],
    correctAnswer: "Overused and unoriginal",
    explanation: "Hackneyed means lacking originality or freshness; overused."
  },
  {
    question: "Choose the synonym of 'immaculate':",
    options: ["Dirty", "Perfect", "Messy", "Stained"],
    correctAnswer: "Perfect",
    explanation: "Immaculate means perfectly clean, neat, or tidy; without fault."
  },
  {
    question: "What is the meaning of 'jubilant'?",
    options: ["Sad", "Very happy", "Angry", "Worried"],
    correctAnswer: "Very happy",
    explanation: "Jubilant means feeling or expressing great happiness and triumph."
  }
];

function generateCSV(format = 'simple') {
  let csvContent = '';
  
  if (format === 'simple') {
    // Format 1: question,option1,option2,option3,option4,correctAnswer,explanation
    csvContent = 'question,option1,option2,option3,option4,correctAnswer,explanation\n';
    
    vocabularyQuestions.forEach(q => {
      const escapedQuestion = `"${q.question.replace(/"/g, '""')}"`;
      const escapedOptions = q.options.map(opt => `"${opt.replace(/"/g, '""')}"`);
      const escapedCorrectAnswer = `"${q.correctAnswer.replace(/"/g, '""')}"`;
      const escapedExplanation = `"${q.explanation.replace(/"/g, '""')}"`;
      
      csvContent += `${escapedQuestion},${escapedOptions.join(',')},${escapedCorrectAnswer},${escapedExplanation}\n`;
    });
  } else {
    // Format 2: text,options,correctOption,explanation
    csvContent = 'text,options,correctOption,explanation\n';
    
    vocabularyQuestions.forEach(q => {
      const escapedQuestion = `"${q.question.replace(/"/g, '""')}"`;
      const escapedOptions = `"${q.options.join(';')}"`;
      const escapedCorrectAnswer = `"${q.correctAnswer.replace(/"/g, '""')}"`;
      const escapedExplanation = `"${q.explanation.replace(/"/g, '""')}"`;
      
      csvContent += `${escapedQuestion},${escapedOptions},${escapedCorrectAnswer},${escapedExplanation}\n`;
    });
  }
  
  return csvContent;
}

function createCSVFiles() {
  const outputDir = path.join(__dirname, '..', 'generated');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate both formats
  const simpleCSV = generateCSV('simple');
  const advancedCSV = generateCSV('advanced');
  
  // Write files
  const simpleFilePath = path.join(outputDir, 'vocabulary-quiz-simple.csv');
  const advancedFilePath = path.join(outputDir, 'vocabulary-quiz-advanced.csv');
  
  fs.writeFileSync(simpleFilePath, simpleCSV, 'utf8');
  fs.writeFileSync(advancedFilePath, advancedCSV, 'utf8');
  
  console.log('✅ CSV files generated successfully!');
  console.log(`📁 Simple format: ${simpleFilePath}`);
  console.log(`📁 Advanced format: ${advancedFilePath}`);
  console.log(`📊 Generated ${vocabularyQuestions.length} vocabulary questions`);
  console.log('\nFile contents preview:');
  console.log('Simple format (first 3 lines):');
  console.log(simpleCSV.split('\n').slice(0, 3).join('\n'));
  console.log('\nAdvanced format (first 3 lines):');
  console.log(advancedCSV.split('\n').slice(0, 3).join('\n'));
}

// Run the script
if (require.main === module) {
  createCSVFiles();
}

module.exports = { generateCSV, vocabularyQuestions };