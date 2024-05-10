//远端rkey获取
class ServerRkeyWrapper {
    serverUrl: string = "";
    GroupRkey: string = "";
    PrivateRkey: string = "";
    expired_time: number = 0;
    async Init(ServerUrl: string) {
        this.serverUrl = ServerUrl;
    }
    async GetGroupRkey(): Promise<string> {
        if (await this.IsRkeyExpired()) {
            await this.RefreshRkey();
        }
        return this.GroupRkey;
    }
    async GetPrivateRkey(): Promise<string> {
        if (await this.IsRkeyExpired()) {
            await this.RefreshRkey();
        }
        return this.PrivateRkey;
    }
    async IsRkeyExpired(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let now = new Date().getTime();
            if (now > this.expired_time || this.expired_time == 0) {
                resolve(true);
            } else {
                resolve(false);
            }
            reject("error");
        });
    }
    async RefreshRkey(): Promise<any> {
        //刷新rkey
        let data = await this.Internal_RefreshRkey();
        this.GroupRkey = data.group_rkey;
        this.PrivateRkey = data.private_rkey;
        this.expired_time = data.expired_time;
    }
    async Internal_RefreshRkey(): Promise<any> {
        return new Promise((resolve, reject) => {
            fetch(this.serverUrl)
                .then(response => {
                    if (!response.ok) {
                        reject(response.statusText); // 请求失败，返回错误信息
                    }
                    return response.json(); // 解析 JSON 格式的响应体
                })
                .then(data => {
                    resolve(data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}
export const serverRkey = new ServerRkeyWrapper();