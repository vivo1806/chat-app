export const generateMessage = (text) => {
  return {
    text,
    createdAt: new Date().getTime(),
  };
};

export const generateLocationMessage = (url) => {
  console.log("check2");
  return {
    url,
    createdAt: new Date().getTime(),
  };
};
