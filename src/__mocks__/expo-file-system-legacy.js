const DOCUMENT_DIRECTORY = 'file:///mock-documents/';
const CACHE_DIRECTORY = 'file:///mock-cache/';

let files;
let dirs;
let counter;

function reset() {
  files = new Map();
  dirs = new Set([DOCUMENT_DIRECTORY, CACHE_DIRECTORY]);
  counter = 0;
}
reset();

module.exports = {
  documentDirectory: DOCUMENT_DIRECTORY,
  cacheDirectory: CACHE_DIRECTORY,
  __reset: reset,

  getInfoAsync: async (uri) => {
    if (dirs.has(uri)) {
      return { exists: true, isDirectory: true, uri };
    }
    if (files.has(uri)) {
      const entry = files.get(uri);
      return { exists: true, isDirectory: false, uri, size: entry.content.length, modificationTime: entry.mtime };
    }
    return { exists: false, isDirectory: false, uri };
  },

  makeDirectoryAsync: async (uri) => {
    dirs.add(uri);
  },

  readDirectoryAsync: async (uri) => {
    const names = [];
    for (const path of files.keys()) {
      if (path.startsWith(uri)) names.push(path.slice(uri.length));
    }
    return names;
  },

  writeAsStringAsync: async (uri, content) => {
    counter += 1;
    files.set(uri, { content, mtime: counter });
  },

  readAsStringAsync: async (uri) => {
    if (!files.has(uri)) throw new Error(`ENOENT: ${uri}`);
    return files.get(uri).content;
  },

  deleteAsync: async (uri, options) => {
    if (!files.has(uri)) {
      if (options && options.idempotent) return;
      throw new Error(`ENOENT: ${uri}`);
    }
    files.delete(uri);
  },
};
