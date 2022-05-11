import nodeFetch from "node-fetch";

export const fetch: typeof nodeFetch = async (...args) => {
  const response = await nodeFetch(...args);
  const { status, statusText, text } = response;
  if (status >= 400 && status < 600) {
    const baseError = `${status} ${statusText}`;
    try {
      const responseText = await text();
      throw new Error(`${baseError}: ${responseText}`);
    } catch {
      throw new Error(baseError);
    }
  }
  return response;
};
