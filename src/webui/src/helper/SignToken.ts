import crypto from 'crypto';
import store from '@/common/store';
export class AuthHelper {
    private static readonly secretKey = Math.random().toString(36).slice(2);

    /**
     * 签名凭证方法。
     * @param token 待签名的凭证字符串。
     * @returns 签名后的凭证对象。
     */
    public static signCredential(token: string): WebUiCredentialJson {
        const innerJson: WebUiCredentialInnerJson = {
            CreatedTime: Date.now(),
            TokenEncoded: token,
        };
        const jsonString = JSON.stringify(innerJson);
        const hmac = crypto.createHmac('sha256', AuthHelper.secretKey).update(jsonString, 'utf8').digest('hex');
        return { Data: innerJson, Hmac: hmac };
    }

    /**
     * 检查凭证是否被篡改的方法。
     * @param credentialJson 凭证的JSON对象。
     * @returns 布尔值，表示凭证是否有效。
     */
    public static checkCredential(credentialJson: WebUiCredentialJson): boolean {
        try {
            const jsonString = JSON.stringify(credentialJson.Data);
            const calculatedHmac = crypto
                .createHmac('sha256', AuthHelper.secretKey)
                .update(jsonString, 'utf8')
                .digest('hex');
            return calculatedHmac === credentialJson.Hmac;
        } catch (error) {
            return false;
        }
    }

    /**
     * 验证凭证在1小时内有效且token与原始token相同。
     * @param token 待验证的原始token。
     * @param credentialJson 已签名的凭证JSON对象。
     * @returns 布尔值，表示凭证是否有效且token匹配。
     */
    public static validateCredentialWithinOneHour(token: string, credentialJson: WebUiCredentialJson): boolean {
        // 首先检查凭证是否被篡改
        const isValid = AuthHelper.checkCredential(credentialJson);
        if (!isValid) {
            return false;
        }

        // 检查凭证是否在黑名单中
        if (AuthHelper.isCredentialRevoked(credentialJson)) {
            return false;
        }

        const currentTime = Date.now() / 1000;
        const createdTime = credentialJson.Data.CreatedTime;
        const timeDifference = currentTime - createdTime;

        return timeDifference <= 3600 && credentialJson.Data.TokenEncoded === token;
    }

    /**
     * 注销指定的Token凭证
     * @param credentialJson 凭证JSON对象
     * @returns void
     */
    public static revokeCredential(credentialJson: WebUiCredentialJson): void {
        const jsonString = JSON.stringify(credentialJson.Data);
        const hmac = crypto.createHmac('sha256', AuthHelper.secretKey).update(jsonString, 'utf8').digest('hex');

        // 将已注销的凭证添加到黑名单中，有效期1小时
        store.set(`revoked:${hmac}`, true, 3600);
    }

    /**
     * 检查凭证是否已被注销
     * @param credentialJson 凭证JSON对象
     * @returns 布尔值，表示凭证是否已被注销
     */
    public static isCredentialRevoked(credentialJson: WebUiCredentialJson): boolean {
        const jsonString = JSON.stringify(credentialJson.Data);
        const hmac = crypto.createHmac('sha256', AuthHelper.secretKey).update(jsonString, 'utf8').digest('hex');

        return store.exists(`revoked:${hmac}`) > 0;
    }
}
