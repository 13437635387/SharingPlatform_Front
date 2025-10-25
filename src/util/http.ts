// import { refreshTokenService } from "@/api/token";
import router from "@/router";

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";

type MyRequestConfig = InternalAxiosRequestConfig & { _isRefresh?: boolean };

// 基地址
const baseURL: string = "http://localhost:8080";

// const userStore = useUserStore();

const instance: AxiosInstance = axios.create({
  baseURL,
  timeout: 1000000,
});

// token刷新函数
const refreshTokenFun = async () => {
  console.log("进入refreshToken");
  const userStore = useUserStore();
  const res = await instance.get("/api/refreshToken", {
    headers: {
      Authorization: userStore.refreshToken,
    },
    _isRefresh: true, //判断现在发送的是不是刷新token的请求，避免请求拦截器携带了过期的短token
  } as MyRequestConfig);
  console.log("重新请求了:", res);
  const { refresh_token, access_token } = res.data;
  userStore.refreshToken = refresh_token;
  userStore.token = access_token;
};

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { _isRefresh?: boolean }) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers = {
        ...config.headers,
        Authorization: userStore.token,
      } as AxiosRequestHeaders;
    }
    if (config?._isRefresh) {
      config.headers = {
        ...config.headers,
        Authorization: userStore.refreshToken,
      } as AxiosRequestHeaders;
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
  async (error: AxiosError) => {
    const userStore = useUserStore();
    const errorMessage = (error.response?.data as { message?: string })?.message || "服务器错误";

    // 401 跳转登录
    if (error.response?.status === 401) {
      console.log("token失效了");

      if ((error.config as MyRequestConfig)?._isRefresh) {
        // 刷新token请求都失败了，说明刷新token也过期了，直接跳登录
        router.push("/login");
        ElMessage.error("请登录");
        return Promise.reject(error);
      }
      await refreshTokenFun();

      // 更新token后重新请求原始请求
      error.config!.headers = {
        ...error.config!.headers,
        Authorization: userStore.token,
      } as AxiosRequestHeaders;
      const res = await instance.request(error.config as InternalAxiosRequestConfig);
      return res;
    }
    ElMessage.error(errorMessage);
    return Promise.reject(error);
  }
);

export default instance;
export { baseURL };
