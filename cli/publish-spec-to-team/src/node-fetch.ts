import nodeFetch from "node-fetch";

export const fetch: typeof nodeFetch = async (...args) => {
  const response = await nodeFetch(...args);
  const { status, statusText, json } = response;
  if (status >= 400 && status < 600) {
    const baseError = `${status} ${statusText}`;
    try {
      const responseJSON = (await json()) as { error: string };
      throw new Error(`${baseError}: ${responseJSON.error}`);
    } catch {
      throw new Error(baseError);
    }
  }
  return response;
};
