const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

// Watermark
console.log(`
 ██████╗ ██████╗  ██████╗  █████╗ ███╗   ██╗██╗███████╗███████╗██████╗ 
██╔═══██╗██╔══██╗██╔════╝ ██╔══██╗████╗  ██║██║╚══███╔╝██╔════╝██╔══██╗
██║   ██║██████╔╝██║  ███╗███████║██╔██╗ ██║██║  ███╔╝ █████╗  ██████╔╝
██║   ██║██╔══██╗██║   ██║██╔══██║██║╚██╗██║██║ ███╔╝  ██╔══╝  ██╔══██╗
╚██████╔╝██║  ██║╚██████╔╝██║  ██║██║ ╚████║██║███████╗███████╗██║  ██║
 ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚══════╝╚══════╝╚═╝  ╚═
By - @8619
`);

const folders = {
    "pictures": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"],
    "scripts": [".exe", ".py", ".js"],
    "archives": [".zip", ".rar", ".tar", ".7z"]
};

const directories = {
    "pictures": "D:\\stab\\avatar",
    "scripts": "D:\\agony",
    "archives": "D:\\xanax"
};

async function runOrganizer() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'directory',
            message: 'Enter the path of the directory:',
            default: process.cwd()
        }
    ]);

    let currentDir = answers.directory;

    if (!currentDir.endsWith(path.sep)) {
        currentDir += path.sep;
    }

    if (!fs.existsSync(currentDir)) {
        console.error('Directory does not exist.');
        return;
    }

    for (const folder in directories) {
        const folderPath = directories[folder];
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
    }

    fs.readdir(currentDir, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return;
        }

        files.forEach(file => {
            if (file === 'organizer.js') return;

            const filePath = path.join(currentDir, file);
            if (fs.lstatSync(filePath).isDirectory()) return;

            let moved = false;

            for (const folder in folders) {
                const extensions = folders[folder];
                if (extensions.some(ext => file.toLowerCase().endsWith(ext))) {
                    if (folder === "scripts") {
                        const scriptFolder = path.join(directories[folder], file.replace(path.extname(file), ""));
                        if (!fs.existsSync(scriptFolder)) {
                            fs.mkdirSync(scriptFolder, { recursive: true });
                        }
                        const destination = path.join(scriptFolder, file);
                        fs.copyFileSync(filePath, destination);
                        fs.unlinkSync(filePath);
                        console.log(`Moved ${file} to ${scriptFolder}`);
                    } else {
                        const destination = path.join(directories[folder], file);
                        fs.copyFileSync(filePath, destination);
                        fs.unlinkSync(filePath);
                        console.log(`Moved ${file} to ${folder}`);
                    }
                    moved = true;
                    break;
                }
            }

            if (!moved) {
                const destination = path.join(currentDir, "uncategorized", file);
                if (!fs.existsSync(path.dirname(destination))) {
                    fs.mkdirSync(path.dirname(destination), { recursive: true });
                }
                fs.copyFileSync(filePath, destination);
                fs.unlinkSync(filePath);
                console.log(`Moved ${file} to uncategorized`);
            }
        });

        console.log("Job's finished...");
    });
}

runOrganizer();