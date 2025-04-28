import Monogatari from 'monogatari';  // Import Monogatari directly

window.addEventListener('DOMContentLoaded', async () => {
    const monogatari = new Monogatari();

    // Fetch latest story from backend
    try {
        const response = await fetch('/api/latest-story');
        const data = await response.json();

        if (data.success) {
            const story = data.story;
            console.log('Loaded story:', story);

            monogatari.setting('Title', story.title || 'Financial Visual Novel');
            monogatari.setting('Author', story.author || 'Financial AI');
            
            if (story.assets) monogatari.assets(story.assets);
            if (story.characters) monogatari.characters(story.characters);
            if (story.script) monogatari.script(story.script);

            // Start the novel
            monogatari.start();
        } else {
            console.error('Failed to load latest story:', data.error);
        }
    } catch (error) {
        console.error('Error fetching latest story:', error);
    }
});
