export const login = async (credentials: any) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email && credentials.password) {
        resolve({ token: 'mock-token' });
      } else {
        reject(new Error("Invalid email or password."));
      }
    }, 1000);
  });
};
