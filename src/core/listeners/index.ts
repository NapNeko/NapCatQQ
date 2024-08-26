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

import type {
    NodeIKernelSessionListener,
    NodeIKernelLoginListener,
    NodeIKernelMsgListener,
    NodeIKernelGroupListener,
    NodeIKernelBuddyListener,
    NodeIKernelProfileListener,
    NodeIKernelRobotListener,
    NodeIKernelTicketListener,
    NodeIKernelStorageCleanListener,
    NodeIKernelFileAssistantListener,
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
};
