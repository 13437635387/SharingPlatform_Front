import http from "@/util/http";
// 注册
export const userRegisterService = (data: object) => {
  return http.post("api/user/register", data);
};

// 登录
export const userLoginService = (data: object) => {
  return http.post("api/user/login", data);
};

//更新用户信息
export const updateUserInfoService = (data: object) => {
  return http.post("/my/userinfo/update", data);
};
