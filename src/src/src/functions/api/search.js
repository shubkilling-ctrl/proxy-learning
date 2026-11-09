
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const query = (url.searchParams.get("q") || "").trim();
  const type = url.searchParams.get("type") || "video";

  const allowedTypes = ["video", "channel", "playlist"];

  if (!query) {
    return Response.json(
      { error: "Please enter something to search." },
      { status: 400 }
    );
  }

  if (!allowedTypes.includes(type)) {
    return Response.json(
      { error: "Invalid search type." },
      { status: 400 }
    );
  }

  if (!env.YOUTUBE_API_KEY) {
    return Response.json(
      { error: "YouTube API key is not configured." },
      { status: 500 }
    );
  }

  const apiUrl = new URL(
    "https://www.googleapis.com/youtube/v3/search"
  );

  apiUrl.search = new URLSearchParams({
    part: "snippet",
    q: query,
    type,
    maxResults: "20",
    key: env.YOUTUBE_API_KEY
  }).toString();

  try {
    const response = await fetch(apiUrl.toString());
    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: data.error?.message || "YouTube search failed." },
        { status: response.status }
      );
    }

    const results = (data.items || []).map((item) => {
      const id = item.id || {};
      const snippet = item.snippet || {};

      let resourceId = "";

      if (type === "video") resourceId = id.videoId;
      if (type === "channel") resourceId = id.channelId;
      if (type === "playlist") resourceId = id.playlistId;

      return {
        id: resourceId,
        kind: type,
        videoId: type === "video" ? resourceId : "",
        channelId: type === "channel" ? resourceId : snippet.channelId,
        playlistId: type === "playlist" ? resourceId : "",
        title: snippet.title || "Untitled",
        thumbnail:
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url ||
          "",
        channelTitle: snippet.channelTitle || "",
        description: snippet.description || ""
      };
    }).filter((item) => item.id);

    return Response.json(
      { results },
      {
        headers: {
          "Cache-Control": "public, max-age=300"
        }
      }
    );
  } catch (error) {
    return Response.json(
      { error: "Unable to connect to YouTube. Please try again." },
      { status: 500 }
    );
  }
        }
        
