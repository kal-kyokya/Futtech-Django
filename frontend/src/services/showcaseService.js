import apiClient from '/.apiClient';

class ShowcaseService {
    async fetchShowcaseVideos(limit = 12) {
	const response = await apiClient.get('/public/showcase/', {
	    params: { limit },
	});
	return response.data;
    }

    async fetchShowcaseVideo(slug) {
	const response = await apiClient.get(`/public/showcase/${slug}/`);
	return response.data;
    }
}

export default new ShowcaseService();
