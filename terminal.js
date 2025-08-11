// terminal.js
document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalPrompt = document.getElementById('terminal-prompt');
    const labScript = document.querySelector('script[data-lab]');
    const currentLab = labScript ? labScript.dataset.lab : null;

    // A simple, static file system for the simulation
    let filesystem = {
        'home': {
            'projects': {},
            'documents': {},
            'file1.txt': 'This is a sample file.',
            'readme.md': 'This is a readme file.',
            '.gitignore': 'A hidden file.'
        }
    };
    let currentPath = 'home';

    // Update the terminal prompt to reflect the current path
    const updatePrompt = () => {
        terminalPrompt.textContent = `user@devops-lab:~/${currentPath}$`;
    };

    // Helper function to add a new line to the terminal output
    const addOutputLine = (text, isCommand = false) => {
        const pre = document.createElement('pre');
        pre.classList.add('terminal-line');
        if (isCommand) {
            pre.innerHTML = `<span class="terminal-prompt">${terminalPrompt.textContent}</span> ${text}`;
        } else {
            pre.textContent = text;
        }
        terminalOutput.appendChild(pre);
        // Scroll to the bottom
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    // Clear the terminal screen
    const clearTerminal = () => {
        terminalOutput.innerHTML = '';
    };

    // Function to handle the 'ls' command
    const handleLsCommand = (commandParts) => {
        let currentDir = filesystem;
        const pathParts = currentPath.split('/').filter(p => p);
        pathParts.forEach(part => {
            if (currentDir[part]) {
                currentDir = currentDir[part];
            }
        });

        // Simple ls logic for a flat structure
        const showAll = commandParts.includes('-a') || commandParts.includes('-la') || commandParts.includes('-al');
        const showLong = commandParts.includes('-l') || commandParts.includes('-la') || commandParts.includes('-al');
        
        let output = '';
        for (const [name, content] of Object.entries(currentDir)) {
            if (!showAll && name.startsWith('.')) {
                continue; // Skip hidden files if -a is not used
            }
            if (showLong) {
                // Simulate long format output
                const isDir = typeof content === 'object';
                const permissions = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
                const owner = 'user';
                const size = 4096; // Dummy size
                const date = 'Jan 1 00:00'; // Dummy date
                output += `${permissions} 1 ${owner} staff ${size} ${date} ${name}\n`;
            } else {
                output += `${name}  `;
            }
        }
        addOutputLine(output);
    };

    // Function to handle the 'cd' command
    const handleCdCommand = (commandParts) => {
        const targetDir = commandParts[1];
        if (!targetDir || targetDir === '~') {
            currentPath = 'home'; // Go back to home
            addOutputLine('');
        } else if (targetDir === '..') {
            const pathParts = currentPath.split('/').filter(p => p);
            if (pathParts.length > 1) {
                pathParts.pop();
                currentPath = pathParts.join('/');
            }
            addOutputLine('');
        } else {
            let currentDir = filesystem;
            const pathParts = currentPath.split('/').filter(p => p);
            pathParts.forEach(part => {
                currentDir = currentDir[part];
            });

            // Check if the target directory exists and is a directory
            if (currentDir[targetDir] && typeof currentDir[targetDir] === 'object') {
                currentPath += `/${targetDir}`;
                addOutputLine('');
            } else {
                addOutputLine(`cd: ${targetDir}: No such file or directory`);
            }
        }
        updatePrompt();
    };

    // Main command handler
    const handleCommand = (command) => {
        const commandParts = command.trim().split(' ').filter(part => part);
        const baseCommand = commandParts[0];

        addOutputLine(command, true); // Echo the command

        if (baseCommand === 'ls') {
            if (currentLab === 'lab1' || currentLab === 'lab2') {
                handleLsCommand(commandParts);
            } else {
                addOutputLine('ls: command not found');
            }
        } else if (baseCommand === 'cd') {
            if (currentLab === 'lab2') {
                handleCdCommand(commandParts);
            } else {
                addOutputLine('cd: command not found');
            }
        } else if (baseCommand === 'clear') {
            clearTerminal();
        } else if (baseCommand) {
            addOutputLine(`${baseCommand}: command not found`);
        }
    };

    // Event listener for the input field
    if (terminalInput) {
        terminalInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const command = terminalInput.value;
                if (command.trim() !== '') {
                    handleCommand(command);
                    terminalInput.value = ''; // Clear input field
                } else {
                    addOutputLine('', true); // Just add a blank line
                }
            }
        });
    }

    updatePrompt(); // Initial prompt update
});
