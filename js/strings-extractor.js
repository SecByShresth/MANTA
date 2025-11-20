// String extraction from binary files
class StringsExtractor {
    static extract(arrayBuffer, minLength = 4) {
        // Limit string extraction to first 10MB for performance
        const MAX_EXTRACT_SIZE = 10 * 1024 * 1024; // 10MB
        const extractSize = Math.min(arrayBuffer.byteLength, MAX_EXTRACT_SIZE);

        const data = new Uint8Array(arrayBuffer, 0, extractSize);
        const strings = {
            ascii: [],
            unicode: [],
            suspicious: []
        };

        // Limit total strings to prevent memory issues
        const MAX_STRINGS = 5000;

        // Extract ASCII strings
        let currentString = '';
        for (let i = 0; i < data.length && strings.ascii.length < MAX_STRINGS; i++) {
            const byte = data[i];
            if (byte >= 32 && byte <= 126) {
                currentString += String.fromCharCode(byte);
            } else {
                if (currentString.length >= minLength) {
                    strings.ascii.push(currentString);
                    if (this.isSuspicious(currentString)) {
                        strings.suspicious.push({ type: 'ASCII', value: currentString });
                    }
                }
                currentString = '';
            }
        }

        // Extract Unicode strings (UTF-16LE)
        currentString = '';
        for (let i = 0; i < data.length - 1 && strings.unicode.length < MAX_STRINGS; i += 2) {
            const byte1 = data[i];
            const byte2 = data[i + 1];

            if (byte2 === 0 && byte1 >= 32 && byte1 <= 126) {
                currentString += String.fromCharCode(byte1);
            } else {
                if (currentString.length >= minLength) {
                    strings.unicode.push(currentString);
                    if (this.isSuspicious(currentString)) {
                        strings.suspicious.push({ type: 'Unicode', value: currentString });
                    }
                }
                currentString = '';
            }
        }

        return {
            ascii: strings.ascii.slice(0, 1000), // Limit to first 1000
            unicode: strings.unicode.slice(0, 1000),
            suspicious: strings.suspicious,
            totalAscii: strings.ascii.length,
            totalUnicode: strings.unicode.length,
            totalSuspicious: strings.suspicious.length
        };
    }

    static isSuspicious(str) {
        const suspiciousPatterns = [
            // Network indicators
            /https?:\/\//i,
            /ftp:\/\//i,
            /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,

            // File operations
            /temp|tmp|appdata/i,
            /\.exe|\.dll|\.bat|\.cmd|\.vbs|\.ps1/i,

            // Registry
            /HKEY_|HKLM|HKCU|SOFTWARE\\|CurrentVersion/i,

            // Suspicious APIs
            /VirtualAlloc|VirtualProtect|CreateRemoteThread|WriteProcessMemory/i,
            /LoadLibrary|GetProcAddress|WinExec|ShellExecute/i,
            /URLDownloadToFile|InternetOpen|InternetReadFile/i,
            /CreateProcess|RegSetValue|RegCreateKey/i,

            // Crypto/encoding
            /base64|encrypt|decrypt|cipher|AES|RSA|RC4/i,

            // Suspicious words
            /payload|inject|exploit|backdoor|rootkit|keylog/i,
            /malware|virus|trojan|ransomware|worm/i,
            /password|credential|token|cookie/i,

            // Commands
            /cmd\.exe|powershell|wscript|cscript/i,
            /net user|net localgroup|schtasks|at\.exe/i,

            // Persistence
            /startup|run|runonce|autorun/i,
            /service|driver|kernel/i
        ];

        return suspiciousPatterns.some(pattern => pattern.test(str));
    }

    static categorize(strings) {
        const categories = {
            urls: [],
            ips: [],
            files: [],
            registry: [],
            apis: [],
            crypto: [],
            commands: [],
            other: []
        };

        strings.forEach(str => {
            if (/https?:\/\//i.test(str)) categories.urls.push(str);
            else if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(str)) categories.ips.push(str);
            else if (/\.(exe|dll|bat|cmd|vbs|ps1)/i.test(str)) categories.files.push(str);
            else if (/HKEY_|SOFTWARE\\/i.test(str)) categories.registry.push(str);
            else if (/VirtualAlloc|LoadLibrary|CreateProcess/i.test(str)) categories.apis.push(str);
            else if (/encrypt|decrypt|AES|RSA/i.test(str)) categories.crypto.push(str);
            else if (/cmd\.exe|powershell|net user/i.test(str)) categories.commands.push(str);
            else categories.other.push(str);
        });

        return categories;
    }
}

window.StringsExtractor = StringsExtractor;
