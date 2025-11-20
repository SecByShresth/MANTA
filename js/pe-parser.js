// PE (Portable Executable) Parser for Windows executables
class PEParser {
    constructor(arrayBuffer) {
        this.buffer = arrayBuffer;
        this.view = new DataView(arrayBuffer);
        this.data = new Uint8Array(arrayBuffer);
    }

    parse() {
        try {
            // Check DOS signature
            const dosSignature = this.view.getUint16(0, true);
            if (dosSignature !== 0x5A4D) { // "MZ"
                return { error: 'Not a valid PE file (missing MZ signature)' };
            }

            // Get PE header offset
            const peOffset = this.view.getUint32(0x3C, true);

            // Check PE signature
            const peSignature = this.view.getUint32(peOffset, true);
            if (peSignature !== 0x00004550) { // "PE\0\0"
                return { error: 'Not a valid PE file (missing PE signature)' };
            }

            const result = {
                dosHeader: this.parseDOSHeader(),
                fileHeader: this.parseFileHeader(peOffset + 4),
                optionalHeader: this.parseOptionalHeader(peOffset + 24),
                sections: this.parseSections(peOffset),
                imports: this.parseImports(peOffset),
                exports: this.parseExports(peOffset),
                resources: this.parseResources(peOffset)
            };

            return result;
        } catch (error) {
            return { error: `PE parsing error: ${error.message}` };
        }
    }

    parseDOSHeader() {
        return {
            signature: this.readString(0, 2),
            lastPageBytes: this.view.getUint16(2, true),
            pages: this.view.getUint16(4, true),
            relocations: this.view.getUint16(6, true),
            headerSize: this.view.getUint16(8, true),
            peOffset: this.view.getUint32(0x3C, true)
        };
    }

    parseFileHeader(offset) {
        const machine = this.view.getUint16(offset, true);
        const machineTypes = {
            0x014c: 'I386',
            0x0200: 'IA64',
            0x8664: 'AMD64',
            0x01c0: 'ARM',
            0xaa64: 'ARM64'
        };

        return {
            machine: machineTypes[machine] || `Unknown (0x${machine.toString(16)})`,
            numberOfSections: this.view.getUint16(offset + 2, true),
            timeDateStamp: new Date(this.view.getUint32(offset + 4, true) * 1000).toISOString(),
            pointerToSymbolTable: this.view.getUint32(offset + 8, true),
            numberOfSymbols: this.view.getUint32(offset + 12, true),
            sizeOfOptionalHeader: this.view.getUint16(offset + 16, true),
            characteristics: this.parseCharacteristics(this.view.getUint16(offset + 18, true))
        };
    }

    parseOptionalHeader(offset) {
        const magic = this.view.getUint16(offset, true);
        const is64bit = magic === 0x20b;

        return {
            magic: is64bit ? 'PE32+' : 'PE32',
            majorLinkerVersion: this.view.getUint8(offset + 2),
            minorLinkerVersion: this.view.getUint8(offset + 3),
            sizeOfCode: this.view.getUint32(offset + 4, true),
            sizeOfInitializedData: this.view.getUint32(offset + 8, true),
            sizeOfUninitializedData: this.view.getUint32(offset + 12, true),
            addressOfEntryPoint: '0x' + this.view.getUint32(offset + 16, true).toString(16),
            baseOfCode: '0x' + this.view.getUint32(offset + 20, true).toString(16),
            imageBase: is64bit ?
                '0x' + this.view.getBigUint64(offset + 24, true).toString(16) :
                '0x' + this.view.getUint32(offset + 28, true).toString(16),
            subsystem: this.parseSubsystem(this.view.getUint16(offset + (is64bit ? 68 : 68), true))
        };
    }

    parseSections(peOffset) {
        const numberOfSections = this.view.getUint16(peOffset + 6, true);
        const sizeOfOptionalHeader = this.view.getUint16(peOffset + 20, true);
        const sectionsOffset = peOffset + 24 + sizeOfOptionalHeader;

        const sections = [];
        for (let i = 0; i < numberOfSections; i++) {
            const sectionOffset = sectionsOffset + (i * 40);
            sections.push({
                name: this.readString(sectionOffset, 8).replace(/\0/g, ''),
                virtualSize: this.view.getUint32(sectionOffset + 8, true),
                virtualAddress: '0x' + this.view.getUint32(sectionOffset + 12, true).toString(16),
                sizeOfRawData: this.view.getUint32(sectionOffset + 16, true),
                pointerToRawData: this.view.getUint32(sectionOffset + 20, true),
                characteristics: this.parseSectionCharacteristics(this.view.getUint32(sectionOffset + 36, true))
            });
        }
        return sections;
    }

    parseImports(peOffset) {
        // Simplified import parsing - returns common suspicious imports
        const imports = [];
        const commonSuspicious = [
            'VirtualAlloc', 'VirtualProtect', 'CreateRemoteThread', 'WriteProcessMemory',
            'LoadLibrary', 'GetProcAddress', 'WinExec', 'ShellExecute', 'URLDownloadToFile',
            'InternetOpen', 'InternetReadFile', 'CreateProcess', 'RegSetValue', 'RegCreateKey'
        ];

        // This is a simplified version - full implementation would parse the import table
        return {
            count: 0,
            suspicious: [],
            note: 'Full import parsing requires backend analysis'
        };
    }

    parseExports(peOffset) {
        return {
            count: 0,
            note: 'Export parsing requires backend analysis'
        };
    }

    parseResources(peOffset) {
        return {
            count: 0,
            note: 'Resource parsing requires backend analysis'
        };
    }

    parseCharacteristics(value) {
        const flags = [];
        if (value & 0x0001) flags.push('RELOCS_STRIPPED');
        if (value & 0x0002) flags.push('EXECUTABLE_IMAGE');
        if (value & 0x0004) flags.push('LINE_NUMS_STRIPPED');
        if (value & 0x0008) flags.push('LOCAL_SYMS_STRIPPED');
        if (value & 0x0020) flags.push('LARGE_ADDRESS_AWARE');
        if (value & 0x0100) flags.push('32BIT_MACHINE');
        if (value & 0x0200) flags.push('DEBUG_STRIPPED');
        if (value & 0x1000) flags.push('SYSTEM');
        if (value & 0x2000) flags.push('DLL');
        return flags;
    }

    parseSectionCharacteristics(value) {
        const flags = [];
        if (value & 0x00000020) flags.push('CODE');
        if (value & 0x00000040) flags.push('INITIALIZED_DATA');
        if (value & 0x00000080) flags.push('UNINITIALIZED_DATA');
        if (value & 0x20000000) flags.push('EXECUTABLE');
        if (value & 0x40000000) flags.push('READABLE');
        if (value & 0x80000000) flags.push('WRITABLE');
        return flags;
    }

    parseSubsystem(value) {
        const subsystems = {
            1: 'NATIVE',
            2: 'WINDOWS_GUI',
            3: 'WINDOWS_CUI',
            5: 'OS2_CUI',
            7: 'POSIX_CUI',
            9: 'WINDOWS_CE_GUI',
            10: 'EFI_APPLICATION',
            11: 'EFI_BOOT_SERVICE_DRIVER',
            12: 'EFI_RUNTIME_DRIVER',
            13: 'EFI_ROM',
            14: 'XBOX',
            16: 'WINDOWS_BOOT_APPLICATION'
        };
        return subsystems[value] || `Unknown (${value})`;
    }

    readString(offset, length) {
        let str = '';
        for (let i = 0; i < length; i++) {
            const byte = this.data[offset + i];
            if (byte === 0) break;
            str += String.fromCharCode(byte);
        }
        return str;
    }
}

window.PEParser = PEParser;
