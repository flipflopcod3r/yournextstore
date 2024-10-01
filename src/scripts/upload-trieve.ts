import NextEnv from "@next/env";
import * as Commerce from "commerce-kit";
import { mapProducts } from "commerce-kit/internal";
import { type ChunkReqPayload, TrieveSDK } from "trieve-ts-sdk";

// Load environment variables
NextEnv.loadEnvConfig(".");

const { env } = await import("@/env.mjs"); // Import env variables

const datasetId = env.TRIEVE_DATASET_ID; // Access the dataset ID
const apiKey = env.TRIEVE_API_KEY; // Access the API key

// Check if the necessary environment variables are present
if (!datasetId || !apiKey) {
    console.error("Missing TRIEVE_API_KEY or TRIEVE_DATASET_ID");
    process.exit(1);
}

// Initialize the Trieve SDK with the API key and dataset ID
export const trieve = new TrieveSDK({ apiKey, datasetId });

// Initialize Stripe with the secret key
const stripe = Commerce.provider({
    secretKey: env.STRIPE_SECRET_KEY,
    tagPrefix: undefined,
});

// Fetch a list of products from Stripe
const data = await stripe.products.list({
    limit: 100,
    active: true,
    expand: ["data.default_price"],
});

// Map the products to the format expected by Trieve
const chunks = mapProducts(data).flatMap((product): ChunkReqPayload | ChunkReqPayload[] => {
    if (!product.default_price.unit_amount) {
        return [];
    }
    const link = product.metadata.variant
        ? `/product/${product.metadata.slug}?variant=${product.metadata.variant}`
        : `/product/${product.metadata.slug}`;
    return {
        chunk_html: `
Product Name: ${product.name}

Description: ${product.description}
`.trim(),
        image_urls: product.images,
        tracking_id: product.id,
        upsert_by_tracking_id: true,
        link,
        metadata: {
            name: product.name,
            description: product.description,
            slug: product.metadata.slug,
            image_url: product.images[0],
            amount: product.default_price.unit_amount,
            currency: product.default_price.currency,
        } satisfies TrieveProductMetadata,
    };
});

// Create a chunk in Trieve with the prepared data
const r = await trieve.createChunk(chunks);

console.log("Done", r);

// Define the metadata type for Trieve products
export type TrieveProductMetadata = {
    name: string;
    description: string | null;
    slug: string;
    image_url: string | undefined;
    amount: number;
    currency: string;
};
