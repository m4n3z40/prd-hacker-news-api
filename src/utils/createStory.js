import slugify from 'slugify';
import timeSince from './timeSince.js';

export default function createStory(storyData) {
  return Object.assign({}, storyData, {
    slug: slugify(storyData.title, { lower: true, strict: true }),
    time_ago: timeSince(new Date(storyData.created_at + '.000Z')),
    kids: storyData.kids && storyData.kids !== '[null]' ? JSON.parse(storyData.kids) : [],
  });
}
