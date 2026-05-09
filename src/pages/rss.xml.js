import rss from '@astrojs/rss';
import { site } from '../data/site';
import { blogPath, getPublishedBlogPosts } from '../lib/blog';

export async function GET(context) {
	const posts = await getPublishedBlogPosts();

	return rss({
		title: site.feed.title,
		description: site.feed.description,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: blogPath(post),
		})),
	});
}
