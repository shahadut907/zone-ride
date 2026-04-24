const MOCK_DELAY_MS = 400;

const delay = (ms: number = MOCK_DELAY_MS): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data));

export const mockGet = async <T>(data: T): Promise<T> => {
  await delay();
  return clone(data);
};

export const mockPost = async <T>(data: T): Promise<T> => {
  await delay();
  return clone(data);
};

export const mockPatch = async <T>(data: T): Promise<T> => {
  await delay(200);
  return clone(data);
};

export const mockDelete = async (): Promise<{ success: boolean }> => {
  await delay(200);
  return { success: true };
};
