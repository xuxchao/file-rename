import { program } from "commander";
import inquirer from "inquirer";
import packageJson from "./package.json";
import { readdir, statSync, existsSync, rename } from "fs-extra";
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
  .version(packageJson.version)
  .option("-p, --prompt", "进行命令行交互操作")
  .action(async (options: { prompt: boolean }) => {
    if (options.prompt) {
      await allPrompt();
      return;
    }
  });

program
  .command("replace")
  .description("进行字符串替换")
  .argument("<url>", "处理的文件路径")
  .option("-o, --old <char>", "老的字符串")
  .option("-n, --new [char]", "新的字符串", "")
  .action(replaceHandler);

program
  .command("append")
  .description("进行文件名追加文本处理")
  .argument("<url>", "处理的文件路径")
  .option("-b, --before <string>", "在文件名之前追加的字符", "")
  .option("-a, --after <string>", "在文件名之后追加的字符", "")
  .action(appendHandler);

program
  .command("number")
  .description("对文件名重新进行序列化")
  .argument("<url>", "处理的文件路径")
  .action(numberHandler);

program.parse();

async function allPrompt() {
  const typeResult = await inquirer.prompt([
    {
      type: "list",
      name: "type",
      message: "请选择你需要处理的事情",
      choices: [
        {
          name: "进行字符串替换",
          value: "replace",
        },
        {
          name: "进行文件名追加文本处理",
          value: "append",
        },
        {
          name: "对文件名重新进行序列化",
          value: "number",
        },
      ],
    },
    {
      type: "input",
      name: "url",
      message: "请输入要处理的路径",
      async validate(url) {
        if (!url) {
          return "必填，请输入";
        }
        if (!existsSync(url)) {
          return "路径不存在";
        }
        if (!statSync(url).isDirectory()) {
          return "请输入一个文件夹路径";
        }
        return true;
      },
    },
  ]);
  if (typeResult.type === "replace") {
    const result = await inquirer.prompt([
      {
        type: "input",
        name: "old",
        message: "请输入需要替换的文本",
        validate(input, answers) {
          if (!input) {
            return "必填，请输入";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "new",
        message: "请输入替换后的文本",
        default: "",
      },
    ]);
    await replaceHandler(typeResult.url, result);
  }
  if (typeResult.type === "append") {
    const type = await inquirer.prompt([
      {
        type: "input",
        name: "after",
        message: "在文件名之后追加的字符",
        default: "",
      },
      {
        type: "input",
        name: "before",
        message: "在文件名之前追加的字符",
        default: "",
      },
    ]);
    await appendHandler(typeResult.url, type);
  }
  if (typeResult.type === "number") {
    await numberHandler(typeResult.url);
  }
}

async function replaceHandler(url: string, options: ReplaceOptions) {
  if (!existsSync(url)) {
    throw Error("路径不存在");
  }
  if (!statSync(url).isDirectory()) {
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
}

async function appendHandler(url: string, options: AppendOptions) {
  if (!existsSync(url)) {
    throw Error("路径不存在");
  }
  if (!statSync(url).isDirectory()) {
    throw Error("请输入一个文件夹路径");
  }
  const paths = await readdir(url);
  paths.forEach(async (path) => {
    const oldPath = Path.join(url, path);
    let newPath = path;
    if (options.after) {
      const obj = Path.parse(oldPath);
      newPath = obj.name + options.after + obj.ext;
    }
    if (options.before) {
      newPath = options.before + newPath;
    }
    newPath = Path.join(url, newPath);
    if (oldPath != newPath) {
      await rename(oldPath, newPath);
    }
  });
}

async function numberHandler(url: string) {
  if (!existsSync(url)) {
    throw Error("路径不存在");
  }
  if (!statSync(url).isDirectory()) {
    throw Error("请输入一个文件夹路径");
  }

  const paths = await readdir(url);
  paths.forEach(async (path, index) => {
    const oldPath = Path.join(url, path);
    const extname = Path.extname(path);
    await rename(oldPath, Path.join(url, index + extname));
  });
}
