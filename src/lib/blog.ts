import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export function blogSlug(post: BlogPost) {
	return post.id.replace(/\.mdx?$/, '');
}

export function blogPath(post: BlogPost) {
	return `/blog/${blogSlug(post)}/`;
}

export async function getPublishedBlogPosts() {
	const posts = await getCollection('blog');

	return posts
		.filter((post) => !post.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function estimateReadingTime(body: string | undefined): number {
	if (!body) return 1;
	const words = body.trim().split(/\s+/).length;
	return Math.max(1, Math.ceil(words / 200));
}
