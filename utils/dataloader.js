// utils/dataLoader.js
export const loadTopic = async (id) => {
  try {
    // For development, we'll use dynamic import
    const topic = await import(`../data/lecture${id}.json`);
    return topic.default || topic;
  } catch (error) {
    console.error(`Error loading topic ${id}:`, error);
    throw new Error(`Failed to load topic ${id}`);
  }
};