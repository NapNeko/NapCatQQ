export class githubApiManager {
    public async GetBaseData(): Promise<Response | null> {
        try {
            const ConfigResponse = await fetch('https://api.github.com/repos/NapNeko/NapCatQQ', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (ConfigResponse.status == 200) {
                return await ConfigResponse.json();
            }
        } catch (error) {
            console.error('Error getting  github data :', error);
        }
        return null;
    }
    public async GetReleasesData(): Promise<Response | null> {
        try {
            const ConfigResponse = await fetch('https://api.github.com/repos/NapNeko/NapCatQQ/releases', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (ConfigResponse.status == 200) {
                return await ConfigResponse.json();
            }
        } catch (error) {
            console.error('Error getting releases data:', error);
        }
        return null;
    }
    public async GetPullsData(): Promise<Response | null> {
        try {
            const ConfigResponse = await fetch('https://api.github.com/repos/NapNeko/NapCatQQ/pulls', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (ConfigResponse.status == 200) {
                return await ConfigResponse.json();
            }
        } catch (error) {
            console.error('Error getting Pulls data:', error);
        }
        return null;
    }
    public async GetContributors(): Promise<Response | null> {
        try {
            const ConfigResponse = await fetch('https://api.github.com/repos/NapNeko/NapCatQQ/contributors', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (ConfigResponse.status == 200) {
                return await ConfigResponse.json();
            }
        } catch (error) {
            console.error('Error getting Pulls data:', error);
        }
        return null;
    }
}
