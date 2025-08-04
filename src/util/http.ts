import router from "@/router";
import { useUserStore } from "@/stores/user";

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { ElMessage } from "element-plus";

// 基地址
const baseURL: string = "http://localhost:8080";

// // 返回类型结构
// interface apiResult<T = any> {
//   status: number;
//   message: string;
//   data: T;
// }

const userStore = useUserStore();

const instance: AxiosInstance = axios.create({
  baseURL,
  timeout: 1000000,
});
// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(userStore.token);

    if (userStore.token) {
      console.log("eee");

      config.headers = {
        ...config.headers,
        Authorization: userStore.token,
      } as AxiosRequestHeaders;
      console.log(config.headers.Authorization);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data.status === 0) {
      return response.data;
    } else {
      ElMessage.error(response.data.message || "请求失败");
      return Promise.reject(response.data);
    }
  },
  (error: AxiosError) => {
    const errorMessage = (error.response?.data as { message?: string })?.message || "服务器错误";
    ElMessage.error(errorMessage);

    // 401 跳转登录
    if (error.response?.status === 401) {
      router.push("/login");
    }

    return Promise.reject(error);
  }
);

export default instance;
export { baseURL };
