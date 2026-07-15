const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/ActionCenter.tsx',
  'src/pages/DigitalTwin.tsx',
  'src/pages/ExecutiveBriefing.tsx',
  'src/pages/RiskRadar.tsx',
  'src/pages/UniversalModule.tsx',
  'src/pages/WhatIfSimulator.tsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  let content = fs.readFileSync(fullPath, 'utf-8');
  
  // ensure aiContext is imported
  if (content.includes('const { documents } = useBusinessData();')) {
    content = content.replace(
      'const { documents } = useBusinessData();', 
      'const { aiContext } = useBusinessData();'
    );
  } else if (content.includes('const { documents, ') && !content.includes('aiContext')) {
    // If it extracts other things too
    content = content.replace('const { documents, ', 'const { aiContext, ');
  }
  
  // Replace the hasData definition
  content = content.replace(/const hasData = documents\.length > 0;/g, 'const hasData = aiContext !== null;');
  
  fs.writeFileSync(fullPath, content);
});
console.log('Fixed hasData');
