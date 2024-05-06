let LoginRuntime = {
    LoginCurrentTime: Date.now(),
    LoginCurrentRate: 0
}
export const Data = {
    checkLoginRate: async function (RateLimit: number): Promise<boolean> {
        if (Date.now() - LoginRuntime.LoginCurrentTime > 1000 * 60) {
            LoginRuntime.LoginCurrentRate = 0;//超出时间重置限速
            return true;
        }
        if (LoginRuntime.LoginCurrentRate <= RateLimit) {
            LoginRuntime.LoginCurrentRate++;
            return true;
        }
        return false;
    }
}