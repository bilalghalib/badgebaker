const fs = require('fs');
const PNG = require('pngjs').PNG;
const extractChunks = require('png-chunks-extract');
const encodeChunks = require('png-chunks-encode');
const textChunk = require('png-chunk-text');

function bakeBadge(inputPath, outputPath, url, callback) {
    const inputData = fs.readFileSync(inputPath);
    const chunks = extractChunks(inputData);

    // Remove any existing openbadges chunks
    const filteredChunks = chunks.filter(chunk => !(chunk.type === 'tEXt' && textChunk.decode(chunk.data).keyword === 'openbadges'));

    // Add new openbadges chunk
    const badgeChunk = textChunk.encode('openbadges', url);
    filteredChunks.splice(1, 0, badgeChunk); // Insert after the first chunk (usually IHDR)
    
    const outputData = encodeChunks(filteredChunks);
    fs.writeFileSync(outputPath, Buffer.from(outputData));

    if (typeof callback === 'function') callback();
}

function readChunks(inputPath) {
    const buffer = fs.readFileSync(inputPath);
    let offset = 8; // Skip the first 8 bytes of the PNG header

    while (offset < buffer.length) {
        const length = buffer.readUInt32BE(offset);
        const type = buffer.toString('ascii', offset + 4, offset + 8);
        const data = buffer.slice(offset + 8, offset + 8 + length);
        const crc = buffer.readUInt32BE(offset + 8 + length);

        console.log(`Chunk Type: ${type}, Length: ${length}, CRC: ${crc}`);
        if (type === 'tEXt') {
            console.log('Found tEXt chunk:', textChunk.decode(data));
        }

        if (type === 'IEND') break;
        offset += length + 12; // Move to the next chunk
    }
}

// Example usage
bakeBadge('./input.png', './output.png', 'http://example.com/badge-assertion', function() {
    readChunks('./output.png');
});
