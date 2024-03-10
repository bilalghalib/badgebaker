// Vercel serverless function example
const { PNG } = require('pngjs');
const extractChunks = require('png-chunks-extract');
const encodeChunks = require('png-chunks-encode');
const textChunk = require('png-chunk-text');

module.exports = async (req, res) => {

    if (req.query.test) {
        return res.json({ message: 'Hello World!' });
    }
    try {
        // Assume the badge image is sent as a base64 string and URL in the body
        const { base64Image, badgeUrl } = req.body;

        // Convert base64 string to buffer
        const imageData = Buffer.from(base64Image, 'base64');

        // Process the badge (similar logic as in your bakeBadge function)
        const chunks = extractChunks(imageData);
        const filteredChunks = chunks.filter(chunk => !(chunk.type === 'tEXt' && textChunk.decode(chunk.data).keyword === 'openbadges'));
        const badgeChunk = textChunk.encode('openbadges', badgeUrl);
        filteredChunks.splice(1, 0, badgeChunk); // Insert after the first chunk
        const outputData = encodeChunks(filteredChunks);

        // Set response headers for image download
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'attachment; filename=baked-badge.png');

        // Send the processed badge image
        res.send(Buffer.from(outputData));
    } catch (error) {
        console.error('Error processing badge:', error);
        res.status(500).send('An error occurred while processing the badge.');
    }
};
