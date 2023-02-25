import { program } from "commander";
import packageJson from "./package.json";
import { readdir, stat, exists, rename } from "fs-extra";
import * as Path from "node:path";

interface ReplaceOptions {
  old: string;
  new: string;
}

interface AppendOptions {
  before?: string;
  after?: string;
}

program
  .name("rename")
  .description(packageJson.description)
  .version(packageJson.version);

program
  .command("replace")
  .description("进行字符串替换")
  .argument("<url>", "处理的文件路径")
  .option("-o, --old <char>", "老的字符串")
  .option("-n, --new [char]", "新的字符串", "")
  .action(async (url: string, options: ReplaceOptions) => {
    console.log(url, options);
    if (!(await exists(url))) {
      throw Error("路径不存在");
    }
    if (!(await stat(url)).isDirectory()) {
      throw Error("请输入一个文件夹路径");
    }
    if (!options.old) {
      throw Error("old 参数是必填项");
    }
    const paths = await readdir(url);
    paths.forEach(async (path) => {
      const oldPath = Path.join(url, path);
      const newPath = Path.join(url, path.replace(options.old, options.new));
      await rename(oldPath, newPath);
    });
  });

program
  .command("append")
  .description("进行文件名追加文本处理")
  .argument("<url>", "处理的文件路径")
  .option("-b, --before <string>", "在文件名之前处理")
  .option("-a, --after <string>", "在文件名之后处理")
  .action(async (url: string, options: AppendOptions) => {
    console.log(url, options);
    if (!(await exists(url))) {
      throw Error("路径不存在");
    }
    if (!(await stat(url)).isDirectory()) {
      throw Error("请输入一个文件夹路径");
    }
    if (!options.after && !options.before) {
      throw Error("必须提供 after 和 before 其中的一个");
    }
    if (options.after && options.before) {
      throw Error("只能提供 after 和 before 其中的一个");
    }
    const paths = await readdir(url);
    paths.forEach(async (path) => {
      const oldPath = Path.join(url, path);
      let newPath: string;
      if (options.after) {
        // Path.extname(oldPath)
        const obj = Path.parse(oldPath);
        newPath = Path.join(url, obj.name + options.after + obj.ext);
      } else {
        newPath = Path.join(url, options.before + path);
      }
      await rename(oldPath, newPath);
    });
  });

program
  .command("number")
  .description("对文件名重新进行序列化")
  .argument("<url>", "处理的文件路径")
  .action(async (url: string) => {
    if (!(await exists(url))) {
      throw Error("路径不存在");
    }
    if (!(await stat(url)).isDirectory()) {
      throw Error("请输入一个文件夹路径");
    }

    const paths = await readdir(url);
    paths.forEach(async (path, index) => {
      const oldPath = Path.join(url, path);
      const extname = Path.extname(path);
      await rename(oldPath, Path.join(url, index + extname));
    });
  });

program.parse();
