export const AVATARS = [
    { id: 'afterclap-1', name: 'Afterclap 1', emoji: '💕' },
    { id: 'afterclap-2', name: 'Afterclap 2', emoji: '😍' },
    { id: 'afterclap-3', name: 'Afterclap 3', emoji: '🥰' },
    { id: 'afterclap-4', name: 'Afterclap 4', emoji: '💖' },
    { id: 'afterclap-5', name: 'Afterclap 5', emoji: '💝' },
    { id: 'afterclap-6', name: 'Afterclap 6', emoji: '🎀' },
    { id: 'afterclap-7', name: 'Afterclap 7', emoji: '✨' },
    { id: 'afterclap-8', name: 'Afterclap 8', emoji: '🌹' },
    { id: 'afterclap-9', name: 'Afterclap 9', emoji: '🦋' },
];

export function getAvatarEmoji(avatarId: string): string {
    const avatar = AVATARS.find(a => a.id === avatarId);
    return avatar?.emoji || '💕';
}

// Returns an image URL for the selected avatar.
// Images are served from assets/avatars/Afterclap-1.png ... Afterclap-9.png
export function getAvatarUrl(avatarId: string): string {
    // Extract numeric id from afterclap-N format
    const match = avatarId.match(/afterclap-(\d+)/);
    const num = match ? parseInt(match[1], 10) : 1;
    if (num >= 1 && num <= 9) {
        return `/assets/avatars/Afterclap-${num}.png`;
    }
    return `/assets/avatars/Afterclap-1.png`;
}
