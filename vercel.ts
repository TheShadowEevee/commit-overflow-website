import { defineConfig } from "@vercel/config";

export default defineConfig({
	regions: ["iad1"],
	headers: [
		{
			source: "/api/(.*)",
			headers: [
				{
					key: "Cache-Control",
					value: "public, max-age=10, s-maxage=60, stale-while-revalidate=300",
				},
			],
		},
		{
			source: "/_astro/(.*)",
			headers: [
				{
					key: "Cache-Control",
					value: "public, max-age=31536000, immutable",
				},
			],
		},
		{
			source: "/favicon.svg",
			headers: [
				{
					key: "Cache-Control",
					value: "public, max-age=86400",
				},
			],
		},
		{
			source: "/manifest.json",
			headers: [
				{
					key: "Cache-Control",
					value: "public, max-age=86400",
				},
			],
		},
	],
});
