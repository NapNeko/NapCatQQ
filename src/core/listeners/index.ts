export * from './NodeIKernelSessionListener';
export * from './NodeIKernelLoginListener';
export * from './NodeIKernelMsgListener';
export * from './NodeIKernelGroupListener';
export * from './NodeIKernelBuddyListener';
export * from './NodeIKernelProfileListener';
export * from './NodeIKernelRobotListener';
export * from './NodeIKernelProfileListener';
export * from './NodeIKernelTicketListener';
export * from './NodeIKernelStorageCleanListener';
export * from './NodeIKernelFileAssistantListener';
export * from './NodeIKernelSearchListener_Polyfill';

import type {
    NodeIKernelBuddyListener,
    NodeIKernelFileAssistantListener,
    NodeIKernelGroupListener,
    NodeIKernelLoginListener,
    NodeIKernelMsgListener,
    NodeIKernelProfileListener,
    NodeIKernelRobotListener,
    NodeIKernelSearchListener_Polyfill,
    NodeIKernelSessionListener,
    NodeIKernelStorageCleanListener,
    NodeIKernelTicketListener,
} from '.';

export type ListenerNamingMapping = {
    NodeIKernelSessionListener: NodeIKernelSessionListener;
    NodeIKernelLoginListener: NodeIKernelLoginListener;
    NodeIKernelMsgListener: NodeIKernelMsgListener;
    NodeIKernelGroupListener: NodeIKernelGroupListener;
    NodeIKernelBuddyListener: NodeIKernelBuddyListener;
    NodeIKernelProfileListener: NodeIKernelProfileListener;
    NodeIKernelRobotListener: NodeIKernelRobotListener;
    NodeIKernelTicketListener: NodeIKernelTicketListener;
    NodeIKernelStorageCleanListener: NodeIKernelStorageCleanListener;
    NodeIKernelFileAssistantListener: NodeIKernelFileAssistantListener;
    NodeIKernelSearchListener: NodeIKernelSearchListener_Polyfill;
};
