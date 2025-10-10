//用户信息规则
export type FormModel = {
  username: string;
  password: string;
  repassword: string;
};

// 获取用户信息返回的格式
export type UserInfoType = {
  data: {
    id: number;
    username: string;
    user_pic: string;
    password: string;
  };
  message: string;
  status: number;
};

//分片格式
export type FileChunkType = {
  chunk: Blob;
  fileHash: string;
  chunkIndex: string;
  fileName: string;
};
