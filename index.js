import { movies } from "./movie-data.js";
import { QdrantClient } from '@qdrant/js-client-rest';
import { FlagEmbedding } from "fastembed";
import { fixedSizeChunks, semanticChunks, sentenceChunks } from "./chunking.js";
import { randomUUID } from "crypto";

const embeddingModel = await FlagEmbedding.init();

const client = new QdrantClient({ url: 'http://127.0.0.1:6333' });

// const movieDescription = `A brilliant scientist discovers a new energy source.
// His invention transforms the world's economy.
// Years later, a detective investigates a series of mysterious crimes.
// The investigation reveals a conspiracy involving powerful corporations. Name of powerful corporation is same as scientist name.Tata aeris is a great engineered car.`
// console.log(movieDescription)
// console.log("Fixed:", fixedSizeChunks(movieDescription, 10));
// console.log("Sentence:", await sentenceChunks(movieDescription));
// console.log("Semantic:", await semanticChunks(movieDescription, 95));

// const points = [];

// for (const movie of movies) {
//     const fixedChunks = fixedSizeChunks(movie.description);
//     for (const chunk of fixedChunks) {
//         const vector = embeddingModel.embed(chunk);
//         points.push({
//             id: randomUUID(),
//             vector: vector,
//             payload: {
//                 text: chunk,
//                 movie_id: movie.id,
//                 movie_name: movie.name,
//                 year: movie.year,
//                 author: movie.author,
//                 chunking: "fixed"
//             }
//         })
//     }

//     const sentenceChunksValues = await sentenceChunks(movie.description)
//     for (const chunk of sentenceChunksValues) {
//         const vector = embeddingModel.embed(chunk);
//         points.push({
//             id: randomUUID(),
//             vector: vector,
//             payload: {
//                 text: chunk,
//                 movie_id: movie.id,
//                 movie_name: movie.name,
//                 year: movie.year,
//                 author: movie.author,
//                 chunking: "sentence"
//             }
//         })
//     }

//     const semanticChunksValues = await semanticChunks(movie.description)
//     for (const chunk of semanticChunksValues) {
//         const vector = embeddingModel.embed(chunk);
//         points.push({
//             id: randomUUID(),
//             vector: vector,
//             payload: {
//                 text: chunk,
//                 movie_id: movie.id,
//                 movie_name: movie.name,
//                 year: movie.year,
//                 author: movie.author,
//                 chunking: "semantic"
//             }
//         })
//     }
// }

// const response = await client.upsert("movies", {
//     points,
//     wait: true,
// });

// console.log(response);
