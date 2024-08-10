import { IOB11NetworkAdapter } from '@/onebot/network/index';
import BaseAction from '@/onebot/action/BaseAction';
import { OB11BaseEvent } from '@/onebot/event/OB11BaseEvent';
import { NapCatOneBot11Adapter } from '../main';
import { NapCatCore } from '@/core';

export class OB11ActiveHttpAdapter implements IOB11NetworkAdapter {
    url: string;
    private actionMap: Map<string, BaseAction<any, any>> = new Map();
    obContext: NapCatOneBot11Adapter;
    coreContext: NapCatCore;

    constructor(obContext: NapCatOneBot11Adapter, coreContext: NapCatCore, url: string) {
        this.obContext = obContext;
        this.coreContext = coreContext
        this.url = url;
    }

    registerAction<T extends BaseAction<P, R>, P, R>(action: T) {
        this.actionMap.set(action.actionName, action);
    }

    onEvent<T extends OB11BaseEvent>(event: T) {
        fetch(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Event sent successfully:', data);
            })
            .catch(error => {
                console.error('Failed to send event:', error);
            });
    }

    async open() {
        // HTTP adapter does not need to establish a persistent connection
        console.log('HTTP adapter is ready to send events.');
    }

    close() {
        // HTTP adapter does not need to close a persistent connection
        console.log('HTTP adapter does not maintain a persistent connection.');
    }
}