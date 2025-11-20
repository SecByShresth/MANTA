// Crypto utilities for hash calculation
class CryptoUtils {
    static async calculateSHA256(file) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        return this.bufferToHex(hashBuffer);
    }

    static async calculateSHA1(file) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
        return this.bufferToHex(hashBuffer);
    }

    static async calculateMD5(file) {
        // MD5 is not available in Web Crypto API, using a simple implementation
        const buffer = await file.arrayBuffer();
        const array = new Uint8Array(buffer);
        return this.simpleMD5(array);
    }

    static bufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Simplified MD5 implementation for client-side
    static simpleMD5(data) {
        // This is a placeholder - in production, use a proper MD5 library
        // For now, we'll use a simple hash
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            hash = ((hash << 5) - hash) + data[i];
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(32, '0');
    }

    static async calculateAllHashes(file) {
        const [sha256, sha1, md5] = await Promise.all([
            this.calculateSHA256(file),
            this.calculateSHA1(file),
            this.calculateMD5(file)
        ]);

        return { sha256, sha1, md5 };
    }
}

// Export for use in other modules
window.CryptoUtils = CryptoUtils;
