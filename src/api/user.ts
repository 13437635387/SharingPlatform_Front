import http from "@/util/http";
// 注册
export const userRegisterService = (data: object) => {
  return http.post("/api/user/register", data);
};

// 登录
export const userLoginService = (data: object) => {
  return http.post("/api/user/login", data);
};

//更新用户信息
export const updateUserInfoService = (data: object) => {
  return http.post("/my/userinfo/update", data);
};

//获取用户头像
export const getUserAvatarService = () => {
  return http.get("/my/userinfo/getAvatar");
};

//根据token获取用户信息
export const getUserInfoService = () => {
  return http.get("/my/userinfo/getInfo");
};

//根据用户id获取用户信息
export const getUserInfoByIdService = (id: number) => {
  return http.get("/api/user/getInfo", {
    params: {
      id,
    },
  });
};
