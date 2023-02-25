# 简介

批量处理文件名的小应用。可以替换字符，追加字符在文件名前或后，文件名按照序号格式重新命名

# api 设计

- rename <canmander> <url> [options]
- rename -h | --help | -v | --version

参数解释：

-h, --help 查看帮助信息
-v, --version 查看版本信息

canmander: 子命令

- replace 字符串替换
- append 追加命名
- number 使用序号重新格式化命名
- help 查看帮助信息

url: 修改文件名的文件夹路径

options: 子命令可选操作符，根据不同的子命令可以有不同的选项

## canmander 子命令

### replace

进行字符串替换

rename replace <url> --old <string> --new [string]

-o , --old 老的字符串

-n , --new 新的字符串,不填替换为空
