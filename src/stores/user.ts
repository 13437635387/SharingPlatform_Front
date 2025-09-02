import { ElMessage } from "element-plus";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore(
  "user",
  () => {
    const username = ref("");
    const password = ref(); //仓库里存密码是为了使用当前账号的记住密码功能
    const remember = ref(false);
    const userPic = ref(
      "https://ts1.tc.mm.bing.net/th/id/OIP-C.UyaBji0AU_6M3VDA2F1RvgAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
    );
    const userId = ref();
    const token = ref("");
    // 清空用户信息：退出登录
    const logout = () => {
      username.value = "";
      password.value = "";
      remember.value = false;
      userPic.value =
        "https://ts1.tc.mm.bing.net/th/id/OIP-C.UyaBji0AU_6M3VDA2F1RvgAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3";
      token.value = "";
      userId.value = "";
      ElMessage.success("已退出!");
    };
    return {
      username,
      password,
      remember,
      userPic,
      userId,
      token,
      logout,
    };
  },
  {
    persist: true,
  }
);
