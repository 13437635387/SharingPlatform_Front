import SparkMD5 from "spark-md5";

// 说明：此 worker 用于在独立线程中把文件按索引切片并计算每个分片的局部 hash。
// 每个 worker 接收消息 { file, CHUNK_SIZE, start, end }，表示要处理的分片索引区间 [start, end)
// 返回值为数组：[{ index, start, end, blob, hash }, ...]
// 优点：避免主线程读取大型文件并计算 hash，减少卡顿；每个 worker 只返回 Blob 和局部 hash，主线程按 index 排序后合并。

// createChunk: 在 worker 中读取单个分片并计算该分片的局部 hash
function createChunk(file, index, chunkSize) {
  return new Promise((resolve, reject) => {
    try {
      const start = index * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const blob = file.slice(start, end);
      // 使用 FileReader 在 worker 中读取为 ArrayBuffer 并计算局部 hash
      const fr = new FileReader();
      fr.onload = (e) => {
        const ab = e.target.result;
        const spark = new SparkMD5.ArrayBuffer();
        spark.append(ab);
        const chunkHash = spark.end();
        // 返回分片信息，包含 blob（供上传使用）和局部 hash（供拼接计算全局 hash）
        resolve({ index, start, end, blob, hash: chunkHash });
      };
      fr.onerror = (err) => reject(err);
      fr.readAsArrayBuffer(blob);
    } catch (err) {
      reject(err);
    }
  });
}

// 接收主线程消息并处理指定索引区间
self.onmessage = async (e) => {
  const { file, CHUNK_SIZE, start, end } = e.data || {};
  if (!file || !CHUNK_SIZE || start === undefined || end === undefined) {
    postMessage({ type: "error", message: "missing params" });
    return;
  }

  try {
    const tasks = [];
    for (let i = start; i < end; i++) {
      tasks.push(createChunk(file, i, CHUNK_SIZE));
    }
    const chunks = await Promise.all(tasks);
    // 返回该区间的所有分片信息数组（主线程会扁平化并按 index 排序）
    postMessage(chunks);
  } catch (err) {
    postMessage({ type: "error", message: err?.message || String(err) });
  }
};
