//实现一个登录 仅需判断密码 没有用户名字段
export class Auth {
    public static async checkAuth(token: string) {
        if (token == "123456") {
            return true;
        }
        return false;
    }

}