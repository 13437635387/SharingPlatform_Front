import axios from "axios";
export const getArticleList = () => axios.get("/api/article/get");
