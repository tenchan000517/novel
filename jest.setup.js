// jest.setup.js
// テスト実行前のグローバル設定

// ストレージプロバイダーのモック設定
jest.mock('@/lib/storage', () => ({
    storageProvider: {
      readFile: jest.fn().mockResolvedValue('[]'),
      writeFile: jest.fn().mockResolvedValue(undefined),
      listFiles: jest.fn().mockResolvedValue([]),
      fileExists: jest.fn().mockImplementation(async (path) => true), // 必ず true を返す
      directoryExists: jest.fn().mockImplementation(async (path) => true), // 必ず true を返す
      deleteFile: jest.fn().mockResolvedValue(undefined),
      createDirectory: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn().mockResolvedValue(true),
      getUrl: jest.fn().mockResolvedValue('https://example.com/mockfile'),
    },
    // createStorageProvider関数のモックも追加
    createStorageProvider: jest.fn().mockImplementation(() => {
      // storageProviderと同じモックオブジェクトを返す
      return {
        readFile: jest.fn().mockResolvedValue('[]'),
        writeFile: jest.fn().mockResolvedValue(undefined),
        listFiles: jest.fn().mockResolvedValue([]),
        fileExists: jest.fn().mockImplementation(async () => true),
        directoryExists: jest.fn().mockImplementation(async () => true),
        deleteFile: jest.fn().mockResolvedValue(undefined),
        createDirectory: jest.fn().mockResolvedValue(undefined),
      };
    })
  }));
  
  // Octokit のモック設定
  jest.mock('@octokit/rest', () => ({
    Octokit: jest.fn().mockImplementation(() => ({
      rest: {
        repos: {
          getContent: jest.fn().mockResolvedValue({
            data: {
              type: 'file',
              content: Buffer.from('mock content').toString('base64'),
              sha: 'mock-sha',
            },
          }),
          createOrUpdateFileContents: jest.fn().mockResolvedValue({
            data: {
              content: {
                sha: 'new-mock-sha',
              },
            },
          }),
        },
        git: {
          getTree: jest.fn().mockResolvedValue({
            data: {
              tree: [
                { path: 'file1.txt', type: 'blob' },
                { path: 'file2.txt', type: 'blob' },
              ],
            },
          }),
        },
      },
    }))
  }));
  
  // Mock global fetch
  global.fetch = jest.fn();
  
  // Mock window.fs for file system access in tests
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'fs', {
      value: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        listFiles: jest.fn(),
      },
      writable: true,
    });
  }
  
  // Reset all mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });