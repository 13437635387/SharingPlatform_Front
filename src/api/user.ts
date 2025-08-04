import http from "@/util/http";
// 注册
export const userRegisterService = (data: object) => {
  return http.post("api/user/register", data);
};

// 登录
export const userLoginService = (data: object) => {
  return http.post("api/user/login", data);
};
