import http from "@/util/http";

// 获取文章列表
export const getArticleList = () => http.get("/api/article/get");

//获取当前登录用户文章列表
export const getUserArticleList = (userId: number) => {
  console.log("userId:", userId);

  return http.get("/my/articleinfo/getUserArticle", { params: { userId } });
};

//新增文章  --图片
export const addArticleService = (data: object) => {
  return http.post("my/articleinfo/add", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

//上传视频
export const addArticleVideoService = (data: object) => {
  return http.post("my/articleinfo/addVideo", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 文件切片合并请求
export const mergeRequest = (data: object) => {
  return http.post("/my/articleinfo/merge", data);
};

// 添加大文件文章
export const addLargeFileArticleService = (data: object) => {
  return http.post("/my/articleinfo/addArticleLargeFile", data);
};

// 秒传
export const checkFileRequest = (data: object) => {
  return http.post("/my/articleinfo/checkFile", data);
};

//搜索文章
export const searchArticleService = (str: string) => {
  return http.get("/api/article/search", { params: { keywords: str } });
};

//删除文章
export const deleteArticleService = (id: number) => {
  return http.post("/my/articleinfo/deleteArticle", { data: { id } });
};

//编辑文章
export const editArticleService = (data: object) => {
  return http.post("/my/articleinfo/editArticle", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
