import { requestUrl } from "obsidian";

export const fetchTitleFromUrl = async (url: string) => {
	try {
		const response = await requestUrl({
			url,
			method: "GET",
			headers: {
				Cookie: "", // Clear any cookies
			},
		});

		const html = response.text;
		const parser = new DOMParser();
		const document = parser.parseFromString(html, "text/html");
		const title = document.querySelector("title");
		if (!title) {
			return null;
		}
		return title.innerText;
	} catch (error) {
		console.error(error);
		return null;
	}
};
