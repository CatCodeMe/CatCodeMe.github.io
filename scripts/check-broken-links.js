import fs from 'fs'
import path from 'path'
import {load} from 'cheerio'
import {fileURLToPath} from 'url'

// ES modules 中获取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 全局计数器和收集器
let totalBrokenLinks = 0
const allBrokenLinks = []

// 检查文件是否存在
function checkFileExists(filePath) {
    try {
        // 先检查原始路径
        if (fs.existsSync(filePath)) return true
        // 如果带 .html 后缀的不存在，检查不带后缀的路径
        const pathWithoutExt = filePath.replace(/\.html$/, '')
        return fs.existsSync(pathWithoutExt)
    } catch (err) {
        return false
    }
}

// 处理HTML文件
function processHtmlFile(filePath) {
    const html = fs.readFileSync(filePath, 'utf-8')
    const $ = load(html, {
        xml: {
            xmlMode: false
        },
        decodeEntities: false
    })
    let modified = false
    let brokenLinks = []

    $('a.internal:not(.tag-link)').each((_, element) => {
        const href = $(element).attr('href')
        if (!href || href.startsWith('#')) return

        // 获取 data-slug 属性，这是相对于 public 的标准路径
        const slug = $(element).attr('data-slug')
        
        // 处理以 / 开头的路径
        let normalizedPath
        if (slug) {
            // 如果有 data-slug，直接使用它
            normalizedPath = path.join(
                path.resolve(__dirname, '../public'),
                slug + '.html'
            )
        } else {
            // 处理各种相对路径的情况
            const currentDir = path.dirname(filePath)
            let targetPath
            
            if (href.startsWith('/')) {
                // 绝对路径（相对于 public）
                targetPath = href === '/' ? 'index.html' : href.slice(1)
            } else if (href.startsWith('..')) {
                // 相对路径（../）
                targetPath = path.normalize(path.join(
                    path.relative(path.resolve(__dirname, '../public'), currentDir),
                    href
                ))
            } else {
                // 其他相对路径
                targetPath = path.normalize(path.join(
                    path.relative(path.resolve(__dirname, '../public'), currentDir),
                    href
                ))
            }
            
            normalizedPath = path.join(
                path.resolve(__dirname, '../public'),
                targetPath.replace(/\/?$/, '.html')
            )
        }

        if (!checkFileExists(normalizedPath)) {
            // 保持原有属性
            const existingClass = $(element).attr('class') || ''
            const existingAttrs = element.attribs || {}
            
            // 添加 broken-link class
            $(element).attr('class', `${existingClass} broken-link`.trim())
            
            // 确保其他必要的属性保持不变
            Object.keys(existingAttrs).forEach(attr => {
                if (attr !== 'class') {
                    $(element).attr(attr, existingAttrs[attr])
                }
            })
            
            brokenLinks.push({
                file: filePath,
                link: href,
                text: $(element).text(),
                expectedPath: normalizedPath
            })
            modified = true
            totalBrokenLinks++
        }
    })

    if (modified) {
        fs.writeFileSync(filePath, $.html({
            decodeEntities: false,
            xmlMode: false
        }))
        allBrokenLinks.push(...brokenLinks)
    }
}

// 递归处理目录
function processDirectory(directory) {
    const files = fs.readdirSync(directory)
    
    files.forEach(file => {
        const fullPath = path.join(directory, file)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
            processDirectory(fullPath)
        } else if (file.endsWith('.html')) {
            processHtmlFile(fullPath)
        }
    })
}

// 开始处理
console.log('检查损坏的内部链接...')
processDirectory(path.resolve(__dirname, '../public'))

if (totalBrokenLinks > 0) {
    console.log(`\n发现 ${totalBrokenLinks} 个损坏的链接：\n`)
    // 按文件分组显示损坏的链接
    const groupedLinks = allBrokenLinks.reduce((acc, link) => {
        if (!acc[link.file]) {
            acc[link.file] = []
        }
        acc[link.file].push(link)
        return acc
    }, {})
    
    Object.entries(groupedLinks).forEach(([file, links]) => {
        console.log(`文件: ${file}`)
        links.forEach(link => {
            console.log(`  - "${link.text}"`)
            console.log(`    链接: ${link.link}`)
            console.log(`    期望: ${link.expectedPath}\n`)
        })
    })
} else {
    console.log('\n未发现损坏的链接')
} 