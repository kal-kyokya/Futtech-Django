const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

export const resolveVideoThumbnail = video => {
    if (!video || typeof video !== 'object') {
	return null;
    }

    const thumbnailCandidates = [
	video.thumbnail_url,
	video.thumbnailUrl,
	video.thumbnail,
	video.previewImage,
    ];

    return thumbnailCandidates.find(isNonEmptyString) ?? null;
};

export default resolveVideoThumbnail;
