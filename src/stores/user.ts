import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore(
  "user",
  () => {
    const username = ref("");
    const password = ref();
    const remember = ref(false);
    const userPic =
      "https://ts1.tc.mm.bing.net/th/id/OIP-C.UyaBji0AU_6M3VDA2F1RvgAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3";
    const token = ref("");
    const getToken = () => {
      return token.value;
    };
    return {
      username,
      password,
      remember,
      userPic,
      getToken,
    };
  },
  {
    persist: true,
  }
);
