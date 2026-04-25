const fs = require('fs');

const html = fs.readFileSync('spline_html.txt', 'utf-8');
const match = html.match(/app\.start\(\[([\s\S]+?)\]\)/);

if (match && match[1]) {
  const arrayString = match[1];
  const numbers = arrayString.split(',').map(n => parseInt(n.trim(), 10));
  const buffer = Buffer.from(numbers);
  
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }
  
  fs.writeFileSync('public/scene.splinecode', buffer);
  console.log('Successfully saved ' + buffer.length + ' bytes to public/scene.splinecode');
} else {
  console.log('Failed to find app.start array in HTML');
}
