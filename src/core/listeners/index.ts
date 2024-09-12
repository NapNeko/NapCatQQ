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
export * from './NodeIKernelSearchListener';

import type {
    NodeIKernelBuddyListener,
    NodeIKernelFileAssistantListener,
    NodeIKernelGroupListener,
    NodeIKernelLoginListener,
    NodeIKernelMsgListener,
    NodeIKernelProfileListener,
    NodeIKernelRobotListener,
    NodeIKernelSessionListener,
    NodeIKernelStorageCleanListener,
    NodeIKernelTicketListener,
} from '.';
import { NodeIKernelSearchListener } from './NodeIKernelSearchListener';

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
    NodeIKernelSearchListener: NodeIKernelSearchListener;
};
