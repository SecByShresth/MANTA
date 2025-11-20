// Entropy calculation for detecting packed/encrypted sections
class EntropyCalculator {
    static calculate(data) {
        const frequency = new Array(256).fill(0);
        const dataArray = new Uint8Array(data);

        // Count byte frequencies
        for (let i = 0; i < dataArray.length; i++) {
            frequency[dataArray[i]]++;
        }

        // Calculate entropy
        let entropy = 0;
        const length = dataArray.length;

        for (let i = 0; i < 256; i++) {
            if (frequency[i] > 0) {
                const probability = frequency[i] / length;
                entropy -= probability * Math.log2(probability);
            }
        }

        return entropy;
    }

    static calculateBySection(arrayBuffer, sectionSize = 1024) {
        const data = new Uint8Array(arrayBuffer);
        const sections = [];

        for (let i = 0; i < data.length; i += sectionSize) {
            const end = Math.min(i + sectionSize, data.length);
            const section = data.slice(i, end);
            const entropy = this.calculate(section);

            sections.push({
                offset: i,
                size: section.length,
                entropy: entropy
            });
        }

        return sections;
    }

    static analyze(arrayBuffer) {
        const overallEntropy = this.calculate(arrayBuffer);
        const sections = this.calculateBySection(arrayBuffer);

        // Calculate statistics
        const entropies = sections.map(s => s.entropy);
        const avgEntropy = entropies.reduce((a, b) => a + b, 0) / entropies.length;
        const maxEntropy = Math.max(...entropies);
        const minEntropy = Math.min(...entropies);

        // Find high entropy sections (possible encryption/packing)
        const highEntropySections = sections.filter(s => s.entropy > 7.0);

        // Determine if file is likely packed/encrypted
        const isPacked = overallEntropy > 7.2 || highEntropySections.length > sections.length * 0.3;

        return {
            overall: overallEntropy,
            average: avgEntropy,
            max: maxEntropy,
            min: minEntropy,
            sections: sections,
            highEntropySections: highEntropySections,
            isPacked: isPacked,
            packingConfidence: this.calculatePackingConfidence(overallEntropy, highEntropySections.length, sections.length)
        };
    }

    static calculatePackingConfidence(entropy, highEntropyCount, totalSections) {
        let confidence = 0;

        // High overall entropy
        if (entropy > 7.5) confidence += 40;
        else if (entropy > 7.2) confidence += 25;
        else if (entropy > 7.0) confidence += 10;

        // High entropy sections ratio
        const ratio = highEntropyCount / totalSections;
        if (ratio > 0.5) confidence += 40;
        else if (ratio > 0.3) confidence += 25;
        else if (ratio > 0.1) confidence += 10;

        // Uniform distribution suggests encryption
        if (entropy > 7.8) confidence += 20;

        return Math.min(confidence, 100);
    }

    static getEntropyLevel(entropy) {
        if (entropy < 4.0) return { level: 'Very Low', color: '#10b981', description: 'Highly structured data' };
        if (entropy < 5.5) return { level: 'Low', color: '#3b82f6', description: 'Normal executable data' };
        if (entropy < 6.5) return { level: 'Medium', color: '#f59e0b', description: 'Compressed or mixed data' };
        if (entropy < 7.5) return { level: 'High', color: '#ef4444', description: 'Possibly packed/encrypted' };
        return { level: 'Very High', color: '#dc2626', description: 'Likely encrypted/packed' };
    }

    static createChartData(sections) {
        return {
            labels: sections.map((s, i) => `${(s.offset / 1024).toFixed(1)}KB`),
            values: sections.map(s => s.entropy.toFixed(2)),
            colors: sections.map(s => {
                const level = this.getEntropyLevel(s.entropy);
                return level.color;
            })
        };
    }
}

window.EntropyCalculator = EntropyCalculator;
