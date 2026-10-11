
import { AutoTokenizer } from "@huggingface/transformers";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const MODEL = "Xenova/all-MiniLM-L6-v2";
const MAX_TOKENS = 40;

const tokenizer = await AutoTokenizer.from_pretrained(MODEL);

// 1. Fixed-size token chunking
export function fixedSizeChunks(text, size = MAX_TOKENS) {
    const tokens = tokenizer.encode(text, {
        add_special_tokens: false,
    });

    const chunks = [];

    for (let i = 0; i < tokens.length; i += size) {
        chunks.push(
            tokenizer.decode(tokens.slice(i, i + size), {
                skip_special_tokens: true,
            })
        );
    }

    return chunks;

}

// 2. Sentence-aware chunking with overlap
// Split at sentence/paragraph boundaries and measure size in tokens.
export async function sentenceChunks(text) {
    const normalized = text.replace(/([.?!])([A-Za-z])/g, "$1 $2");
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: MAX_TOKENS,
        chunkOverlap: 10,
        lengthFunction: (text) =>
            tokenizer.encode(text, {
                add_special_tokens: false,
            }).length,
        separators: ["\n\n", "\n", ". ", "? ", "! ", " ", ""],
    });

    return await splitter.splitText(normalized);
}

// 3. Semantic chunking
// Implemented separately below; requires sentence embeddings.
import { pipeline } from "@huggingface/transformers";

// Split text into sentences.
function splitSentences(text) {
    // Ensure missing space after punctuation followed by a letter is handled
    const normalized = text.replace(/([.?!])([A-Za-z])/g, "$1 $2");
    const segmenter = new Intl.Segmenter("en", {
        granularity: "sentence",
    });

    return [...segmenter.segment(normalized)]
        .map(({ segment }) => segment.trim())
        .filter(Boolean);
}

// Calculate cosine similarity between two vectors.
function cosineSimilarity(a, b) {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Find the percentile threshold.
function percentile(values, p) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;

    return sorted[Math.max(0, index)];
}

// Load the embedding model once.
const embedder = await pipeline("feature-extraction", MODEL);

// 3. Semantic chunking
export async function semanticChunks(text, percentileThreshold = 95) {
    const sentences = splitSentences(text);

    if (sentences.length <= 1) {
        return sentences;
    }

    // Generate one embedding per sentence.
    const output = await embedder(sentences, {
        pooling: "mean",
        normalize: true,
    });

    const embeddings = output.tolist();

    // Measure semantic dissimilarity between adjacent sentences.
    const distances = [];

    for (let i = 0; i < embeddings.length - 1; i++) {
        distances.push(
            1 - cosineSimilarity(embeddings[i], embeddings[i + 1])
        );
    }

    const threshold = percentile(distances, percentileThreshold);

    // Create a new chunk wherever dissimilarity meets or exceeds the threshold.
    const chunks = [];
    let currentChunk = [sentences[0]];

    for (let i = 0; i < distances.length; i++) {
        if (distances[i] >= threshold) {
            chunks.push(currentChunk.join(" "));
            currentChunk = [];
        }

        currentChunk.push(sentences[i + 1]);
    }

    if (currentChunk.length) {
        chunks.push(currentChunk.join(" "));
    }

    return chunks;
}
