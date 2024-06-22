const { v4: uuidv4 } = require("uuid");
exports.getMissingFields = (body, requiredFields) => {
  return requiredFields.filter((field) => !body[field]);
};
const slugify = (text) => {
  return text
    .toString()              
    .toLowerCase()           
    .trim()                  
    .replace(/\s+/g, '-')    
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-'); 
};

exports.createSlug = (name, length = 6) => {
  if (length < 4 || length > 6) {
    throw new Error('Length must be between 4 and 6');
  }
  
  const slug = slugify(name);
  const uuid = uuidv4();
  const uuidSuffix = uuid.slice(-length);
  
  return `${slug}-${uuidSuffix}`;
};