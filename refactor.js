const fs = require('fs');
const path = require('path');

const basePath = 'e:/Personal Projects/CampusConnect/src/app/(dashboard)/admin';
const pages = ['users', 'campuses', 'departments', 'classes', 'subjects', 'fees'];

function processPage(pageName) {
  const pagePath = path.join(basePath, pageName, 'page.tsx');
  if (!fs.existsSync(pagePath)) return;

  let content = fs.readFileSync(pagePath, 'utf8');

  // Find all DataTable usages
  // Some pages have multiple (fees has two)
  const dataTableRegex = /<DataTable[\s\S]*?emptyDescription="[^"]*"[\s\S]*?\/>/g;
  
  let match;
  let matches = [];
  while ((match = dataTableRegex.exec(content)) !== null) {
    matches.push(match);
  }

  if (matches.length === 0) return;

  let clientContent = `"use client"\n\nimport { DataTable } from "@/components/ui/data-table"\n\n`;
  let newPageContent = content;
  
  let importAdded = false;

  matches.forEach((m, index) => {
    const tableCode = m[0];
    
    // Extract `data={variable}`
    const dataMatch = tableCode.match(/data={([\w]+)(?:\.slice\([^)]+\))?}/);
    if (!dataMatch) return;
    
    const varName = dataMatch[1];
    let componentName = varName.charAt(0).toUpperCase() + varName.slice(1) + 'Table';
    if (pageName === 'fees' && index === 1) {
        componentName = 'InvoicesTable';
    }

    clientContent += `export function ${componentName}({ ${varName} }: { ${varName}: any[] }) {\n  return (\n    ${tableCode.replace(/\n/g, '\n    ')}\n  )\n}\n\n`;
    
    // Replace in page
    newPageContent = newPageContent.replace(tableCode, `<${componentName} ${varName}={${varName}} />`);
    
    if (!importAdded) {
      newPageContent = `import { ${componentName} } from "./client"\n` + newPageContent;
      importAdded = true;
    } else {
      // modify the existing import
      newPageContent = newPageContent.replace(/import \{ (.*?) \} from "\.\/client"/, `import { $1, ${componentName} } from "./client"`);
    }
  });
  
  // Remove DataTable import from page
  newPageContent = newPageContent.replace(/import \{ DataTable \} from "@\/components\/ui\/data-table"\n?/, '');

  fs.writeFileSync(path.join(basePath, pageName, 'client.tsx'), clientContent);
  fs.writeFileSync(pagePath, newPageContent);
  console.log(`Refactored ${pageName}`);
}

pages.forEach(processPage);
