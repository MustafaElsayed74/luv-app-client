export const AVATARS = [
    { id: 'avatar-1', name: '💕', emoji: '💕' },
    { id: 'avatar-2', name: '😍', emoji: '😍' },
    { id: 'avatar-3', name: '🥰', emoji: '🥰' },
    { id: 'avatar-4', name: '💖', emoji: '💖' },
    { id: 'avatar-5', name: '💝', emoji: '💝' },
    { id: 'avatar-6', name: '🎀', emoji: '🎀' },
    { id: 'avatar-7', name: '✨', emoji: '✨' },
    { id: 'avatar-8', name: '🌹', emoji: '🌹' },
    { id: 'avatar-9', name: '🦋', emoji: '🦋' },
    { id: 'avatar-10', name: '⭐', emoji: '⭐' },
    { id: 'avatar-11', name: '🌟', emoji: '🌟' },
    { id: 'avatar-12', name: '💫', emoji: '💫' },
];

export function getAvatarEmoji(avatarId: string): string {
    const avatar = AVATARS.find(a => a.id === avatarId);
    return avatar?.emoji || '💕';
}

// Returns an image URL for the selected avatar.
// Images are served from public/assets/avatars/avatar-1.png ... avatar-12.png
export function getAvatarUrl(avatarId: string): string {
    // Prefer numeric id parsing to avoid array index issues
    const match = avatarId.match(/avatar-(\d+)/);
    const num = match ? parseInt(match[1], 10) : 1;
    if (num >= 1 && num <= 12) {
        return `/assets/avatars/avatar-${num}.png`;
    }
    return `/assets/avatars/avatar-1.png`;
}
