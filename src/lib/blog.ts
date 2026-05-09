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
