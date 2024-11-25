import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {glob} from 'glob';

// ES modules 中获取 __dirname 的替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 生成时间戳
const timestamp = new Date().getTime();

// 需要重命名的文件配置
const filesToRename = [
  { 
    original: 'index.css',
    new: `index.${timestamp}.css`
  },
  {
    original: 'prescript.js',
    new: `prescript.${timestamp}.js`
  },
  {
    original: 'postscript.js',
    new: `postscript.${timestamp}.js`
  }
];

// 重命名文件并返回新旧文件名映射
function renameFiles(publicDir) {
  const mapping = {};
  
  console.log('\n=== 开始重命名文件 ===');
  console.log('public目录路径:', publicDir);
  
  filesToRename.forEach(file => {
    const oldPath = path.join(publicDir, file.original);
    const newPath = path.join(publicDir, file.new);
    
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      mapping[file.original] = file.new;
      console.log(`✅ 成功重命名: ${file.original} -> ${file.new}`);
    } else {
      console.log(`⚠️ 文件不存在: ${oldPath}`);
    }
  });
  
  return mapping;
}

// 更新HTML文件中的引用
async function updateHtmlFiles(publicDir, fileMapping) {
  const htmlFiles = await glob(path.join(publicDir, '**/*.html'));
  
  console.log('\n=== 开始更新HTML文件引用 ===');
  console.log('找到HTML文件数量:', htmlFiles.length);
  
  htmlFiles.forEach(htmlFile => {
    let content = fs.readFileSync(htmlFile, 'utf8');
    let fileUpdated = false;
    
    Object.entries(fileMapping).forEach(([oldFile, newFile]) => {
      // 更新 <link> 标签
      const oldContent = content;
      content = content.replace(
        new RegExp(`<link[^>]*href="[^"]*${oldFile}"[^>]*>`, 'g'),
        match => match.replace(oldFile, newFile)
      );
      
      // 更新 <script> 标签
      content = content.replace(
        new RegExp(`<script[^>]*src="[^"]*${oldFile}"[^>]*>`, 'g'),
        match => match.replace(oldFile, newFile)
      );
      
      if (oldContent !== content) {
        fileUpdated = true;
      }
    });
    
    if (fileUpdated) {
      fs.writeFileSync(htmlFile, content);
      console.log(`✅ 已更新文件: ${path.relative(publicDir, htmlFile)}`);
    } else {
      console.log(`ℹ️ 无需更新: ${path.relative(publicDir, htmlFile)}`);
    }
  });
}

// 主函数
async function main() {
  console.log('=== 资源文件重命名工具 ===');
  console.log('当前时间戳:', timestamp);
  
  const publicDir = path.join(process.cwd(), 'public');
  
  // 1. 重命名文件
  const fileMapping = renameFiles(publicDir);
  
  // 2. 更新HTML文件中的引用
  await updateHtmlFiles(publicDir, fileMapping);
  
  console.log('\n=== 处理完成 ===');
}

main().catch(console.error);